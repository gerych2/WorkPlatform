import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение профиля исполнителя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const profile = await prisma.executorProfile.findUnique({
      where: {
        userId: parseInt(userId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error fetching executor profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch executor profile' },
      { status: 500 }
    )
  }
}

// Обновление профиля исполнителя
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, description, experience, hourlyRate, categories, workingHours, responseTime } = body

    // Получаем текущего пользователя
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const userData = JSON.parse(Buffer.from(token, 'base64').toString())

    if (!userData || userData.id !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь является исполнителем
    if (userData.role !== 'executor') {
      return NextResponse.json({ error: 'Only executors can update profiles' }, { status: 403 })
    }

    // Сначала проверяем, существует ли профиль
    const existingProfile = await prisma.executorProfile.findUnique({
      where: {
        userId: parseInt(userId)
      }
    })

    let updatedProfile

    if (existingProfile) {
      // Обновляем существующий профиль
      updatedProfile = await prisma.executorProfile.update({
        where: {
          userId: parseInt(userId)
        },
        data: {
          ...(description && { description }),
          ...(experience && { experience }),
          ...(hourlyRate && { hourlyRate: parseFloat(hourlyRate) }),
          ...(categories && { categories }),
          ...(workingHours && { workingHours }),
          ...(responseTime && { responseTime })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              location: true,
              status: true,
              createdAt: true
            }
          }
        }
      })
    } else {
      // Создаем новый профиль
      updatedProfile = await prisma.executorProfile.create({
        data: {
          userId: parseInt(userId),
          description: description || '',
          experience: experience || '',
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
          categories: categories || [],
          workingHours: workingHours || {},
          responseTime: responseTime || '24 hours'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              location: true,
              status: true,
              createdAt: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error updating executor profile:', error)
    return NextResponse.json(
      { error: 'Failed to update executor profile' },
      { status: 500 }
    )
  }
}