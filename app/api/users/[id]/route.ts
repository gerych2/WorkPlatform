import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение пользователя по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        executorProfile: {
          select: {
            id: true,
            description: true,
            experience: true,
            hourlyRate: true,
            categories: true,
            workingHours: true,
            responseTime: true,
            rating: true,
            reviewsCount: true,
            completedOrders: true,
            isVerified: true,
            verificationStatus: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Убираем пароль из ответа
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// Обновление пользователя
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    const body = await request.json()
    const { name, email, phone, location, legalStatus } = body

    // Получаем текущего пользователя
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const userData = JSON.parse(Buffer.from(token, 'base64').toString())

    if (!userData || userData.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(location && { location }),
        ...(legalStatus && { legalStatus })
      },
      include: {
        executorProfile: {
          select: {
            id: true,
            description: true,
            experience: true,
            hourlyRate: true,
            categories: true,
            workingHours: true,
            responseTime: true,
            rating: true,
            reviewsCount: true,
            completedOrders: true,
            isVerified: true,
            verificationStatus: true
          }
        }
      }
    })

    // Убираем пароль из ответа
    const { passwordHash, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: 'User updated successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}