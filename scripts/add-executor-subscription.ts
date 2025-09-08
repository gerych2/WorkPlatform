import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('💳 Добавляем подписку для исполнителя...')

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

    // Проверяем, есть ли уже подписка
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: executor.id }
    })

    if (existingSubscription) {
      console.log('ℹ️ У исполнителя уже есть подписка')
      return
    }

    // Создаем подписку
    const subscription = await prisma.subscription.create({
      data: {
        userId: executor.id,
        plan: 'premium',
        planType: 'monthly',
        price: 20.00,
        amount: 20.00,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
        autoRenew: true,
        paymentMethod: 'card',
        createdAt: new Date()
      }
    })

    console.log(`✅ Подписка создана:`)
    console.log(`   - План: ${subscription.plan}`)
    console.log(`   - Цена: ${subscription.price} ₽`)
    console.log(`   - Статус: ${subscription.status}`)
    console.log(`   - Действует до: ${subscription.endDate.toLocaleDateString('ru-RU')}`)
    console.log(`   - Автопродление: ${subscription.autoRenew ? 'Да' : 'Нет'}`)

  } catch (error) {
    console.log('❌ Ошибка при создании подписки:', error)
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
