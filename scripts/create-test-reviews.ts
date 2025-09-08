import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestReviews() {
  try {
    console.log('🔍 Ищем пользователей...')
    
    // Находим клиента и исполнителя
    const client = await prisma.user.findFirst({
      where: { role: 'client' }
    })
    
    const executor = await prisma.user.findFirst({
      where: { role: 'executor' }
    })
    
    if (!client) {
      console.log('❌ Клиент не найден')
      return
    }
    
    if (!executor) {
      console.log('❌ Исполнитель не найден')
      return
    }
    
    console.log('✅ Найден клиент:', client.name, client.email)
    console.log('✅ Найден исполнитель:', executor.name, executor.email)
    
    // Находим завершенный заказ
    const completedOrder = await prisma.order.findFirst({
      where: {
        status: 'completed',
        clientId: client.id,
        executorId: executor.id
      }
    })
    
    if (!completedOrder) {
      console.log('❌ Завершенный заказ не найден')
      return
    }
    
    console.log('✅ Найден завершенный заказ:', completedOrder.id)
    
    // Создаем отзыв клиента на исполнителя
    const clientReview = await prisma.review.create({
      data: {
        orderId: completedOrder.id,
        clientId: client.id,
        executorId: executor.id,
        reviewerId: client.id, // Клиент оставляет отзыв
        reviewedId: executor.id, // На исполнителя
        rating: 5,
        comment: 'Отличная работа! Очень доволен результатом.'
      }
    })
    
    console.log('✅ Создан отзыв клиента:', clientReview.id)
    
    // Создаем отзыв исполнителя на клиента
    const executorReview = await prisma.review.create({
      data: {
        orderId: completedOrder.id,
        clientId: client.id,
        executorId: executor.id,
        reviewerId: executor.id, // Исполнитель оставляет отзыв
        reviewedId: client.id, // На клиента
        rating: 4,
        comment: 'Хороший клиент, все четко объяснил.'
      }
    })
    
    console.log('✅ Создан отзыв исполнителя:', executorReview.id)
    
    // Обновляем рейтинги
    console.log('🔄 Обновляем рейтинги...')
    
    // Обновляем рейтинг исполнителя
    const executorReviews = await prisma.review.findMany({
      where: { reviewedId: executor.id },
      select: { rating: true }
    })
    
    const executorTotalRating = executorReviews.reduce((sum, review) => sum + review.rating, 0)
    const executorAverageRating = executorTotalRating / executorReviews.length
    
    await prisma.executorProfile.update({
      where: { userId: executor.id },
      data: {
        rating: executorAverageRating,
        reviewsCount: executorReviews.length
      }
    })
    
    console.log('✅ Обновлен рейтинг исполнителя:', executorAverageRating.toFixed(2))
    
    // Обновляем рейтинг клиента
    const clientReviews = await prisma.review.findMany({
      where: { reviewedId: client.id },
      select: { rating: true }
    })
    
    const clientTotalRating = clientReviews.reduce((sum, review) => sum + review.rating, 0)
    const clientAverageRating = clientTotalRating / clientReviews.length
    
    await prisma.user.update({
      where: { id: client.id },
      data: {
        clientRating: clientAverageRating,
        clientReviewsCount: clientReviews.length
      }
    })
    
    console.log('✅ Обновлен рейтинг клиента:', clientAverageRating.toFixed(2))
    
    // Проверяем результат
    const updatedClient = await prisma.user.findUnique({
      where: { id: client.id },
      select: {
        name: true,
        clientRating: true,
        clientReviewsCount: true
      }
    })
    
    const updatedExecutor = await prisma.executorProfile.findUnique({
      where: { userId: executor.id },
      select: {
        rating: true,
        reviewsCount: true
      }
    })
    
    console.log('📊 Итоговые рейтинги:')
    console.log('Клиент:', updatedClient?.name, '- Рейтинг:', updatedClient?.clientRating, '- Отзывов:', updatedClient?.clientReviewsCount)
    console.log('Исполнитель:', executor.name, '- Рейтинг:', updatedExecutor?.rating, '- Отзывов:', updatedExecutor?.reviewsCount)
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestReviews()
