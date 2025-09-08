import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface ViolationResult {
  success: boolean
  message: string
  blockDuration?: number // в днях
  blockEndDate?: Date
}

export class ViolationSystem {
  // Создание нарушения за невыполненный заказ
  static async recordUncompletedOrder(executorId: number, orderId: number, reason?: string): Promise<ViolationResult> {
    try {
      // Получаем информацию об исполнителе
      const executor = await prisma.user.findUnique({
        where: { id: executorId },
        include: {
          violations: {
            where: {
              type: 'uncompleted_order',
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // За последние 30 дней
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!executor) {
        return { success: false, message: 'Исполнитель не найден' }
      }

      // Создаем запись о нарушении
      const violation = await prisma.violation.create({
        data: {
          executorId,
          orderId,
          type: 'uncompleted_order',
          reason: reason || 'Заказ не был выполнен в срок',
          severity: 1
        }
      })

      // Обновляем счетчик нарушений
      const newViolationsCount = executor.violationsCount + 1
      const now = new Date()

      let blockDuration = 0
      let blockEndDate: Date | undefined
      let blockReason = ''

      // Определяем уровень наказания
      if (newViolationsCount === 1) {
        // Первое нарушение - только предупреждение
        blockReason = 'Предупреждение за невыполненный заказ'
      } else if (newViolationsCount === 2) {
        // Второе нарушение - блокировка на 3 дня
        blockDuration = 3
        blockEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        blockReason = 'Блокировка на 3 дня за повторное невыполнение заказа'
      } else if (newViolationsCount === 3) {
        // Третье нарушение - блокировка на 7 дней
        blockDuration = 7
        blockEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        blockReason = 'Блокировка на 7 дней за систематическое невыполнение заказов'
      } else if (newViolationsCount >= 4) {
        // Четвертое и последующие нарушения - блокировка на 30 дней
        blockDuration = 30
        blockEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        blockReason = 'Блокировка на 30 дней за систематическое невыполнение заказов'
      }

      // Обновляем информацию об исполнителе
      await prisma.user.update({
        where: { id: executorId },
        data: {
          violationsCount: newViolationsCount,
          lastViolationDate: now,
          isBlocked: blockDuration > 0,
          blockStartDate: blockDuration > 0 ? now : null,
          blockEndDate: blockEndDate || null,
          blockReason: blockReason || null
        }
      })

      // Создаем уведомление для исполнителя
      await prisma.notification.create({
        data: {
          userId: executorId,
          type: 'violation',
          title: blockDuration > 0 ? 'Аккаунт заблокирован' : 'Предупреждение',
          message: blockReason,
          isRead: false
        }
      })

      // Если исполнитель заблокирован, возвращаем заказ в открытый поиск
      if (blockDuration > 0) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'pending',
            executorId: null
          }
        })
      }

      return {
        success: true,
        message: blockReason,
        blockDuration,
        blockEndDate
      }

    } catch (error) {
      console.error('Error recording violation:', error)
      return { success: false, message: 'Ошибка при записи нарушения' }
    }
  }

  // Проверка возможности отмены заказа (в течение 12 часов)
  static async canCancelOrder(executorId: number, orderId: number): Promise<boolean> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { executor: true }
      })

      if (!order || order.executorId !== executorId) {
        return false
      }

      // Проверяем, прошло ли 12 часов с момента принятия заказа
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
      return order.updatedAt > twelveHoursAgo

    } catch (error) {
      console.error('Error checking cancellation eligibility:', error)
      return false
    }
  }

  // Отмена заказа исполнителем (в течение 12 часов)
  static async cancelOrderByExecutor(executorId: number, orderId: number, reason?: string): Promise<ViolationResult> {
    try {
      const canCancel = await this.canCancelOrder(executorId, orderId)
      
      if (!canCancel) {
        return { success: false, message: 'Отмена заказа возможна только в течение 12 часов после принятия' }
      }

      // Возвращаем заказ в открытый поиск
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'pending',
          executorId: null
        }
      })

      // Создаем уведомление для клиента
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { client: true }
      })

      if (order) {
        await prisma.notification.create({
          data: {
            userId: order.clientId,
            type: 'order_cancelled',
            title: 'Заказ отменен исполнителем',
            message: `Исполнитель отменил заказ. ${reason || 'Причина не указана'}`,
            isRead: false
          }
        })
      }

      return { success: true, message: 'Заказ успешно отменен и возвращен в открытый поиск' }

    } catch (error) {
      console.error('Error cancelling order:', error)
      return { success: false, message: 'Ошибка при отмене заказа' }
    }
  }

  // Проверка блокировки исполнителя
  static async isExecutorBlocked(executorId: number): Promise<{ isBlocked: boolean; reason?: string; blockEndDate?: Date }> {
    try {
      const executor = await prisma.user.findUnique({
        where: { id: executorId }
      })

      if (!executor) {
        return { isBlocked: false }
      }

      // Проверяем, истекла ли блокировка
      if (executor.isBlocked && executor.blockEndDate && executor.blockEndDate <= new Date()) {
        // Разблокируем исполнителя
        await prisma.user.update({
          where: { id: executorId },
          data: {
            isBlocked: false,
            blockStartDate: null,
            blockEndDate: null,
            blockReason: null
          }
        })

        return { isBlocked: false }
      }

      return {
        isBlocked: executor.isBlocked,
        reason: executor.blockReason || undefined,
        blockEndDate: executor.blockEndDate || undefined
      }

    } catch (error) {
      console.error('Error checking executor block status:', error)
      return { isBlocked: false }
    }
  }

  // Получение истории нарушений исполнителя
  static async getExecutorViolations(executorId: number) {
    try {
      return await prisma.violation.findMany({
        where: { executorId },
        include: {
          order: {
            select: {
              id: true,
              serviceDescription: true,
              orderDate: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error fetching executor violations:', error)
      return []
    }
  }
}


