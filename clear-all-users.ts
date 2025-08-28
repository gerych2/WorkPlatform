// Скрипт для удаления всех пользователей из базы данных (кроме админов)
// Запускать через: npx tsx clear-all-users.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearAllUsers() {
  try {
    console.log('🗑️ Удаляем всех пользователей (кроме админов)...')

    // Удаляем всех пользователей, кроме админов
    const result = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'admin'
        }
      }
    })
    
    console.log(`✅ Удалено пользователей: ${result.count}`)

    // Удаляем все профили исполнителей
    const profileResult = await prisma.executorProfile.deleteMany({})
    console.log(`✅ Удалено профилей исполнителей: ${profileResult.count}`)

    // Удаляем все документы исполнителей
    const docResult = await prisma.executorDocument.deleteMany({})
    console.log(`✅ Удалено документов: ${docResult.count}`)

    // Удаляем все подписки
    const subResult = await prisma.subscription.deleteMany({})
    console.log(`✅ Удалено подписок: ${subResult.count}`)

    // Удаляем все заказы
    const orderResult = await prisma.order.deleteMany({})
    console.log(`✅ Удалено заказов: ${orderResult.count}`)

    // Удаляем все отзывы
    const reviewResult = await prisma.review.deleteMany({})
    console.log(`✅ Удалено отзывов: ${reviewResult.count}`)

    // Удаляем все уведомления
    const notifResult = await prisma.notification.deleteMany({})
    console.log(`✅ Удалено уведомлений: ${notifResult.count}`)

    // Удаляем все жалобы
    const complaintResult = await prisma.complaint.deleteMany({})
    console.log(`✅ Удалено жалоб: ${complaintResult.count}`)

    console.log('🎉 База данных полностью очищена от пользователей!')
    console.log('\n📋 Теперь вы можете:')
    console.log('1. Зарегистрировать новых пользователей через форму')
    console.log('2. Или создать тестовых через Prisma Studio')

  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllUsers()

