import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {}
    
    if (role) {
      where.role = role
    }
    
    if (status) {
      where.status = status
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        location: true,
        isVerified: true,
        legalStatus: true,
        registrationDate: true,
        lastLogin: true,
        executorProfile: {
          select: {
            description: true,
            experience: true,
            hourlyRate: true,
            categories: true,
            rating: true,
            reviewsCount: true,
            completedOrders: true
          }
        }
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        registrationDate: 'desc'
      }
    })

    const total = await prisma.user.count({ where })

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
