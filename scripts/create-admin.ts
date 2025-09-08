import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔍 Проверка существующих пользователей...\n')
    
    // Проверяем, есть ли уже админы
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      console.log('✅ Админ уже существует:')
      console.log(`   ID: ${existingAdmin.id}`)
      console.log(`   Имя: ${existingAdmin.name}`)
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Роль: ${existingAdmin.role}`)
      return
    }

    // Проверяем общее количество пользователей
    const userCount = await prisma.user.count()
    console.log(`Всего пользователей в базе: ${userCount}\n`)

    // Создаем админа
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Администратор',
        email: 'admin@prodo-agency.com',
        passwordHash: hashedPassword,
        role: 'admin',
        status: 'active',
        isVerified: true,
        verificationStatus: 'verified'
      }
    })

    console.log('✅ Админ успешно создан!')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Имя: ${admin.name}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Пароль: admin123`)
    console.log(`   Роль: ${admin.role}`)
    console.log('\n🔑 Данные для входа:')
    console.log('   Email: admin@prodo-agency.com')
    console.log('   Пароль: admin123')

  } catch (error) {
    console.error('❌ Ошибка создания админа:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
