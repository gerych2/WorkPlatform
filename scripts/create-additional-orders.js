const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdditionalOrders() {
  try {
    console.log('📝 Создаем дополнительные тестовые заказы...')
    
    // Получаем клиента
    const client = await prisma.user.findUnique({
      where: { email: 'client@example.com' }
    })
    
    if (!client) {
      console.log('❌ Клиент не найден')
      return
    }
    
    // Получаем категории
    const categories = await prisma.category.findMany({
      where: { isActive: true }
    })
    
    console.log(`✅ Найдено категорий: ${categories.length}`)
    
    // Создаем заказы в разных категориях
    const orders = []
    
    // Заказ 1: Сантехник (завтра)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    
    const order1 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Сантехник')?.id || categories[1].id,
        serviceDescription: 'Замена смесителя в ванной комнате',
        status: 'pending',
        totalPrice: null,
        priceType: 'negotiable',
        orderDate: tomorrow,
        orderTime: new Date('1970-01-01T10:00:00.000Z'),
        address: 'пр. Победителей, 15, кв. 8',
        phone: client.phone,
        clientName: client.name,
        urgency: 'low',
        estimatedDuration: 1.5,
        preferredTime: 'morning',
        notes: 'Старый смеситель протекает, нужна замена',
        specialRequirements: 'Качественный смеситель с гарантией'
      }
    })
    orders.push(order1)
    
    // Заказ 2: Ремонт квартир (послезавтра)
    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    dayAfterTomorrow.setHours(15, 0, 0, 0)
    
    const order2 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Ремонт квартир')?.id || categories[2].id,
        serviceDescription: 'Поклейка обоев в спальне',
        status: 'pending',
        totalPrice: 200.00,
        priceType: 'fixed',
        orderDate: dayAfterTomorrow,
        orderTime: new Date('1970-01-01T15:00:00.000Z'),
        address: 'ул. Ленина, 45, кв. 3',
        phone: client.phone,
        clientName: client.name,
        urgency: 'medium',
        estimatedDuration: 4,
        preferredTime: 'afternoon',
        notes: 'Комната 12 кв.м, стены подготовлены',
        specialRequirements: 'Обои уже куплены, нужна только поклейка'
      }
    })
    orders.push(order2)
    
    // Заказ 3: Уборка (сегодня вечером)
    const today = new Date()
    today.setHours(18, 0, 0, 0)
    
    const order3 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Уборка')?.id || categories[3].id,
        serviceDescription: 'Генеральная уборка квартиры',
        status: 'pending',
        totalPrice: 120.00,
        priceType: 'fixed',
        orderDate: today,
        orderTime: new Date('1970-01-01T18:00:00.000Z'),
        address: 'ул. Сурганова, 8, кв. 15',
        phone: client.phone,
        clientName: client.name,
        urgency: 'high',
        estimatedDuration: 3,
        preferredTime: 'evening',
        notes: 'Квартира 2-комнатная, нужна тщательная уборка',
        specialRequirements: 'Использовать экологически чистые средства'
      }
    })
    orders.push(order3)
    
    console.log(`\n✅ Создано ${orders.length} дополнительных заказов:`)
    
    orders.forEach((order, index) => {
      const category = categories.find(c => c.id === order.categoryId)
      console.log(`\n📋 Заказ ${index + 1}:`)
      console.log(`   ID: ${order.id}`)
      console.log(`   Описание: ${order.serviceDescription}`)
      console.log(`   Категория: ${category?.name}`)
      console.log(`   Статус: ${order.status}`)
      console.log(`   Цена: ${order.totalPrice ? `${order.totalPrice} BYN` : 'По договоренности'}`)
      console.log(`   Дата: ${order.orderDate.toLocaleDateString('ru-RU')}`)
      console.log(`   Время: ${order.orderTime.toLocaleTimeString('ru-RU')}`)
      console.log(`   Адрес: ${order.address}`)
      console.log(`   Срочность: ${order.urgency}`)
    })
    
    console.log('\n🎯 Теперь у исполнителя есть заказы в разных категориях:')
    console.log('   - Электрик (заказ #13)')
    console.log('   - Сантехник (новый заказ)')
    console.log('   - Ремонт квартир (новый заказ)')
    console.log('   - Уборка (новый заказ)')
    
    console.log('\n📱 Для тестирования:')
    console.log('   1. Войдите как исполнитель (executor@example.com / executor123)')
    console.log('   2. Перейдите в "Заказы"')
    console.log('   3. Увидите все доступные заказы')
    console.log('   4. Можете принимать заказы в своих категориях')
    console.log('   5. Тестируйте кнопки "Принять", "Подробнее", "Начать работу", "Заказ готов"')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdditionalOrders()


