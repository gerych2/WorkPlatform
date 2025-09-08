const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixExecutorStatus() {
  try {
    console.log('🔧 Исправляем статус исполнителя...')
    
    // Обновляем статус исполнителя на active
    const updatedExecutor = await prisma.user.update({
      where: { email: 'executor@example.com' },
      data: {
        status: 'active'
      }
    })

    console.log('✅ Статус исполнителя обновлен:')
    console.log(`   ID: ${updatedExecutor.id}`)
    console.log(`   Имя: ${updatedExecutor.name}`)
    console.log(`   Email: ${updatedExecutor.email}`)
    console.log(`   Роль: ${updatedExecutor.role}`)
    console.log(`   Статус: ${updatedExecutor.status}`)
    console.log(`   Верифицирован: ${updatedExecutor.isVerified}`)
    console.log(`   Статус верификации: ${updatedExecutor.verificationStatus}`)
    
    // Проверяем профиль исполнителя
    const profile = await prisma.executorProfile.findUnique({
      where: { userId: updatedExecutor.id }
    })

    if (profile) {
      console.log('✅ Профиль исполнителя найден:')
      console.log(`   Верифицирован: ${profile.isVerified}`)
      console.log(`   Статус верификации: ${profile.verificationStatus}`)
    } else {
      console.log('❌ Профиль исполнителя не найден')
    }
    
    console.log('🎉 Исполнитель готов к работе!')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixExecutorStatus()
