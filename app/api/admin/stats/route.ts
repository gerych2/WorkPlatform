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
      activeOrders,
      completedOrders,
      totalCategories,
      activeSubscriptions,
      pendingVerifications
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'executor' } }),
      prisma.user.count({ where: { role: 'client' } }),
      prisma.order.count(),
      prisma.order.count({ 
        where: { 
          status: { in: ['confirmed', 'in_progress'] } 
        } 
      }),
      prisma.order.count({ 
        where: { 
          status: 'completed' 
        } 
      }),
      prisma.category.count(),
      prisma.subscription.count({ 
        where: { 
          status: 'active' 
        } 
      }),
      prisma.executorProfile.count({ 
        where: { 
          verificationStatus: 'pending' 
        } 
      })
    ])

    // Вычисляем выручку
    const completedOrdersWithPrice = await prisma.order.findMany({
      where: { status: 'completed' },
      select: { totalPrice: true, orderDate: true }
    })

    const totalRevenue = completedOrdersWithPrice.reduce((sum, order) => {
      return sum + (order.totalPrice ? Number(order.totalPrice) : 0)
    }, 0)

    // Выручка за текущий месяц
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyRevenue = completedOrdersWithPrice
      .filter(order => new Date(order.orderDate) >= currentMonth)
      .reduce((sum, order) => {
        return sum + (order.totalPrice ? Number(order.totalPrice) : 0)
      }, 0)

    return NextResponse.json({
      totalUsers,
      totalExecutors,
      totalClients,
      totalOrders,
      activeOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
      totalCategories,
      activeSubscriptions,
      pendingVerifications
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Ошибка получения статистики' },
      { status: 500 }
    )
  }
}




