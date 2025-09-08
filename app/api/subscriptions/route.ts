import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserDataFromToken } from '../../../lib/serverUtils'

const prisma = new PrismaClient()

// Получение подписок пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ subscriptions })

  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// Создание новой подписки
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, planType, amount, paymentMethod } = body

    // Получаем текущего пользователя
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)

    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (userData.id !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь является исполнителем
    if (userData.role !== 'executor') {
      return NextResponse.json({ error: 'Only executors can create subscriptions' }, { status: 403 })
    }

    // Проверяем, что пользователь существует в базе данных
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Определяем длительность подписки
    let durationDays = 1
    switch (planType) {
      case 'daily':
        durationDays = 1
        break
      case 'weekly':
        durationDays = 7
        break
      case 'monthly':
        durationDays = 30
        break
      default:
        return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Вычисляем даты начала и окончания
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    // Отменяем все активные подписки пользователя
    await prisma.subscription.updateMany({
      where: {
        userId: parseInt(userId),
        status: 'active'
      },
      data: {
        status: 'cancelled'
      }
    })

    // Создаем новую подписку
    const subscription = await prisma.subscription.create({
      data: {
        userId: parseInt(userId),
        planType,
        startDate,
        endDate,
        amount: parseFloat(amount),
        status: 'active',
        paymentMethod: paymentMethod || 'demo'
      }
    })

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, endDate, amount } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID подписки обязателен' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли подписка
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Подписка не найдена' },
        { status: 404 }
      )
    }

    // Обновляем подписку
    const updatedSubscription = await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(amount && { amount: parseFloat(amount) })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Подписка успешно обновлена',
      subscription: updatedSubscription
    })

  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении подписки' },
      { status: 500 }
    )
  }
}
