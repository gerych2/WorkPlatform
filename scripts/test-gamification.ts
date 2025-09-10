import { PrismaClient } from '@prisma/client'
import { gamificationService } from '../lib/gamification/gamificationService'

const prisma = new PrismaClient()

async function testGamification() {
  console.log('🧪 Тестирование системы геймификации...')

  try {
    // Получаем первого пользователя
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('❌ Пользователи не найдены')
      return
    }

    console.log(`👤 Тестируем с пользователем: ${user.name} (ID: ${user.id})`)

    // Получаем текущую статистику
    const stats = await gamificationService.getUserStats(user.id)
    console.log('📊 Текущая статистика:', {
      level: stats.level.title,
      xp: stats.xp.current,
      achievements: stats.achievements.total
    })

    // Добавляем XP за различные действия
    console.log('\n🎯 Добавляем XP за действия...')

    // XP за ежедневный вход
    const loginResult = await gamificationService.addXp(user.id, {
      amount: 2,
      source: 'daily_login',
      description: 'Ежедневный вход в приложение'
    })
    console.log('✅ Ежедневный вход:', loginResult)

    // XP за создание заказа
    const orderResult = await gamificationService.addXp(user.id, {
      amount: 5,
      source: 'order',
      description: 'Создание заказа'
    })
    console.log('✅ Создание заказа:', orderResult)

    // XP за отзыв
    const reviewResult = await gamificationService.addXp(user.id, {
      amount: 10,
      source: 'review',
      description: 'Оставление отзыва'
    })
    console.log('✅ Оставление отзыва:', reviewResult)

    // Получаем обновленную статистику
    const updatedStats = await gamificationService.getUserStats(user.id)
    console.log('\n📈 Обновленная статистика:', {
      level: updatedStats.level.title,
      xp: updatedStats.xp.current,
      achievements: updatedStats.achievements.total,
      nextLevel: updatedStats.nextLevel
    })

    // Проверяем достижения
    console.log('\n🏆 Проверяем достижения...')
    const newAchievements = await gamificationService.checkAchievements(user.id)
    console.log('Новые достижения:', newAchievements)

    // Получаем все достижения пользователя
    const achievements = await gamificationService.getUserAchievements(user.id)
    console.log(`\n🎖️ Всего достижений: ${achievements.length}`)
    
    if (achievements.length > 0) {
      console.log('Последние достижения:')
      achievements.slice(0, 3).forEach(achievement => {
        console.log(`  - ${achievement.icon} ${achievement.title} (+${achievement.xpReward} XP)`)
      })
    }

    // Тестируем реферальную систему
    console.log('\n👥 Тестируем реферальную систему...')
    const referralCode = await gamificationService.createReferralCode(user.id)
    console.log(`Реферальный код: ${referralCode}`)

    console.log('\n🎉 Тестирование завершено успешно!')

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGamification()


