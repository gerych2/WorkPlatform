import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = parseInt(params.id)
    const body = await request.json()
    const { userId, plan, status, startDate, endDate, price, autoRenew } = body

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 })
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        userId: parseInt(userId),
        plan: plan || null,
        price: price ? parseFloat(price) : null,
        autoRenew: autoRenew || false,
        status,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount: price ? parseFloat(price) : 0
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
    
    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subscriptionId = parseInt(params.id)

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 })
    }

    await prisma.subscription.delete({
      where: { id: subscriptionId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
