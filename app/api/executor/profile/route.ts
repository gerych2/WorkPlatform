import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, description, experience, hourlyRate, categories, workingHours, responseTime } = body

    // Создаем профиль исполнителя
    const profile = await prisma.executorProfile.create({
      data: {
        userId,
        description,
        experience,
        hourlyRate: parseFloat(hourlyRate),
        categories: categories.map((cat: string) => parseInt(cat)),
        workingHours: workingHours || {},
        responseTime: responseTime || '24 часа'
      }
    })

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Error creating executor profile:', error)
    return NextResponse.json(
      { error: 'Failed to create executor profile' },
      { status: 500 }
    )
  }
}

