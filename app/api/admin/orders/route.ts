import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, price, status, priority, deadline, location, clientId, executorId } = body

    if (!title || !description || !category || !price || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        title: title || null,
        description: description || null,
        price: price ? parseFloat(price) : null,
        status: status || 'pending',
        priority: priority || 'medium',
        deadline: deadline ? new Date(deadline) : null,
        location: location || null,
        clientId: parseInt(clientId),
        executorId: executorId ? parseInt(executorId) : null,
        categoryId: 1, // Временное решение - используем первую категорию
        serviceDescription: description || 'Описание услуги',
        address: location || 'Адрес не указан',
        phone: 'Не указан',
        clientName: 'Клиент',
        orderDate: new Date(),
        orderTime: '10:00',
        totalPrice: price ? parseFloat(price) : 0
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
        }
      }
    })
    
    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
