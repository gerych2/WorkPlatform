import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Ищем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Проверяем статус пользователя
    if (user.status === 'blocked') {
      return NextResponse.json(
        { error: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' },
        { status: 403 }
      )
    }

    // Проверяем, что исполнитель активен (клиенты могут входить сразу)
    if (user.role === 'executor' && user.status === 'pending') {
      return NextResponse.json(
        { error: 'Ваш аккаунт исполнителя ожидает подтверждения администратора.' },
        { status: 403 }
      )
    }

    // Проверяем хешированный пароль
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      )
    }

    // Обновляем время последнего входа
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        location: user.location,
        isVerified: user.isVerified,
        legalStatus: user.legalStatus
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    )
  }
}
