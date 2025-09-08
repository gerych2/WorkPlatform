import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, password, role, location, legalStatus, profile, referralCode } = body

    // Валидация обязательных полей
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400 }
      )
    }

    // Валидация пароля (минимум 6 символов)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хешируем пароль для безопасности
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Создаем пользователя с хешированным паролем
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role,
        status: 'active', // Все пользователи сразу активны для тестирования
        location,
        isVerified: true, // Все пользователи верифицированы для тестирования
        legalStatus
      }
    })

    // Если это исполнитель, создаем чистый профиль
    if (role === 'executor') {
      try {
        await prisma.executorProfile.create({
          data: {
            userId: newUser.id,
            description: profile?.description || 'Новый исполнитель на платформе',
            experience: profile?.experience || 'Не указано',
            hourlyRate: profile?.hourlyRate ? parseFloat(profile.hourlyRate) : 0,
            categories: profile?.categories || [],
            workingHours: profile?.workingHours || {
              monday: { start: '09:00', end: '18:00', isWorking: true },
              tuesday: { start: '09:00', end: '18:00', isWorking: true },
              wednesday: { start: '09:00', end: '18:00', isWorking: true },
              thursday: { start: '09:00', end: '18:00', isWorking: true },
              friday: { start: '09:00', end: '18:00', isWorking: true },
              saturday: { start: '10:00', end: '16:00', isWorking: true },
              sunday: { start: '10:00', end: '16:00', isWorking: false }
            },
            responseTime: profile?.responseTime || '24 часа',
            rating: 0,
            reviewsCount: 0,
            completedOrders: 0,
            isVerified: false,
            verificationStatus: 'pending'
          }
        })

        // Создаем активную подписку для нового исполнителя
        await prisma.subscription.create({
          data: {
            userId: newUser.id,
            planType: 'basic' as any,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
            amount: 29.99,
            price: 29.99
          }
        })

        // Создаем рабочие часы для нового исполнителя (используем новую логику: понедельник = 0)
        const workingHoursData = [
          { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isWorking: true }, // Понедельник
          { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isWorking: true }, // Вторник
          { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isWorking: true }, // Среда
          { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isWorking: true }, // Четверг
          { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isWorking: true }, // Пятница
          { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isWorking: true }, // Суббота
          { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isWorking: false } // Воскресенье
        ]

        await prisma.workingHours.createMany({
          data: workingHoursData.map(hour => ({
            executorId: newUser.id,
            dayOfWeek: hour.dayOfWeek,
            startTime: hour.startTime,
            endTime: hour.endTime,
            isWorking: hour.isWorking
          }))
        })
      } catch (profileError) {
        console.error('Error creating executor profile:', profileError)
        // Продолжаем регистрацию, даже если профиль не создался
      }
    }

    // Обработка реферального кода
    let referralResult = null
    if (referralCode && referralCode.trim()) {
      try {
        // Импортируем ReferralService
        const { ReferralService } = await import('../../../../lib/gamification/referralService')
        const referralService = new ReferralService()
        
        // Применяем реферальный код
        referralResult = await referralService.useReferralCode(newUser.id, referralCode.trim())
        
        if (referralResult.success) {
          console.log('Реферальный код успешно применен:', referralResult)
        } else {
          console.log('Ошибка применения реферального кода:', referralResult.message)
        }
      } catch (error) {
        console.error('Ошибка при применении реферального кода:', error)
        // Не прерываем регистрацию из-за ошибки реферального кода
      }
    }

    return NextResponse.json({
      success: true,
      message: role === 'executor'
        ? 'Регистрация успешна! Ваши документы отправлены на проверку.'
        : 'Регистрация успешна! Добро пожаловать на платформу!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        location: newUser.location,
        isVerified: newUser.isVerified,
        legalStatus: newUser.legalStatus,
        createdAt: newUser.createdAt,
        lastLogin: newUser.lastLogin
      },
      referral: referralResult // Добавляем информацию о реферальном коде
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации. Попробуйте еще раз.' },
      { status: 500 }
    )
  }
}
