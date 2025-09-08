import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Получаем общую статистику
    const [
      totalUsers,
      totalExecutors,
      totalClients,
      totalOrders,
      totalCategories,
      totalReviews,
      pendingUsers,
      activeOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'executor' } }),
      prisma.user.count({ where: { role: 'client' } }),
      prisma.order.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.review.count(),
      prisma.user.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'in_progress' } })
    ])

    // Получаем топ категорий по количеству заказов
    const topCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        orderCount: true,
        executorCount: true
      },
      where: { isActive: true },
      orderBy: { orderCount: 'desc' },
      take: 10
    })

    // Получаем топ исполнителей по рейтингу
    const topExecutors = await prisma.user.findMany({
      where: {
        role: 'executor',
        status: 'active',
        executorProfile: {
          rating: { gt: 0 }
        }
      },
      select: {
        id: true,
        name: true,
        location: true,
        executorProfile: {
          select: {
            rating: true,
            completedOrders: true,
            categories: true
          }
        }
      },
      orderBy: {
        executorProfile: {
          rating: 'desc'
        }
      },
      take: 5
    })

    // Получаем статистику по месяцам (последние 6 месяцев)
    const monthlyStats = await prisma.order.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      }
    })

    return NextResponse.json({
      totalUsers,
      totalExecutors,
      totalClients,
      totalOrders,
      totalCategories,
      totalReviews,
      pendingUsers,
      activeOrders,
      topCategories,
      topExecutors,
      monthlyStats
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
