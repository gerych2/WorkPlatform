import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const minRating = searchParams.get('minRating')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'rating'
    const order = searchParams.get('order') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {
      role: 'executor',
      status: 'active'
    }

    // Поиск по тексту (имя, описание)
    if (query) {
      where.OR = [
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
      where.executorProfile = {
        ...where.executorProfile,
        categories: {
          has: parseInt(category)
        }
      }
    }

    // Фильтр по местоположению
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    // Фильтр по минимальному рейтингу
    if (minRating) {
      where.executorProfile = {
        ...where.executorProfile,
        rating: {
          gte: parseFloat(minRating)
        }
      }
    }

    // Фильтр по максимальной цене
    if (maxPrice) {
      where.executorProfile = {
        ...where.executorProfile,
        hourlyRate: {
          lte: parseFloat(maxPrice)
        }
      }
    }

    // Сортировка
    let orderBy: any = {}
    if (sortBy === 'rating') {
      orderBy.executorProfile = {
        rating: order
      }
    } else if (sortBy === 'price') {
      orderBy.executorProfile = {
        hourlyRate: order
      }
    } else if (sortBy === 'experience') {
      orderBy.executorProfile = {
        completedOrders: order
      }
    } else if (sortBy === 'recent') {
      orderBy.registrationDate = order
    }

    const executors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        isVerified: true,
        registrationDate: true,
        lastLogin: true,
        executorProfile: {
          select: {
            description: true,
            experience: true,
            hourlyRate: true,
            categories: true,
            workingHours: true,
            responseTime: true,
            completedOrders: true,
            rating: true,
            reviewsCount: true
          }
        },
        _count: {
          select: {
            executorReviews: true
          }
        }
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: orderBy
    })

    const total = await prisma.user.count({ where })

    // Получаем категории для фильтров
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        icon: true
      }
    })

    return NextResponse.json({
      executors,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        query,
        category,
        location,
        minRating,
        maxPrice,
        sortBy,
        order
      }
    })
  } catch (error) {
    console.error('Error searching executors:', error)
    return NextResponse.json(
      { error: 'Failed to search executors' },
      { status: 500 }
    )
  }
}
