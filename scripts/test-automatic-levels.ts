import { PrismaClient } from '@prisma/client'
import { GamificationService } from '../lib/gamification/gamificationService'

const prisma = new PrismaClient()

async function testAutomaticLevels() {
  console.log('🧪 Тестируем автоматическое обновление уровней...\n')

  try {
    // Находим пользователя для тестирования
    const user = await prisma.user.findFirst({
      where: { email: 'skodagrodno2006@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        experiencePoints: true,
        currentLevel: true,
        totalXpEarned: true
      }
    })

    if (!user) {
      console.log('❌ Пользователь не найден')
      return
    }

    console.log(`👤 Пользователь: ${user.name} (${user.email})`)
    console.log(`   Роль: ${user.role}`)
    console.log(`   Текущий уровень: ${user.currentLevel}`)
    console.log(`   XP: ${user.experiencePoints}`)
    console.log(`   Всего заработано: ${user.totalXpEarned}\n`)

    const gamificationService = new GamificationService()

    // Начисляем XP через GamificationService
    console.log('🎯 Начисляем 50 XP через GamificationService...')
    
    const result = await gamificationService.addXp(user.id, {
      amount: 50,
      source: 'test',
      description: 'Тестовое начисление XP',
      metadata: { test: true }
    })

    console.log(`   Результат: ${result.newLevel ? '✅ Повышение уровня!' : '❌ Уровень не изменился'}`)
    if (result.levelUp) {
      console.log(`   Старый уровень: ${result.levelUp.oldLevel}`)
      console.log(`   Новый уровень: ${result.levelUp.newLevel}`)
      console.log(`   Название уровня: ${result.levelUp.levelConfig?.title}`)
    }

    // Проверяем обновленные данные
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        experiencePoints: true,
        currentLevel: true,
        totalXpEarned: true
      }
    })

    console.log('\n📊 Обновленные данные:')
    console.log(`   XP: ${updatedUser?.experiencePoints}`)
    console.log(`   Уровень: ${updatedUser?.currentLevel}`)
    console.log(`   Всего заработано: ${updatedUser?.totalXpEarned}`)

    // Проверяем, что уровень корректный
    const correctLevel = gamificationService.calculateLevel(updatedUser?.experiencePoints || 0, user.role)
    const isCorrect = correctLevel === updatedUser?.currentLevel

    console.log(`\n✅ Уровень корректный: ${isCorrect ? 'ДА' : 'НЕТ'}`)
    if (!isCorrect) {
      console.log(`   Должен быть: ${correctLevel}`)
      console.log(`   Фактически: ${updatedUser?.currentLevel}`)
    }

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAutomaticLevels()


