import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserDataFromToken } from '../../../../lib/serverUtils'

const prisma = new PrismaClient()

// Получение рабочих часов исполнителя
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)

    if (!userData || userData.role !== 'executor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Проверяем, что пользователь существует в базе данных
    const user = await prisma.user.findUnique({
      where: { id: userData.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Получаем рабочие часы исполнителя
    const workingHours = await prisma.workingHours.findMany({
      where: { executorId: userData.id },
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json(workingHours)
  } catch (error) {
    console.error('Error fetching working hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Создание/обновление рабочих часов
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)

    console.log('Working hours API - userData:', userData)

    if (!userData || userData.role !== 'executor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Проверяем, что пользователь существует в базе данных
    const user = await prisma.user.findUnique({
      where: { id: userData.id }
    })

    console.log('Working hours API - user from DB:', user)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { workingHours } = body

    console.log('Working hours API - workingHours data:', workingHours)

    // Удаляем старые рабочие часы
    await prisma.workingHours.deleteMany({
      where: { executorId: userData.id }
    })

    // Создаем новые рабочие часы
    const createdHours = await prisma.workingHours.createMany({
      data: workingHours.map((hour: any) => ({
        executorId: userData.id,
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime,
        endTime: hour.endTime,
        isWorking: hour.isWorking
      }))
    })

    return NextResponse.json({ success: true, count: createdHours.count })
  } catch (error) {
    console.error('Error updating working hours:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
