const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('Создание администратора...')

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Создаем пользователя-админа
    const admin = await prisma.user.create({
      data: {
        name: 'Администратор',
        email: 'admin@serviceplatform.by',
        phone: '+375 (29) 000-00-00',
        passwordHash: hashedPassword,
        role: 'admin',
        status: 'active',
        location: 'Минск',
        isVerified: true,
        verificationStatus: 'verified',
        clientRating: 0,
        clientReviewsCount: 0
      }
    })

    console.log('✅ Администратор успешно создан!')
    console.log('📧 Email: admin@serviceplatform.by')
    console.log('🔑 Пароль: admin123')
    console.log('👤 ID:', admin.id)

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Администратор с таким email уже существует')
    } else {
      console.error('❌ Ошибка при создании администратора:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()




