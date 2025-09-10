import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/startups/[id]/apply - Подать заявку на стартап
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = parseInt(params.id)
    const body = await request.json()
    const { name, email, phone, telegram, experience, motivation, skills } = body

    if (!name || !email || !phone || !telegram || !experience || !motivation || !skills) {
      return NextResponse.json(
        { success: false, error: 'Заполните все поля формы' },
        { status: 400 }
      )
    }

    // Проверяем, что стартап существует
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { id: true, title: true, status: true }
    })

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Стартап не найден' },
        { status: 404 }
      )
    }

    if (startup.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Стартап не принимает заявки' },
        { status: 400 }
      )
    }

    // Проверяем, не подавал ли уже заявку этот email
    const existingApplication = await prisma.startupApplication.findFirst({
      where: {
        startupId,
        email
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Вы уже подавали заявку на этот стартап' },
        { status: 400 }
      )
    }

    // Создаем заявку
    const application = await prisma.startupApplication.create({
      data: {
        startupId,
        name,
        email,
        phone,
        telegram,
        experience,
        motivation,
        skills
      }
    })

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Заявка успешно подана! Администратор рассмотрит её в ближайшее время.'
    })
  } catch (error) {
    console.error('Error creating startup application:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка подачи заявки' },
      { status: 500 }
    )
  }
}
