import { PrismaClient } from '@prisma/client'
import { GamificationService } from '../lib/gamification/gamificationService'

const prisma = new PrismaClient()

async function checkUserLevels() {
  console.log('🔍 Проверяем уровни пользователей...\n')

  try {
    // Находим пользователя Германа
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Герман', mode: 'insensitive' } },
          { email: { contains: 'german', mode: 'insensitive' } }
        ]
      },
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

    if (users.length === 0) {
      console.log('❌ Пользователь Герман не найден')
      return
    }

    for (const user of users) {
      console.log(`👤 Пользователь: ${user.name} (${user.email})`)
      console.log(`   Роль: ${user.role}`)
      console.log(`   Текущий уровень: ${user.currentLevel}`)
      console.log(`   XP: ${user.experiencePoints}`)
      console.log(`   Всего заработано: ${user.totalXpEarned}`)

      // Проверяем, какой уровень должен быть
      const gamificationService = new GamificationService()
      const correctLevel = gamificationService.calculateLevel(user.experiencePoints, user.role)
      const nextLevelInfo = gamificationService.getNextLevelInfo(user.experiencePoints, user.role)
      
      console.log(`   Должен быть уровень: ${correctLevel}`)
      console.log(`   Следующий уровень: ${nextLevelInfo.level} (нужно ${nextLevelInfo.xpNeeded} XP)`)
      
      if (correctLevel > user.currentLevel) {
        console.log(`   ⚠️  НУЖНО ОБНОВИТЬ УРОВЕНЬ!`)
        
        // Обновляем уровень
        await prisma.user.update({
          where: { id: user.id },
          data: { currentLevel: correctLevel }
        })
        console.log(`   ✅ Уровень обновлен до ${correctLevel}`)
      } else {
        console.log(`   ✅ Уровень корректный`)
      }
      
      console.log('')
    }

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserLevels()
