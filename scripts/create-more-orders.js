const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createMoreOrders() {
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
    
    // Получаем все категории
    const categories = await prisma.category.findMany({
      where: { isActive: true }
    })
    
    console.log(`✅ Найдено категорий: ${categories.length}`)
    
    // Создаем заказы на разные дни
    const orders = []
    
    // Заказ 1: Электрик (сегодня)
    const today = new Date()
    today.setHours(16, 0, 0, 0)
    
    const order1 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Электрик')?.id || categories[0].id,
        serviceDescription: 'Замена выключателя в коридоре',
        status: 'pending',
        totalPrice: 45.00,
        priceType: 'fixed',
        orderDate: today,
        orderTime: '16:00',
        address: 'ул. Карла Маркса, 12, кв. 7',
        phone: client.phone,
        clientName: client.name,
        urgency: 'high',
        estimatedDuration: 1,
        preferredTime: 'evening',
        notes: 'Выключатель не работает, нужна срочная замена',
        specialRequirements: 'Работать аккуратно, не повредить обои'
      }
    })
    orders.push(order1)
    
    // Заказ 2: Сантехник (завтра утром)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    
    const order2 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Сантехник')?.id || categories[1].id,
        serviceDescription: 'Устранение протечки под раковиной',
        status: 'pending',
        totalPrice: null,
        priceType: 'negotiable',
        orderDate: tomorrow,
        orderTime: '09:00',
        address: 'пр. Независимости, 45, кв. 23',
        phone: client.phone,
        clientName: client.name,
        urgency: 'medium',
        estimatedDuration: 2,
        preferredTime: 'morning',
        notes: 'Вода капает из-под раковины, нужно найти и устранить причину',
        specialRequirements: 'Принести инструменты для работы с трубами'
      }
    })
    orders.push(order2)
    
    // Заказ 3: Ремонт квартир (послезавтра)
    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    dayAfterTomorrow.setHours(10, 0, 0, 0)
    
    const order3 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Ремонт квартир')?.id || categories[2].id,
        serviceDescription: 'Укладка плитки в ванной комнате',
        status: 'pending',
        totalPrice: 300.00,
        priceType: 'fixed',
        orderDate: dayAfterTomorrow,
        orderTime: '10:00',
        address: 'ул. Богдановича, 8, кв. 15',
        phone: client.phone,
        clientName: client.name,
        urgency: 'low',
        estimatedDuration: 6,
        preferredTime: 'morning',
        notes: 'Ванная комната 4 кв.м, стены подготовлены',
        specialRequirements: 'Плитка уже куплена, нужна только укладка'
      }
    })
    orders.push(order3)
    
    // Заказ 4: Уборка (через 3 дня)
    const in3Days = new Date()
    in3Days.setDate(in3Days.getDate() + 3)
    in3Days.setHours(14, 0, 0, 0)
    
    const order4 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Уборка')?.id || categories[3].id,
        serviceDescription: 'Уборка после ремонта',
        status: 'pending',
        totalPrice: 150.00,
        priceType: 'fixed',
        orderDate: in3Days,
        orderTime: '14:00',
        address: 'ул. Ленина, 67, кв. 9',
        phone: client.phone,
        clientName: client.name,
        urgency: 'medium',
        estimatedDuration: 4,
        preferredTime: 'afternoon',
        notes: 'Квартира 3-комнатная, много строительной пыли',
        specialRequirements: 'Использовать профессиональные средства для удаления пыли'
      }
    })
    orders.push(order4)
    
    // Заказ 5: Доставка (через 4 дня)
    const in4Days = new Date()
    in4Days.setDate(in4Days.getDate() + 4)
    in4Days.setHours(11, 0, 0, 0)
    
    const order5 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Доставка')?.id || categories[4].id,
        serviceDescription: 'Доставка мебели из магазина',
        status: 'pending',
        totalPrice: 80.00,
        priceType: 'fixed',
        orderDate: in4Days,
        orderTime: '11:00',
        address: 'пр. Победителей, 25, кв. 12',
        phone: client.phone,
        clientName: client.name,
        urgency: 'low',
        estimatedDuration: 2,
        preferredTime: 'morning',
        notes: 'Нужно забрать диван из магазина и доставить домой',
        specialRequirements: 'Диван тяжелый, нужны 2 человека'
      }
    })
    orders.push(order5)
    
    // Заказ 6: Электрик (через 5 дней) - уже принятый
    const in5Days = new Date()
    in5Days.setDate(in5Days.getDate() + 5)
    in5Days.setHours(13, 0, 0, 0)
    
    // Получаем исполнителя
    const executor = await prisma.user.findUnique({
      where: { email: 'executor@example.com' }
    })
    
    const order6 = await prisma.order.create({
      data: {
        clientId: client.id,
        categoryId: categories.find(c => c.name === 'Электрик')?.id || categories[0].id,
        serviceDescription: 'Установка дополнительных розеток в гостиной',
        status: 'confirmed',
        totalPrice: 120.00,
        priceType: 'fixed',
        orderDate: in5Days,
        orderTime: '13:00',
        address: 'ул. Сурганова, 15, кв. 4',
        phone: client.phone,
        clientName: client.name,
        urgency: 'medium',
        estimatedDuration: 3,
        preferredTime: 'afternoon',
        notes: 'Нужно установить 3 розетки в гостиной',
        specialRequirements: 'Розетки с USB-портами',
        executorId: executor?.id
      }
    })
    orders.push(order6)
    
    console.log(`\n✅ Создано ${orders.length} дополнительных заказов:`)
    
    orders.forEach((order, index) => {
      const category = categories.find(c => c.id === order.categoryId)
      const statusText = order.status === 'confirmed' ? 'Принят исполнителем' : 'Ожидает исполнителя'
      
      console.log(`\n📋 Заказ ${index + 1} (ID: ${order.id}):`)
      console.log(`   Описание: ${order.serviceDescription}`)
      console.log(`   Категория: ${category?.name}`)
      console.log(`   Статус: ${statusText}`)
      console.log(`   Цена: ${order.totalPrice ? `${order.totalPrice} BYN` : 'По договоренности'}`)
      console.log(`   Дата: ${order.orderDate.toLocaleDateString('ru-RU')}`)
      console.log(`   Время: ${order.orderTime}`)
      console.log(`   Адрес: ${order.address}`)
      console.log(`   Срочность: ${order.urgency}`)
      console.log(`   Длительность: ${order.estimatedDuration} часов`)
    })
    
    console.log('\n🎯 Теперь у исполнителя есть разнообразные заказы:')
    console.log('   📅 Сегодня - Электрик (срочный)')
    console.log('   📅 Завтра - Сантехник (по договоренности)')
    console.log('   📅 Послезавтра - Ремонт квартир (долгий)')
    console.log('   📅 Через 3 дня - Уборка (после ремонта)')
    console.log('   📅 Через 4 дня - Доставка (мебель)')
    console.log('   📅 Через 5 дней - Электрик (уже принят)')
    
    console.log('\n📱 Для тестирования:')
    console.log('   1. Войдите как исполнитель (executor@example.com / executor123)')
    console.log('   2. Перейдите в "Заказы"')
    console.log('   3. Увидите заказы на разные дни')
    console.log('   4. Тестируйте все функции: принятие, отмена, начало работы, завершение')
    console.log('   5. Проверьте ограничения по времени (24 часа)')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMoreOrders()
