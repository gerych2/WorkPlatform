import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Проверка пользователей в базе данных...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log(`Найдено пользователей: ${users.length}\n`)
    
    users.forEach(user => {
      console.log(`ID: ${user.id} | Имя: ${user.name} | Email: ${user.email} | Роль: ${user.role}`)
    })

    if (users.length === 0) {
      console.log('\n❌ Пользователей нет! Нужно создать тестового пользователя.')
      
      // Создаем тестового пользователя
      const testUser = await prisma.user.create({
        data: {
          name: 'Тестовый Пользователь',
          email: 'test@example.com',
          passwordHash: 'test_hash',
          role: 'client'
        }
      })
      
      console.log(`\n✅ Создан тестовый пользователь: ID ${testUser.id}`)
    }

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
