const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestOrder() {
  try {
    console.log('📝 Создаем тестовый заказ...')
    
    // Получаем клиента
    const client = await prisma.user.findUnique({
      where: { email: 'client@example.com' }
    })
    
    if (!client) {
      console.log('❌ Клиент не найден')
      return
    }
    
    console.log(`✅ Клиент найден: ${client.name} (${client.email})`)
    
    // Получаем категорию "Электрик"
    const category = await prisma.category.findFirst({
      where: { name: 'Электрик' }
    })
    
    if (!category) {
      console.log('❌ Категория "Электрик" не найдена')
      return
    }
    
    console.log(`✅ Категория найдена: ${category.name}`)
    
    // Создаем заказ на завтра
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0) // 14:00
    
    const order = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: category.id,
        serviceDescription: 'Установка новой розетки в кухне',
        status: 'pending',
        totalPrice: 75.00,
        priceType: 'fixed',
        orderDate: tomorrow,
        orderTime: new Date('1970-01-01T14:00:00.000Z'),
        address: 'ул. Независимости, 25, кв. 12',
        phone: client.phone,
        clientName: client.name,
        urgency: 'medium',
        estimatedDuration: 2,
        preferredTime: 'afternoon',
        notes: 'Нужно установить розетку для стиральной машины. Стена кирпичная.',
        specialRequirements: 'Требуется розетка с заземлением'
      }
    })
    
    console.log('✅ Заказ создан:')
    console.log(`   ID: ${order.id}`)
    console.log(`   Описание: ${order.serviceDescription}`)
    console.log(`   Клиент: ${order.clientName}`)
    console.log(`   Категория: ${category.name}`)
    console.log(`   Статус: ${order.status}`)
    console.log(`   Цена: ${order.totalPrice} BYN`)
    console.log(`   Дата: ${order.orderDate.toLocaleDateString('ru-RU')}`)
    console.log(`   Время: ${order.orderTime.toLocaleTimeString('ru-RU')}`)
    console.log(`   Адрес: ${order.address}`)
    console.log(`   Срочность: ${order.urgency}`)
    console.log(`   Длительность: ${order.estimatedDuration} часов`)
    console.log(`   Примечания: ${order.notes}`)
    console.log(`   Особые требования: ${order.specialRequirements}`)
    
    console.log('\n🎯 Теперь исполнитель может:')
    console.log('   1. Войти в систему (executor@example.com / executor123)')
    console.log('   2. Перейти в раздел "Заказы"')
    console.log('   3. Увидеть новый заказ')
    console.log('   4. Нажать "Принять заказ"')
    console.log('   5. Нажать "Подробнее" для просмотра деталей')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrder()


