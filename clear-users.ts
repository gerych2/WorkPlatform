// Скрипт для удаления всех пользователей из базы данных
// Запускать через: npx tsx clear-users.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearUsers() {
  try {
    console.log('🗑️ Удаляем всех существующих пользователей...')
    
    // Удаляем всех пользователей
    const result = await prisma.user.deleteMany({})
    console.log(`✅ Удалено пользователей: ${result.count}`)
    
    console.log('🎉 База данных очищена от пользователей!')
    console.log('\n📋 Теперь вы можете:')
    console.log('1. Зарегистрировать новых пользователей через форму')
    console.log('2. Или создать тестовых через Prisma Studio')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearUsers()

