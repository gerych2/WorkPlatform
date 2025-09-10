import { PrismaClient } from '@prisma/client'
import { CLIENT_ACHIEVEMENTS, EXECUTOR_ACHIEVEMENTS } from '../lib/gamification/constants'

const prisma = new PrismaClient()

async function initGamification() {
  try {
    console.log('🎮 Инициализация геймификации...')

    // Очищаем существующие достижения
    await prisma.userAchievement.deleteMany()
    await prisma.achievement.deleteMany()

    console.log('✅ Очистка существующих данных завершена')

    // Создаем достижения для клиентов
    console.log('📝 Создание достижений для клиентов...')
    for (const achievement of CLIENT_ACHIEVEMENTS) {
      await prisma.achievement.create({
        data: {
          id: parseInt(achievement.id),
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          category: achievement.category,
          rarity: achievement.rarity,
          isActive: true
        }
      })
    }

    // Создаем достижения для исполнителей
    console.log('📝 Создание достижений для исполнителей...')
    for (const achievement of EXECUTOR_ACHIEVEMENTS) {
      await prisma.achievement.create({
        data: {
          id: parseInt(achievement.id) + 100, // Добавляем 100 чтобы избежать конфликтов
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          category: achievement.category,
          rarity: achievement.rarity,
          isActive: true
        }
      })
    }

    console.log('✅ Достижения созданы успешно!')
    console.log(`📊 Всего достижений: ${CLIENT_ACHIEVEMENTS.length + EXECUTOR_ACHIEVEMENTS.length}`)
    console.log(`👥 Достижений для клиентов: ${CLIENT_ACHIEVEMENTS.length}`)
    console.log(`🔧 Достижений для исполнителей: ${EXECUTOR_ACHIEVEMENTS.length}`)

    // Проверяем созданные достижения
    const achievements = await prisma.achievement.findMany()
    console.log('📋 Созданные достижения:')
    achievements.forEach(achievement => {
      console.log(`  - ${achievement.icon} ${achievement.title} (${achievement.rarity})`)
    })

  } catch (error) {
    console.error('❌ Ошибка при инициализации геймификации:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initGamification()
