import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserDataFromToken } from '../../../lib/serverUtils'
import { gamificationService } from '../../../lib/gamification/gamificationService'

const prisma = new PrismaClient()

// Создание нового заказа
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating order with data:', body)
    
    const {
      categoryId,
      serviceDescription,
      address,
      phone,
      clientName,
      notes,
      orderDate,
      orderTime,
      totalPrice,
      priceType, // тип ценообразования: fixed, negotiable
      urgency, // срочность: low, medium, high
      estimatedDuration, // предполагаемая продолжительность в часах
      preferredTime, // предпочтительное время: morning, afternoon, evening, any
      specialRequirements, // особые требования
      executorId // ID выбранного исполнителя (опционально)
    } = body

    // Получаем текущего пользователя из заголовков
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = getUserDataFromToken(authHeader)
    
    if (!userData || userData.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can create orders' }, { status: 403 })
    }

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        clientId: userData.id,
        categoryId: parseInt(categoryId),
        serviceDescription,
        address,
        phone,
        clientName,
        notes,
        orderDate: new Date(orderDate),
        orderTime: orderTime, // Теперь это строка в формате "HH:MM"
        ...(totalPrice && { totalPrice: parseFloat(totalPrice) }),
        priceType: priceType || 'fixed',
        urgency: urgency || 'medium',
        estimatedDuration: estimatedDuration ? parseFloat(estimatedDuration) : null,
        preferredTime: preferredTime || 'any',
        specialRequirements: specialRequirements || null,
        status: 'pending',
        ...(executorId && { executorId: parseInt(executorId) })
      },
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
        }
      }
    })

    // Создаем уведомление
    if (executorId) {
      // Если выбран конкретный исполнитель, отправляем уведомление только ему
      await prisma.notification.create({
        data: {
          userId: parseInt(executorId),
          title: 'Новый заказ для вас',
          message: `Клиент ${clientName} создал заказ: "${serviceDescription}" на сумму ${totalPrice ? totalPrice + ' BYN' : 'по договоренности'}`,
          type: 'new_order'
        }
      })
    } else {
      // Если исполнитель не выбран, отправляем уведомление всем активным исполнителям в категории
      const activeExecutors = await prisma.user.findMany({
        where: {
          role: 'executor',
          status: 'active',
          subscriptions: {
            some: {
              status: 'active',
              endDate: {
                gte: new Date()
              }
            }
          },
          executorProfile: {
            categories: {
              has: parseInt(categoryId)
            }
          }
        },
        select: {
          id: true,
          name: true
        }
      })

      // Создаем уведомления для исполнителей
      const notifications = activeExecutors.map(executor => ({
        userId: executor.id,
        title: 'Новый заказ в вашей категории',
        message: `Поступил новый заказ: "${serviceDescription}" на сумму ${totalPrice ? totalPrice + ' BYN' : 'по договоренности'}`,
        type: 'new_order'
      }))

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        })
      }
    }

    // Добавляем XP за создание заказа
    try {
      await gamificationService.addXp(userData.id, {
        amount: 10, // XP за создание заказа
        source: 'order_creation',
        description: 'Создание заказа',
        metadata: { orderId: order.id, categoryId: order.categoryId }
      })
    } catch (error) {
      console.error('Error adding XP for order creation:', error)
      // Не прерываем выполнение, если геймификация не работает
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order,
      executorId: executorId ? parseInt(executorId) : null
    })

  } catch (error) {
    console.error('Error creating order:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', errorMessage)
    console.error('Stack trace:', errorStack)
    return NextResponse.json(
      { error: 'Failed to create order', details: errorMessage },
      { status: 500 }
    )
  }
}

// Получение заказов с фильтрацией
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const executorId = searchParams.get('executorId')
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const urgency = searchParams.get('urgency')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Получаем текущего пользователя
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)

    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Строим условия запроса
    const where: any = {}

    if (clientId) {
      where.clientId = parseInt(clientId)
    }

    if (executorId) {
      where.executorId = parseInt(executorId)
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    if (status) {
      where.status = status
    }

    if (urgency) {
      where.urgency = urgency
    }

    // Сохраняем поисковые условия отдельно
    let searchConditions = null
    if (search) {
      searchConditions = [
        {
          serviceDescription: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          address: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          notes: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          specialRequirements: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Если это исполнитель, проверяем подписку
    if (userData.role === 'executor') {
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
          error: 'Active subscription required to view orders',
          subscriptionRequired: true
        }, { status: 403 })
      }

      // Для исполнителей показываем только заказы в их категориях
      const executorProfile = await prisma.executorProfile.findUnique({
        where: { userId: userData.id }
      })

      // Исполнитель может видеть только свои заказы или заказы без исполнителя
      where.OR = [
        { executorId: userData.id }, // Заказы, которые он принял
        { executorId: null } // Заказы без исполнителя
      ]

      // Добавляем фильтрацию по категориям
      if (executorProfile && executorProfile.categories.length > 0) {
        where.categoryId = {
          in: executorProfile.categories
        }
      }

      // Если есть поисковые условия, добавляем их к OR
      if (searchConditions) {
        where.OR = [
          ...where.OR,
          ...searchConditions
        ]
      }
    } else {
      // Для клиентов и админов добавляем поисковые условия
      if (searchConditions) {
        where.OR = searchConditions
      }
    }

    // Получаем заказы
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
