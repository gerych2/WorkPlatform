import { PrismaClient } from '@prisma/client'
import { GamificationService } from '../lib/gamification/gamificationService'
import { ReferralService } from '../lib/gamification/referralService'

const prisma = new PrismaClient()
const gamificationService = new GamificationService()
const referralService = new ReferralService()

async function testGamificationSystem() {
  console.log('🧪 Начинаем тестирование системы геймификации...')

  try {
    // Получаем пользователей
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, experiencePoints: true, currentLevel: true }
    })

    if (users.length === 0) {
      console.log('❌ Пользователи не найдены. Создайте пользователей сначала.')
      return
    }

    console.log(`👥 Найдено ${users.length} пользователей`)

    // Тестируем для каждого пользователя
    for (const user of users) {
      console.log(`\n🎯 Тестируем пользователя: ${user.name} (${user.role})`)
      
      // Добавляем XP за различные действия
      const testActions = [
        { action: 'daily_login', xp: 2, description: 'Ежедневный вход' },
        { action: 'search_master', xp: 5, description: 'Поиск мастера' },
        { action: 'view_profile', xp: 1, description: 'Просмотр профиля' },
        { action: 'leave_review', xp: 10, description: 'Оставление отзыва' },
        { action: 'update_profile', xp: 5, description: 'Обновление профиля' }
      ]

      if (user.role === 'executor') {
        testActions.push(
          { action: 'first_subscription', xp: 200, description: 'Первая подписка' },
          { action: 'complete_order', xp: 15, description: 'Завершение заказа' },
          { action: 'get_5_star_review', xp: 25, description: 'Отзыв на 5 звезд' }
        )
      }

      // Добавляем XP за каждое действие
      for (const testAction of testActions) {
        try {
          const result = await gamificationService.addXp(user.id, {
            amount: testAction.xp,
            source: testAction.action,
            description: testAction.description,
            metadata: { test: true }
          })

          console.log(`  ✅ ${testAction.description}: +${testAction.xp} XP`)
          
          if (result.newLevel) {
            console.log(`  🎉 ПОВЫШЕНИЕ УРОВНЯ! ${result.levelUp.oldLevel} → ${result.levelUp.newLevel}`)
            console.log(`  🏆 Новый титул: ${result.levelUp.levelConfig.title} ${result.levelUp.levelConfig.icon}`)
          }
        } catch (error) {
          console.log(`  ❌ Ошибка при добавлении XP: ${error}`)
        }
      }

      // Проверяем достижения
      try {
        const newAchievements = await gamificationService.checkAchievements(user.id)
        if (newAchievements.length > 0) {
          console.log(`  🏆 Получено ${newAchievements.length} новых достижений:`)
          newAchievements.forEach(achievement => {
            console.log(`    - ${achievement.icon} ${achievement.title} (+${achievement.xpReward} XP)`)
          })
        }
      } catch (error) {
        console.log(`  ❌ Ошибка при проверке достижений: ${error}`)
      }

      // Получаем финальную статистику
      try {
        const stats = await gamificationService.getUserStats(user.id)
        console.log(`  📊 Финальная статистика:`)
        console.log(`    - Уровень: ${stats.level.level} (${stats.level.title})`)
        console.log(`    - XP: ${stats.xp.current}`)
        console.log(`    - Достижения: ${stats.achievements.total}`)
      } catch (error) {
        console.log(`  ❌ Ошибка при получении статистики: ${error}`)
      }
    }

    // Тестируем реферальную систему
    console.log(`\n👥 Тестируем реферальную систему...`)
    
    if (users.length >= 2) {
      const referrer = users[0]
      const referred = users[1]
      
      try {
        // Создаем реферальный код
        const referralCode = await referralService.createReferralCode(referrer.id)
        console.log(`  📝 Создан реферальный код для ${referrer.name}: ${referralCode}`)
        
        // Используем реферальный код
        const result = await referralService.useReferralCode(referred.id, referralCode)
        if (result.success) {
          console.log(`  ✅ Реферальный код успешно использован!`)
          console.log(`  🎁 Награды: ${JSON.stringify(result.rewards, null, 2)}`)
        } else {
          console.log(`  ❌ Ошибка использования реферального кода: ${result.message}`)
        }
      } catch (error) {
        console.log(`  ❌ Ошибка при тестировании реферальной системы: ${error}`)
      }
    }

    console.log(`\n🎉 Тестирование завершено!`)
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем тест
testGamificationSystem()


