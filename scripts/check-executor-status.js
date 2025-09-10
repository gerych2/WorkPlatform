const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkExecutorStatus() {
  try {
    console.log('🔍 Проверяем статус исполнителя...')
    
    const executor = await prisma.user.findUnique({
      where: { email: 'executor@example.com' },
      include: {
        executorProfile: true
      }
    })

    if (executor) {
      console.log('👤 Исполнитель найден:')
      console.log(`   ID: ${executor.id}`)
      console.log(`   Имя: ${executor.name}`)
      console.log(`   Email: ${executor.email}`)
      console.log(`   Роль: ${executor.role}`)
      console.log(`   Статус: ${executor.status}`)
      console.log(`   Верифицирован: ${executor.isVerified}`)
      console.log(`   Статус верификации: ${executor.verificationStatus}`)
      
      if (executor.executorProfile) {
        console.log('📋 Профиль исполнителя:')
        console.log(`   Верифицирован: ${executor.executorProfile.isVerified}`)
        console.log(`   Статус верификации: ${executor.executorProfile.verificationStatus}`)
      } else {
        console.log('❌ Профиль исполнителя не найден')
      }
    } else {
      console.log('❌ Исполнитель не найден')
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExecutorStatus()




