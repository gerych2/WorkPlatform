import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Начинаем настройку категорий и исполнителя...')

  // 1. Удаляем тестового пользователя (если есть)
  console.log('🗑️ Удаляем тестового пользователя...')
  try {
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })
    
    if (testUser) {
      // Удаляем связанные записи
      await prisma.userAchievement.deleteMany({
        where: { userId: testUser.id }
      })
      await prisma.xpHistory.deleteMany({
        where: { userId: testUser.id }
      })
      await prisma.referralReward.deleteMany({
        where: { OR: [{ referrerId: testUser.id }, { referredId: testUser.id }] }
      })
      await prisma.notification.deleteMany({
        where: { userId: testUser.id }
      })
      await prisma.supportTicket.deleteMany({
        where: { userId: testUser.id }
      })
      await prisma.supportMessage.deleteMany({
        where: { userId: testUser.id }
      })
      
      await prisma.user.delete({
        where: { id: testUser.id }
      })
      console.log('✅ Тестовый пользователь удален')
    } else {
      console.log('ℹ️ Тестовый пользователь не найден')
    }
  } catch (error) {
    console.log('⚠️ Ошибка при удалении тестового пользователя:', error)
  }

  // 2. Добавляем категории
  console.log('📂 Добавляем категории...')
  
  const categories = [
    {
      name: 'Ремонт и обслуживание',
      description: 'Ремонт техники, сантехники, электрики',
      icon: '🔧',
      executorCount: 0,
      orderCount: 0
    },
    {
      name: 'Уборка и клининг',
      description: 'Домашняя уборка, генеральная уборка, химчистка',
      icon: '🧹',
      executorCount: 0,
      orderCount: 0
    },
    {
      name: 'Доставка и перевозки',
      description: 'Доставка товаров, переезды, грузоперевозки',
      icon: '🚚',
      executorCount: 0,
      orderCount: 0
    },
    {
      name: 'IT и программирование',
      description: 'Разработка сайтов, мобильных приложений, техническая поддержка',
      icon: '💻',
      executorCount: 0,
      orderCount: 0
    },
    {
      name: 'Образование и консультации',
      description: 'Репетиторство, консультации, обучение',
      icon: '📚',
      executorCount: 0,
      orderCount: 0
    },
    {
      name: 'Красота и здоровье',
      description: 'Парикмахерские услуги, маникюр, массаж',
      icon: '💄',
      executorCount: 0,
      orderCount: 0
    },
    {
      name: 'Ремонт автомобилей',
      description: 'Автосервис, диагностика, покраска',
      icon: '🚗',
      executorCount: 0,
      orderCount: 0
    },
    {
      name: 'Фото и видео',
      description: 'Фотосессии, видеосъемка, монтаж',
      icon: '📸',
      executorCount: 0,
      orderCount: 0
    }
  ]

  for (const categoryData of categories) {
    try {
      const existingCategory = await prisma.category.findFirst({
        where: { name: categoryData.name }
      })

      if (!existingCategory) {
        await prisma.category.create({
          data: categoryData
        })
        console.log(`✅ Категория "${categoryData.name}" добавлена`)
      } else {
        console.log(`ℹ️ Категория "${categoryData.name}" уже существует`)
      }
    } catch (error) {
      console.log(`❌ Ошибка при добавлении категории "${categoryData.name}":`, error)
    }
  }

  // 3. Создаем исполнителя
  console.log('👨‍💼 Создаем исполнителя...')
  
  const hashedPassword = await bcrypt.hash('executor123', 10)
  
  try {
    const existingExecutor = await prisma.user.findFirst({
      where: { email: 'executor@example.com' }
    })

    if (!existingExecutor) {
      const executor = await prisma.user.create({
        data: {
          name: 'Александр Петров',
          email: 'executor@example.com',
          phone: '+375 29 123-45-67',
          passwordHash: hashedPassword,
          role: 'executor',
          status: 'active',
          location: 'Минск, Беларусь',
          bio: 'Опытный мастер с 5-летним стажем. Специализируюсь на ремонте бытовой техники и сантехники. Качественно и быстро выполню любую работу.',
          isVerified: true,
          verificationStatus: 'verified',
          clientRating: 4.8,
          clientReviewsCount: 15,
          experiencePoints: 150,
          totalXpEarned: 150,
          currentLevel: 2,
          referralCode: 'EXEC2024',
          isBlocked: false
        }
      })
      console.log(`✅ Исполнитель создан: ${executor.name} (ID: ${executor.id})`)
    } else {
      console.log('ℹ️ Исполнитель уже существует')
    }
  } catch (error) {
    console.log('❌ Ошибка при создании исполнителя:', error)
  }

  console.log('🎉 Настройка завершена!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
