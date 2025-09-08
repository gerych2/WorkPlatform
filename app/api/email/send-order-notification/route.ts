import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '../../../../lib/email/emailService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { orderId, type } = await request.json()

    if (!orderId || !type) {
      return NextResponse.json(
        { error: 'Order ID and type are required' },
        { status: 400 }
      )
    }

    // Получаем данные заказа
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        client: {
          select: { email: true, name: true }
        },
        executor: {
          select: { email: true, name: true }
        },
        category: {
          select: { name: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    let success = false

    if (type === 'new_order' && order.executor?.email) {
      // Уведомление исполнителю о новом заказе
      success = await emailService.sendNewOrderNotification(
        order.executor.email,
        {
          id: order.id,
          serviceDescription: order.serviceDescription || order.category?.name,
          clientName: order.client?.name || order.clientName,
          address: order.address,
          phone: order.phone,
          orderDate: order.orderDate?.toLocaleDateString('ru-RU'),
          orderTime: order.orderTime,
          totalPrice: order.totalPrice
        }
      )
    } else if (type === 'completed' && order.client?.email) {
      // Уведомление клиенту о выполнении заказа
      success = await emailService.sendOrderCompletedNotification(
        order.client.email,
        {
          id: order.id,
          serviceDescription: order.serviceDescription || order.category?.name,
          executorName: order.executor?.name,
          totalPrice: order.totalPrice
        }
      )
    }

    return NextResponse.json({
      success,
      message: success ? 'Email sent successfully' : 'Failed to send email'
    })

  } catch (error) {
    console.error('Error sending order notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
