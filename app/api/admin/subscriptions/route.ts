import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, subscriptions })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan, status, startDate, endDate, price, autoRenew } = body

    if (!userId || !plan || !status || !startDate || !endDate || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: parseInt(userId),
        plan: plan || null,
        planType: 'basic' as any, // Временное решение
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
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
