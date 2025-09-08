import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)
    const body = await request.json()
    const { title, description, category, price, status, priority, deadline, location, clientId, executorId } = body

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        title: title || null,
        description: description || null,
        price: price ? parseFloat(price) : null,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        location: location || null,
        clientId: parseInt(clientId),
        executorId: executorId ? parseInt(executorId) : null,
        serviceDescription: description || 'Описание услуги',
        address: location || 'Адрес не указан'
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
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id)

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    await prisma.order.delete({
      where: { id: orderId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
