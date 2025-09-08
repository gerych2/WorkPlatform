import { PrismaClient } from '@prisma/client'
import { CLIENT_LEVELS, EXECUTOR_LEVELS, CLIENT_ACHIEVEMENTS, EXECUTOR_ACHIEVEMENTS } from '../lib/gamification/constants'

const prisma = new PrismaClient()

async function seedGamification() {
  console.log('🌱 Начинаем заполнение данных геймификации...')

  // Создаем уровни для клиентов
  console.log('📊 Создание уровней для клиентов...')
  for (const level of CLIENT_LEVELS) {
    await prisma.level.upsert({
      where: { level: level.level },
      update: level,
      create: level
    })
  }
  console.log(`✅ Создано ${CLIENT_LEVELS.length} уровней для клиентов`)

  // Создаем уровни для исполнителей
  console.log('📊 Создание уровней для исполнителей...')
  for (const level of EXECUTOR_LEVELS) {
    await prisma.level.upsert({
      where: { level: level.level },
      update: level,
      create: level
    })
  }
  console.log(`✅ Создано ${EXECUTOR_LEVELS.length} уровней для исполнителей`)

  // Создаем достижения для клиентов
  console.log('🏆 Создание достижений для клиентов...')
  for (const achievement of CLIENT_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: parseInt(achievement.id) },
      update: {
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        category: achievement.category,
        rarity: achievement.rarity
      },
      create: {
        id: parseInt(achievement.id),
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        category: achievement.category,
        rarity: achievement.rarity
      }
    })
  }
  console.log(`✅ Создано ${CLIENT_ACHIEVEMENTS.length} достижений для клиентов`)

  // Создаем достижения для исполнителей
  console.log('🏆 Создание достижений для исполнителей...')
  for (const achievement of EXECUTOR_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: parseInt(achievement.id) },
      update: {
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        category: achievement.category,
        rarity: achievement.rarity
      },
      create: {
        id: parseInt(achievement.id),
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        category: achievement.category,
        rarity: achievement.rarity
      }
    })
  }
  console.log(`✅ Создано ${EXECUTOR_ACHIEVEMENTS.length} достижений для исполнителей`)

  // Обновляем существующих пользователей
  console.log('👥 Обновление пользователей...')
  const users = await prisma.user.findMany()
  
  for (const user of users) {
    // Генерируем реферальный код если его нет
    if (!user.referralCode) {
      const referralCode = generateReferralCode()
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode }
      })
    }

    // Добавляем начальный XP если его нет
    if (user.experiencePoints === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          experiencePoints: 50, // Начальный бонус
          currentLevel: 1,
          totalXpEarned: 50
        }
      })

      // Записываем в историю
      await prisma.xpHistory.create({
        data: {
          userId: user.id,
          xpAmount: 50,
          source: 'welcome_bonus',
          description: 'Добро пожаловать в ProDoAgency!'
        }
      })
    }
  }
  console.log(`✅ Обновлено ${users.length} пользователей`)

  console.log('🎉 Заполнение данных геймификации завершено!')
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

seedGamification()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении данных геймификации:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
