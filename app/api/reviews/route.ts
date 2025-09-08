import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserDataFromToken } from '../../../lib/serverUtils'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const executorId = searchParams.get('executorId')
    const clientId = searchParams.get('clientId')
    const reviewedId = searchParams.get('reviewedId') // Новый параметр для фильтрации по тому, на кого оставили отзыв
    const rating = searchParams.get('rating')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {}
    
    if (executorId) {
      where.executorId = parseInt(executorId)
    }
    
    if (clientId) {
      where.clientId = parseInt(clientId)
    }

    if (reviewedId) {
      where.reviewedId = parseInt(reviewedId)
    }
    
    if (rating) {
      where.rating = parseInt(rating)
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        executor: {
          select: {
            id: true,
            name: true
          }
        },
        order: {
          select: {
            id: true,
            serviceDescription: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await prisma.review.count({ where })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = getUserDataFromToken(authHeader)
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('API Reviews - Полученное тело запроса:', body)
    
    const { orderId, rating, comment, reviewerId, reviewedId, clientId, executorId } = body

    console.log('API Reviews - Извлеченные данные:', {
      orderId, rating, comment, reviewerId, reviewedId, clientId, executorId
    })

    // Валидация обязательных полей
    if (!orderId || !rating || !reviewerId || !reviewedId || !clientId || !executorId) {
      console.log('API Reviews - Ошибка валидации:', {
        orderId: !!orderId,
        rating: !!rating,
        reviewerId: !!reviewerId,
        reviewedId: !!reviewedId,
        clientId: !!clientId,
        executorId: !!executorId
      })
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    // Проверяем, что рейтинг в допустимом диапазоне
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть от 1 до 5' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли заказ
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что заказ завершен
    if (order.status !== 'completed') {
      return NextResponse.json(
        { error: 'Отзыв можно оставить только для завершенного заказа' },
        { status: 400 }
      )
    }

    // Проверяем, что у заказа есть исполнитель
    if (!order.executorId) {
      return NextResponse.json(
        { error: 'У заказа нет назначенного исполнителя' },
        { status: 400 }
      )
    }

    // Проверяем, не оставлял ли уже пользователь отзыв на этого участника заказа
    const existingReview = await prisma.review.findFirst({
      where: {
        orderId: parseInt(orderId),
        reviewerId: parseInt(reviewerId),
        reviewedId: parseInt(reviewedId)
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Вы уже оставляли отзыв на этого участника заказа' },
        { status: 400 }
      )
    }

    // Создаем отзыв
    console.log('API Reviews - Создание отзыва с данными:', {
      orderId: parseInt(orderId),
      clientId: parseInt(clientId),
      executorId: parseInt(executorId),
      reviewerId: parseInt(reviewerId),
      reviewedId: parseInt(reviewedId),
      rating: parseInt(rating),
      comment
    })

    const newReview = await prisma.review.create({
      data: {
        orderId: parseInt(orderId),
        clientId: parseInt(clientId),
        executorId: parseInt(executorId),
        reviewerId: parseInt(reviewerId),
        reviewedId: parseInt(reviewedId),
        rating: parseInt(rating),
        comment
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        executor: {
          select: {
            id: true,
            name: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        },
        reviewed: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Обновляем рейтинг того, на кого оставили отзыв
    const reviewedUser = await prisma.user.findUnique({
      where: { id: parseInt(reviewedId) },
      include: { executorProfile: true }
    })

    if (reviewedUser) {
      // Получаем все отзывы на этого пользователя
      const userReviews = await prisma.review.findMany({
        where: { reviewedId: parseInt(reviewedId) },
        select: { rating: true }
      })

      const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / userReviews.length

      if (reviewedUser.role === 'executor' && reviewedUser.executorProfile) {
        // Обновляем рейтинг исполнителя
        await prisma.executorProfile.update({
          where: { userId: parseInt(reviewedId) },
          data: {
            rating: averageRating,
            reviewsCount: userReviews.length
          }
        })
      } else if (reviewedUser.role === 'client') {
        // Обновляем рейтинг клиента
        await prisma.user.update({
          where: { id: parseInt(reviewedId) },
          data: {
            clientRating: averageRating,
            clientReviewsCount: userReviews.length
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Отзыв успешно создан',
      review: newReview
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Ошибка при создании отзыва' },
      { status: 500 }
    )
  }
}
