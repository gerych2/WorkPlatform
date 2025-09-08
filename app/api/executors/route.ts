import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение списка исполнителей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const minRating = searchParams.get('minRating')
    const maxPrice = searchParams.get('maxPrice')
    const location = searchParams.get('location')
    const verified = searchParams.get('verified')
    const sortBy = searchParams.get('sortBy') || 'rating'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')


    // Базовые условия для поиска
    const whereConditions: any = {
      role: 'executor',
      status: 'active',
      executorProfile: {
        isNot: null
      }
    }

    // Фильтр по текстовому запросу
    if (query) {
      whereConditions.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          executorProfile: {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Фильтр по категории
    if (category) {
      whereConditions.executorProfile = {
        ...whereConditions.executorProfile,
        categories: {
          has: parseInt(category)
        }
      }
    }

    // Фильтр по минимальному рейтингу
    if (minRating) {
      whereConditions.executorProfile = {
        ...whereConditions.executorProfile,
        rating: {
          gte: parseFloat(minRating)
        }
      }
    }

    // Фильтр по максимальной цене
    if (maxPrice) {
      whereConditions.executorProfile = {
        ...whereConditions.executorProfile,
        hourlyRate: {
          lte: parseFloat(maxPrice)
        }
      }
    }

    // Фильтр по местоположению
    if (location) {
      whereConditions.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    // Фильтр по верификации
    if (verified === 'true') {
      whereConditions.executorProfile = {
        ...whereConditions.executorProfile,
        isVerified: true
      }
    }

    // Определяем сортировку
    let orderBy: any = {}
    switch (sortBy) {
      case 'rating':
        orderBy = { executorProfile: { rating: 'desc' } }
        break
      case 'price':
        orderBy = { executorProfile: { hourlyRate: 'asc' } }
        break
      case 'reviews':
        orderBy = { executorProfile: { reviewsCount: 'desc' } }
        break
      case 'completed':
        orderBy = { executorProfile: { completedOrders: 'desc' } }
        break
      default:
        orderBy = { executorProfile: { rating: 'desc' } }
    }


    const executors = await prisma.user.findMany({
      where: whereConditions,
      include: {
        executorProfile: {
          select: {
            id: true,
            description: true,
            experience: true,
            hourlyRate: true,
            rating: true,
            reviewsCount: true,
            completedOrders: true,
            responseTime: true,
            categories: true,
            verificationStatus: true
          }
        },
        _count: {
          select: {
            executorReviews: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    })


    // Получаем общее количество для пагинации
    const totalCount = await prisma.user.count({
      where: whereConditions
    })

    return NextResponse.json({
      executors,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching executors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch executors' },
      { status: 500 }
    )
  }
}