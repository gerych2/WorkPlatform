const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createCategories() {
  try {
    console.log('Создание категорий...')

    const categories = [
      {
        name: 'Ремонт техники',
        description: 'Ремонт компьютеров, ноутбуков, телефонов, планшетов и другой электроники',
        icon: '🔧',
        isActive: true
      },
      {
        name: 'Уборка',
        description: 'Генеральная уборка, химчистка, уборка после ремонта',
        icon: '🧹',
        isActive: true
      },
      {
        name: 'Ремонт и отделка',
        description: 'Ремонт квартир, отделочные работы, сантехника, электрика',
        icon: '🏠',
        isActive: true
      },
      {
        name: 'Красота и здоровье',
        description: 'Парикмахерские услуги, маникюр, массаж, фитнес-тренер',
        icon: '💅',
        isActive: true
      },
      {
        name: 'Образование',
        description: 'Репетиторство, курсы, обучение языкам, подготовка к экзаменам',
        icon: '📚',
        isActive: true
      },
      {
        name: 'Транспорт',
        description: 'Доставка, перевозка, курьерские услуги, такси',
        icon: '🚗',
        isActive: true
      },
      {
        name: 'IT и программирование',
        description: 'Разработка сайтов, мобильных приложений, настройка ПО',
        icon: '💻',
        isActive: true
      },
      {
        name: 'Фото и видео',
        description: 'Фотосъемка, видеосъемка, монтаж, обработка',
        icon: '📸',
        isActive: true
      },
      {
        name: 'Сад и огород',
        description: 'Ландшафтный дизайн, уход за растениями, садоводство',
        icon: '🌱',
        isActive: true
      },
      {
        name: 'Ремонт одежды',
        description: 'Пошив, ремонт, подгонка одежды, обуви',
        icon: '👕',
        isActive: true
      },
      {
        name: 'Установка и настройка',
        description: 'Установка мебели, техники, настройка оборудования',
        icon: '⚙️',
        isActive: true
      },
      {
        name: 'Консультации',
        description: 'Юридические, финансовые, психологические консультации',
        icon: '💼',
        isActive: true
      }
    ]

    for (const category of categories) {
      const createdCategory = await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
          icon: category.icon,
          isActive: category.isActive,
          executorCount: 0,
          orderCount: 0
        }
      })
      console.log(`✅ Создана категория: ${createdCategory.name}`)
    }

    console.log('\n🎉 Все категории успешно созданы!')
    console.log(`📊 Всего категорий: ${categories.length}`)

  } catch (error) {
    console.error('Ошибка при создании категорий:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCategories()




