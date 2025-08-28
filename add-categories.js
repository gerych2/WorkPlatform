const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addCategories() {
  try {
    console.log('Добавляем категории...')
    
    // Создаем категории
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Электрик',
          description: 'Услуги электрика: установка, ремонт, замена',
          icon: '⚡',
          isActive: true,
          executorCount: 0,
          orderCount: 0
        }
      }),
      prisma.category.create({
        data: {
          name: 'Сантехник',
          description: 'Услуги сантехника: установка, ремонт, замена',
          icon: '🚰',
          isActive: true,
          executorCount: 0,
          orderCount: 0
        }
      }),
      prisma.category.create({
        data: {
          name: 'Парикмахер',
          description: 'Услуги парикмахера: стрижка, окрашивание, укладка',
          icon: '✂️',
          isActive: true,
          executorCount: 0,
          orderCount: 0
        }
      }),
      prisma.category.create({
        data: {
          name: 'Мастер по ремонту',
          description: 'Ремонт бытовой техники, мебели, электроники',
          icon: '🛠️',
          isActive: true,
          executorCount: 0,
          orderCount: 0
        }
      })
    ])

    console.log('Категории созданы:', categories.map(c => c.name))
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addCategories()

