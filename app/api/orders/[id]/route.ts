import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserDataFromToken } from '../../../../lib/serverUtils'
import { ViolationSystem } from '../../../../lib/violationSystem'

const prisma = new PrismaClient()

// Получение детальной информации о заказе
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)
    console.log('API: Fetching order with ID:', orderId)

    // Получаем текущего пользователя
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)
    console.log('API: User data:', { id: userData.id, role: userData.role, name: userData.name })

    if (!userData) {
      console.log('API: No user data')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        category: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clientRating: true,
            clientReviewsCount: true
          }
        },
        executor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!order) {
      console.log('API: Order not found with ID:', orderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('API: Order found:', { 
      id: order.id, 
      clientId: order.clientId, 
      executorId: order.executorId,
      status: order.status 
    })

    // Проверяем права доступа
    if (userData.role === 'client' && order.clientId !== userData.id) {
      console.log('API: Access denied for client - order clientId:', order.clientId, 'user id:', userData.id)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (userData.role === 'executor') {
      // Исполнитель может видеть заказы, которые он принял, или заказы без исполнителя (для принятия)
      // Также может видеть заказы в своей категории для принятия
      if (order.executorId && order.executorId !== userData.id) {
        // Проверяем, работает ли исполнитель в этой категории
        const executorProfile = await prisma.executorProfile.findUnique({
          where: { userId: userData.id }
        })
        
        if (!executorProfile || !executorProfile.categories.includes(order.categoryId)) {
          console.log('API: Access denied for executor - not working in this category')
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      }
    }

    console.log('API: Access granted, returning order')
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Обновление заказа (принятие исполнителем)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)
    const body = await request.json()
    const { status, executorId } = body

    // Получаем текущего пользователя
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = getUserDataFromToken(authHeader)

    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что заказ существует
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        category: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Если исполнитель принимает заказ
    if (status === 'confirmed' && executorId) {
      // Проверяем, что пользователь является исполнителем
      if (userData.role !== 'executor') {
        return NextResponse.json({ error: 'Only executors can accept orders' }, { status: 403 })
      }

      // Проверяем, не заблокирован ли исполнитель
      const blockStatus = await ViolationSystem.isExecutorBlocked(userData.id)
      if (blockStatus.isBlocked) {
        return NextResponse.json({
          error: 'Исполнитель заблокирован',
          reason: blockStatus.reason,
          blockEndDate: blockStatus.blockEndDate
        }, { status: 403 })
      }

      // Проверяем, что у исполнителя есть активная подписка
      const hasActiveSubscription = await prisma.subscription.findFirst({
        where: {
          userId: userData.id,
          status: 'active',
          endDate: {
            gte: new Date()
          }
        }
      })

      if (!hasActiveSubscription) {
        return NextResponse.json({
          error: 'Active subscription required to accept orders',
          subscriptionRequired: true
        }, { status: 403 })
      }

      // Проверяем, что заказ еще не принят
      if (existingOrder.status !== 'pending') {
        return NextResponse.json({ error: 'Order is already taken' }, { status: 400 })
      }

      // Проверяем, что исполнитель работает в этой категории
      const executorProfile = await prisma.executorProfile.findUnique({
        where: { userId: userData.id }
      })

      if (!executorProfile || !executorProfile.categories.includes(existingOrder.categoryId)) {
        return NextResponse.json({ error: 'You cannot accept orders in this category' }, { status: 403 })
      }

      // Обновляем заказ
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'confirmed',
          executorId: userData.id
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          executor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: true
        }
      })

      // Создаем уведомление для клиента
      await prisma.notification.create({
        data: {
          userId: existingOrder.clientId,
          title: 'Заказ принят исполнителем',
          message: `Исполнитель ${userData.name} принял ваш заказ "${existingOrder.serviceDescription}"`,
          type: 'order_accepted'
        }
      })

      return NextResponse.json({
        message: 'Order accepted successfully',
        order: updatedOrder
      })
    }

    // Если исполнитель завершает заказ
    if (status === 'completed' && userData.role === 'executor' && userData.id === existingOrder.executorId) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'completed',
          completedAt: new Date()
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          executor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: true
        }
      })

      // Создаем уведомление для клиента
      await prisma.notification.create({
        data: {
          userId: existingOrder.clientId,
          title: 'Заказ выполнен',
          message: `Исполнитель ${userData.name} завершил ваш заказ "${existingOrder.serviceDescription}"`,
          type: 'order_completed'
        }
      })

      // Обновляем статистику исполнителя
      await prisma.executorProfile.update({
        where: { userId: userData.id },
        data: {
          completedOrders: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        message: 'Order completed successfully',
        order: updatedOrder
      })
    }

    // Если клиент обновляет заказ
    if (userData.role === 'client' && userData.id === existingOrder.clientId) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          executor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: true
        }
      })

      return NextResponse.json({
        message: 'Order updated successfully',
        order: updatedOrder
      })
    }

    // Если исполнитель отклоняет заказ
    if (status === 'cancelled' && userData.role === 'executor' && userData.id === existingOrder.executorId) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'cancelled',
          cancelledAt: new Date()
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          executor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: true
        }
      })

      // Создаем уведомление для клиента
      await prisma.notification.create({
        data: {
          userId: existingOrder.clientId,
          title: 'Заказ отклонен исполнителем',
          message: `Исполнитель ${userData.name} отклонил ваш заказ "${existingOrder.serviceDescription}"`,
          type: 'order_rejected'
        }
      })

      return NextResponse.json({
        message: 'Order rejected successfully',
        order: updatedOrder
      })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}



export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)

    // Проверяем, существует ли заказ
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Удаляем заказ
    await prisma.order.delete({
      where: { id: orderId }
    })

    // Обновляем счетчик заказов в категории
    await prisma.category.update({
      where: { id: existingOrder.categoryId },
      data: {
        orderCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Заказ успешно удален'
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении заказа' },
      { status: 500 }
    )
  }
}
