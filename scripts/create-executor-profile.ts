import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('👨‍💼 Создаем профиль для исполнителя...')

  try {
    // Находим исполнителя
    const executor = await prisma.user.findFirst({
      where: { 
        email: 'executor@example.com',
        role: 'executor'
      }
    })

    if (!executor) {
      console.log('❌ Исполнитель не найден')
      return
    }

    console.log(`👤 Найден исполнитель: ${executor.name} (ID: ${executor.id})`)

    // Проверяем, есть ли уже профиль
    const existingProfile = await prisma.executorProfile.findUnique({
      where: { userId: executor.id }
    })

    if (existingProfile) {
      console.log('ℹ️ У исполнителя уже есть профиль')
      return
    }

    // Создаем профиль
    const profile = await prisma.executorProfile.create({
      data: {
        userId: executor.id,
        description: 'Опытный мастер с 5-летним стажем. Специализируюсь на ремонте бытовой техники и сантехники. Качественно и быстро выполню любую работу.',
        experience: '5 лет',
        hourlyRate: 25.00,
        categories: [1, 2], // Ремонт и обслуживание, Уборка и клининг
        workingHours: {
          monday: { start: '09:00', end: '18:00', isWorking: true },
          tuesday: { start: '09:00', end: '18:00', isWorking: true },
          wednesday: { start: '09:00', end: '18:00', isWorking: true },
          thursday: { start: '09:00', end: '18:00', isWorking: true },
          friday: { start: '09:00', end: '18:00', isWorking: true },
          saturday: { start: '10:00', end: '16:00', isWorking: true },
          sunday: { start: '10:00', end: '16:00', isWorking: false }
        },
        responseTime: '2 часа',
        rating: 4.8,
        reviewsCount: 15,
        completedOrders: 25,
        isVerified: true,
        verificationStatus: 'verified'
      }
    })

    console.log(`✅ Профиль создан:`)
    console.log(`   - Описание: ${profile.description}`)
    console.log(`   - Опыт: ${profile.experience}`)
    console.log(`   - Ставка: ${profile.hourlyRate} ₽/час`)
    console.log(`   - Рейтинг: ${profile.rating}/5`)
    console.log(`   - Выполнено заказов: ${profile.completedOrders}`)

  } catch (error) {
    console.log('❌ Ошибка при создании профиля:', error)
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


