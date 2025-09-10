const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function deleteAndCreateExecutor() {
  try {
    console.log('Удаление существующего исполнителя...')

    // Удаляем существующего пользователя с email executor@example.com
    const existingUser = await prisma.user.findUnique({
      where: { email: 'executor@example.com' }
    })

    if (existingUser) {
      // Удаляем связанные записи
      await prisma.workingHours.deleteMany({
        where: { executorId: existingUser.id }
      })

      await prisma.subscription.deleteMany({
        where: { userId: existingUser.id }
      })

      await prisma.executorProfile.deleteMany({
        where: { userId: existingUser.id }
      })

      await prisma.user.delete({
        where: { id: existingUser.id }
      })

      console.log('Существующий исполнитель удален')
    }

    console.log('Создание нового исполнителя...')

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Создаем пользователя-исполнителя
    const user = await prisma.user.create({
      data: {
        name: 'Иван Петров',
        email: 'executor@example.com',
        phone: '+375 (29) 123-45-67',
        passwordHash: hashedPassword,
        role: 'executor',
        status: 'active',
        location: 'Минск',
        isVerified: true,
        verificationStatus: 'verified',
        clientRating: 0,
        clientReviewsCount: 0
      }
    })

    console.log('Пользователь создан:', user)

    // Создаем профиль исполнителя
    const executorProfile = await prisma.executorProfile.create({
      data: {
        userId: user.id,
        description: 'Опытный мастер по ремонту и обслуживанию техники. Работаю более 5 лет, имею все необходимые инструменты и материалы.',
        experience: '5+ лет',
        hourlyRate: 2000,
        responseTime: 'fast',
        completedOrders: 0,
        rating: 0,
        reviewsCount: 0,
        isVerified: true
      }
    })

    console.log('Профиль исполнителя создан:', executorProfile)

    // Создаем рабочие часы (0 = воскресенье, 1 = понедельник, ..., 6 = суббота)
    const workingHours = [
      { dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isWorking: true }, // Понедельник
      { dayOfWeek: 2, startTime: '08:00', endTime: '20:00', isWorking: true }, // Вторник
      { dayOfWeek: 3, startTime: '08:00', endTime: '20:00', isWorking: true }, // Среда
      { dayOfWeek: 4, startTime: '08:00', endTime: '20:00', isWorking: true }, // Четверг
      { dayOfWeek: 5, startTime: '08:00', endTime: '20:00', isWorking: true }, // Пятница
      { dayOfWeek: 6, startTime: '08:00', endTime: '20:00', isWorking: true }, // Суббота
      { dayOfWeek: 0, startTime: '08:00', endTime: '20:00', isWorking: false } // Воскресенье
    ]

    for (const hours of workingHours) {
      await prisma.workingHours.create({
        data: {
          executorId: user.id,
          dayOfWeek: hours.dayOfWeek,
          startTime: hours.startTime,
          endTime: hours.endTime,
          isWorking: hours.isWorking
        }
      })
    }

    console.log('Рабочие часы созданы')

    // Создаем подписку
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
        status: 'active',
        amount: 2990
      }
    })

    console.log('Подписка создана:', subscription)

    console.log('\n✅ Исполнитель успешно создан!')
    console.log('📧 Email: executor@example.com')
    console.log('🔑 Пароль: password123')
    console.log('👤 ID:', user.id)
    console.log('⭐ Рейтинг:', executorProfile.rating)
    console.log('💰 Почасовая ставка:', executorProfile.hourlyRate, 'руб/час')

  } catch (error) {
    console.error('Ошибка при создании исполнителя:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAndCreateExecutor()
