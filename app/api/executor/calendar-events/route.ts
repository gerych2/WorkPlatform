import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserDataFromToken } from '../../../../lib/serverUtils'

const prisma = new PrismaClient()

// Получение событий календаря исполнителя
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)

    if (!userData || userData.role !== 'executor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Получаем события календаря в указанном диапазоне дат
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        executorId: userData.id,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Получаем заказы исполнителя в указанном диапазоне дат
    const orders = await prisma.order.findMany({
      where: {
        executorId: userData.id,
        status: {
          in: ['pending', 'confirmed']
        },
        ...(startDate && endDate && {
          orderDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        orderDate: 'asc'
      }
    })

    // Преобразуем события календаря
    const calendarEventsFormatted = calendarEvents.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      duration: event.duration,
      description: event.description || '',
      type: event.type
    }))

    // Преобразуем заказы в события календаря
    const orderEvents = orders.map(order => ({
      id: `order-${order.id}`,
      title: order.serviceDescription,
      date: order.orderDate.toISOString().split('T')[0],
      time: order.orderTime,
      duration: order.estimatedDuration || 2,
      client: {
        name: order.client.name,
        phone: order.client.phone
      },
      address: order.address,
      status: order.status,
      price: order.totalPrice,
      description: order.notes || order.serviceDescription,
      type: 'order'
    }))

    // Объединяем события календаря и заказы
    const allEvents = [...calendarEventsFormatted, ...orderEvents]

    return NextResponse.json(allEvents)
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Создание нового события календаря
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)

    if (!userData || userData.role !== 'executor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { title, date, time, duration, description, type = 'personal' } = body

    // Создаем событие календаря
    const event = await prisma.calendarEvent.create({
      data: {
        executorId: userData.id,
        title,
        date: new Date(date),
        time,
        duration: duration || 1,
        description: description || '',
        type
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
