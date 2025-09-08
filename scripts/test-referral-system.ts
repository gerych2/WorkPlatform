import { PrismaClient } from '@prisma/client'
import { ReferralService } from '../lib/gamification/referralService'

const prisma = new PrismaClient()

async function testReferralSystem() {
  console.log('🧪 Тестирование реферальной системы...\n')

  try {
    // 1. Создаем тестового пользователя-пригласившего
    console.log('1. Создаем тестового пользователя-пригласившего...')
    const timestamp = Date.now()
    const referrer = await prisma.user.create({
      data: {
        name: 'Тест Пригласивший',
        email: `referrer${timestamp}@test.com`,
        phone: `+375 (29) ${timestamp.toString().slice(-7)}`,
        passwordHash: 'test_hash',
        role: 'client',
        status: 'active',
        location: 'Минск'
      }
    })
    console.log(`✅ Создан пользователь: ${referrer.name} (ID: ${referrer.id})`)

    // 2. Создаем реферальный код
    console.log('\n2. Создаем реферальный код...')
    const referralService = new ReferralService()
    const referralCode = await referralService.createReferralCode(referrer.id)
    console.log(`✅ Создан реферальный код: ${referralCode}`)

    // 3. Создаем тестового пользователя-приглашенного
    console.log('\n3. Создаем тестового пользователя-приглашенного...')
    const referred = await prisma.user.create({
      data: {
        name: 'Тест Приглашенный',
        email: `referred${timestamp}@test.com`,
        phone: `+375 (29) ${(timestamp + 1).toString().slice(-7)}`,
        passwordHash: 'test_hash',
        role: 'client',
        status: 'active',
        location: 'Гомель'
      }
    })
    console.log(`✅ Создан пользователь: ${referred.name} (ID: ${referred.id})`)

    // 4. Проверяем начальные XP
    console.log('\n4. Проверяем начальные XP...')
    const initialReferrer = await prisma.user.findUnique({
      where: { id: referrer.id },
      select: { experiencePoints: true, totalXpEarned: true }
    })
    const initialReferred = await prisma.user.findUnique({
      where: { id: referred.id },
      select: { experiencePoints: true, totalXpEarned: true }
    })
    console.log(`Пригласивший: ${initialReferrer?.experiencePoints} XP (всего: ${initialReferrer?.totalXpEarned})`)
    console.log(`Приглашенный: ${initialReferred?.experiencePoints} XP (всего: ${initialReferred?.totalXpEarned})`)

    // 5. Применяем реферальный код
    console.log('\n5. Применяем реферальный код...')
    const result = await referralService.useReferralCode(referred.id, referralCode)
    console.log(`Результат: ${result.success ? '✅ Успешно' : '❌ Ошибка'}`)
    console.log(`Сообщение: ${result.message}`)
    if (result.rewards) {
      console.log('Награды:', JSON.stringify(result.rewards, null, 2))
    }

    // 6. Проверяем обновленные XP
    console.log('\n6. Проверяем обновленные XP...')
    const finalReferrer = await prisma.user.findUnique({
      where: { id: referrer.id },
      select: { experiencePoints: true, totalXpEarned: true, referralCount: true }
    })
    const finalReferred = await prisma.user.findUnique({
      where: { id: referred.id },
      select: { experiencePoints: true, totalXpEarned: true, referredBy: true }
    })
    console.log(`Пригласивший: ${finalReferrer?.experiencePoints} XP (всего: ${finalReferrer?.totalXpEarned}, рефералов: ${finalReferrer?.referralCount})`)
    console.log(`Приглашенный: ${finalReferred?.experiencePoints} XP (всего: ${finalReferred?.totalXpEarned}, приглашен: ${finalReferred?.referredBy})`)

    // 7. Проверяем историю XP
    console.log('\n7. Проверяем историю XP...')
    const xpHistory = await prisma.xpHistory.findMany({
      where: {
        OR: [
          { userId: referrer.id },
          { userId: referred.id }
        ]
      },
      orderBy: { earnedAt: 'desc' }
    })
    console.log('История XP:')
    xpHistory.forEach(entry => {
      console.log(`- ${entry.userId === referrer.id ? 'Пригласивший' : 'Приглашенный'}: +${entry.xpAmount} XP (${entry.description})`)
    })

    console.log('\n✅ Тест завершен успешно!')

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем тест
testReferralSystem()
