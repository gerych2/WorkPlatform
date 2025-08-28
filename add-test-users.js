const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestUsers() {
  try {
    console.log('Добавляем тестовых пользователей...')
    
    // Создаем тестового клиента
    const client = await prisma.user.create({
      data: {
        name: 'Тестовый Клиент',
        email: 'test@client.by',
        phone: '+375 (29) 111-11-11',
        passwordHash: 'test_password_123',
        role: 'client',
        status: 'active',
        location: 'Минск, тестовый адрес',
        isVerified: true,
        legalStatus: null
      }
    })
    
    console.log('Клиент создан:', client.email)
    
    // Создаем тестового исполнителя
    const executor = await prisma.user.create({
      data: {
        name: 'Тестовый Исполнитель',
        email: 'test@executor.by',
        phone: '+375 (29) 222-22-22',
        passwordHash: 'test_password_123',
        role: 'executor',
        status: 'verified',
        location: 'Минск, тестовый адрес',
        isVerified: true,
        legalStatus: 'ИП'
      }
    })
    
    console.log('Исполнитель создан:', executor.email)
    
    // Создаем профиль исполнителя
    const profile = await prisma.executorProfile.create({
      data: {
        userId: executor.id,
        description: 'Тестовый исполнитель для проверки функционала',
        experience: '3 года',
        hourlyRate: 30.00,
        categories: [1], // ID категории "Электрик"
        workingHours: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' }
        },
        responseTime: '2 часа',
        completedOrders: 0,
        rating: 0.00,
        reviewsCount: 0
      }
    })
    
    console.log('Профиль исполнителя создан')
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestUsers()

