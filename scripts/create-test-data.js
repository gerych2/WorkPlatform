const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('🗑️ Очищаем базу данных...')
    
    // Удаляем все данные в правильном порядке
    await prisma.order.deleteMany()
    await prisma.subscription.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.review.deleteMany()
    await prisma.complaint.deleteMany()
    await prisma.executorDocument.deleteMany()
    await prisma.verification.deleteMany()
    await prisma.executorProfile.deleteMany()
    await prisma.user.deleteMany()
    await prisma.category.deleteMany()
    
    console.log('✅ База данных очищена')
    
    console.log('👥 Создаем тестовых пользователей...')
    
    // Создаем администратора
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        name: 'Администратор',
        email: 'admin@serviceplatform.by',
        phone: '+375 (29) 123-45-67',
        passwordHash: adminPassword,
        role: 'admin',
        isVerified: true,
        verificationStatus: 'verified',
        location: 'Минск'
      }
    })
    console.log(`✅ Создан администратор: ${admin.name}`)

    // Создаем тестового клиента
    const clientPassword = await bcrypt.hash('client123', 10)
    const client = await prisma.user.create({
      data: {
        name: 'Анна Сидорова',
        email: 'client@example.com',
        phone: '+375 (29) 234-56-78',
        passwordHash: clientPassword,
        role: 'client',
        isVerified: true,
        verificationStatus: 'verified',
        location: 'Гомель'
      }
    })
    console.log(`✅ Создан клиент: ${client.name}`)

    // Создаем тестового исполнителя
    const executorPassword = await bcrypt.hash('executor123', 10)
    const executor = await prisma.user.create({
      data: {
        name: 'Иван Петров',
        email: 'executor@example.com',
        phone: '+375 (29) 123-45-67',
        passwordHash: executorPassword,
        role: 'executor',
        isVerified: true,
        verificationStatus: 'verified',
        location: 'Минск'
      }
    })

    // Создаем профиль исполнителя
    await prisma.executorProfile.create({
      data: {
        userId: executor.id,
        description: 'Опытный электрик с 10-летним стажем',
        rating: 4.8,
        reviewsCount: 45,
        completedOrders: 67,
        isVerified: true,
        verificationStatus: 'verified',
        experience: '10+ лет',
        hourlyRate: 25.00,
        responseTime: 'В течение часа',
        workingHours: {
          monday: '9:00-18:00',
          tuesday: '9:00-18:00',
          wednesday: '9:00-18:00',
          thursday: '9:00-18:00',
          friday: '9:00-18:00',
          saturday: '10:00-16:00',
          sunday: 'Выходной'
        },
        categories: [1, 2] // Электрик и Сантехник
      }
    })
    console.log(`✅ Создан исполнитель: ${executor.name}`)

    // Создаем тестовые категории
    const categories = await prisma.category.createMany({
      data: [
        { name: 'Электрик', description: 'Электромонтажные работы', icon: '⚡', isActive: true },
        { name: 'Сантехник', description: 'Сантехнические работы', icon: '🔧', isActive: true },
        { name: 'Ремонт квартир', description: 'Комплексный ремонт жилых помещений', icon: '🏠', isActive: true },
        { name: 'Уборка', description: 'Клининговые услуги', icon: '🧹', isActive: true },
        { name: 'Доставка', description: 'Курьерские услуги', icon: '📦', isActive: true }
      ]
    })
    console.log(`✅ Создано ${categories.count} категорий`)

    // Получаем созданные категории
    const createdCategories = await prisma.category.findMany()
    
    // Создаем тестовые заказы
    if (createdCategories.length > 0) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const order1 = await prisma.order.create({
        data: {
          clientId: client.id,
          categoryId: createdCategories[0].id,
          serviceDescription: 'Нужно починить розетку в спальне',
          status: 'pending',
          totalPrice: 50.00,
          priceType: 'fixed',
          orderDate: tomorrow,
          orderTime: '14:00',
          address: 'ул. Ленина, 15, кв. 23',
          phone: client.phone,
          clientName: client.name,
          urgency: 'medium',
          estimatedDuration: 2,
          preferredTime: 'afternoon',
          notes: 'Розетка искрит при включении приборов'
        }
      })
      console.log(`✅ Создан заказ: ${order1.serviceDescription}`)

      const order2 = await prisma.order.create({
        data: {
          clientId: client.id,
          categoryId: createdCategories[1].id,
          serviceDescription: 'Установка новой сантехники',
          status: 'confirmed',
          totalPrice: null,
          priceType: 'negotiable',
          orderDate: tomorrow,
          orderTime: '10:00',
          address: 'пр. Победителей, 8, кв. 45',
          phone: client.phone,
          clientName: client.name,
          urgency: 'low',
          estimatedDuration: 4,
          preferredTime: 'morning',
          specialRequirements: 'Нужны качественные материалы',
          executorId: executor.id
        }
      })
      console.log(`✅ Создан заказ: ${order2.serviceDescription}`)
    }
    
    console.log('🎉 Все тестовые данные созданы!')
    console.log('📧 Данные для входа:')
    console.log('   Админ: admin@serviceplatform.by / admin123')
    console.log('   Клиент: client@example.com / client123')
    console.log('   Исполнитель: executor@example.com / executor123')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestData()
