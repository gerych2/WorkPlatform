import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserDataFromToken } from '../../../../lib/serverUtils'

const prisma = new PrismaClient()

// Отмена заказа клиентом
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, reason } = body

    // Получаем текущего пользователя
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)

    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userData.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can cancel their orders' }, { status: 403 })
    }

    // Проверяем, что заказ существует
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        executor: true,
        category: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Проверяем, что заказ принадлежит этому клиенту
    if (order.clientId !== userData.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Проверяем, что заказ можно отменить
    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 })
    }

    // Проверяем, можно ли отменить заказ (за 24 часа до начала)
    const orderDateTime = new Date(`${order.orderDate}T${order.orderTime}`)
    const now = new Date()
    const timeDiff = orderDateTime.getTime() - now.getTime()
    const hoursUntilOrder = timeDiff / (1000 * 60 * 60)
    
    // Если до заказа меньше 24 часов, отменять нельзя
    if (hoursUntilOrder < 24) {
      return NextResponse.json({ 
        error: 'Заказ нельзя отменить менее чем за 24 часа до начала' 
      }, { status: 400 })
    }

    // Обновляем статус заказа
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Отменен клиентом'
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

    // Создаем уведомление для исполнителя, если он был назначен
    if (order.executorId) {
      await prisma.notification.create({
        data: {
          userId: order.executorId,
          title: 'Заказ отменен клиентом',
          message: `Клиент ${userData.name} отменил заказ "${order.serviceDescription}". ${reason ? `Причина: ${reason}` : ''}`,
          type: 'order_cancelled'
        }
      })
    }

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}
