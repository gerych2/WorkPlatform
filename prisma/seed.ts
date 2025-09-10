
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Очищаем существующие данные в правильном порядке
  try {
    await prisma.review.deleteMany()
    await prisma.order.deleteMany()
    await prisma.subscription.deleteMany()
    await prisma.executorDocument.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.complaint.deleteMany()
    await prisma.executorProfile.deleteMany()
    await prisma.user.deleteMany()
    await prisma.category.deleteMany()
  } catch (error) {
    console.log('⚠️  Some data could not be cleared, continuing...')
  }

  console.log('🗑️  Existing data cleared')

  // Создаем категории
  const categoryData = [
    // Строительство и ремонт
    { name: 'Электрик', description: 'Электромонтажные работы', icon: '⚡' },
    { name: 'Сантехник', description: 'Сантехнические работы', icon: '🔧' },
    { name: 'Ремонт квартир', description: 'Комплексный ремонт жилых помещений', icon: '🏠' },
    { name: 'Отделочные работы', description: 'Поклейка обоев, покраска, плитка', icon: '🎨' },
    { name: 'Натяжные потолки', description: 'Установка натяжных потолков', icon: '📐' },
    { name: 'Полы и напольные покрытия', description: 'Укладка ламината, паркета, линолеума', icon: '🪵' },
    { name: 'Окна и двери', description: 'Установка и ремонт окон и дверей', icon: '🚪' },
    { name: 'Балконы и лоджии', description: 'Остекление и отделка балконов', icon: '🏡' },
    
    // Техника и электроника
    { name: 'Ремонт бытовой техники', description: 'Ремонт и обслуживание техники', icon: '🔨' },
    { name: 'Компьютерная помощь', description: 'IT-услуги и ремонт компьютеров', icon: '💻' },
    { name: 'Ремонт телефонов', description: 'Ремонт смартфонов и планшетов', icon: '📱' },
    { name: 'Установка кондиционеров', description: 'Монтаж и обслуживание кондиционеров', icon: '❄️' },
    { name: 'Видеонаблюдение', description: 'Установка систем видеонаблюдения', icon: '📹' },
    { name: 'Домофоны и СКУД', description: 'Установка домофонов и систем контроля', icon: '🔐' },
    
    // Уборка и клининг
    { name: 'Уборка квартир', description: 'Клининговые услуги для квартир', icon: '🧹' },
    { name: 'Уборка офисов', description: 'Клининговые услуги для офисов', icon: '🏢' },
    { name: 'Химчистка', description: 'Химчистка мебели и ковров', icon: '🧽' },
    { name: 'Мойка окон', description: 'Мойка окон и витрин', icon: '🪟' },
    { name: 'Уборка после ремонта', description: 'Уборка строительного мусора', icon: '🗑️' },
    
    // Транспорт и логистика
    { name: 'Грузоперевозки', description: 'Перевозка грузов и мебели', icon: '🚚' },
    { name: 'Пассажирские перевозки', description: 'Такси и пассажирские услуги', icon: '🚗' },
    { name: 'Эвакуатор', description: 'Эвакуация автомобилей', icon: '🚛' },
    { name: 'Доставка', description: 'Курьерские услуги и доставка', icon: '📦' },
    
    // Красота и здоровье
    { name: 'Парикмахер', description: 'Стрижки, окрашивание, укладки', icon: '💇' },
    { name: 'Маникюр и педикюр', description: 'Уход за ногтями', icon: '💅' },
    { name: 'Массаж', description: 'Лечебный и расслабляющий массаж', icon: '🤲' },
    { name: 'Косметология', description: 'Косметологические услуги', icon: '✨' },
    { name: 'Фитнес-тренер', description: 'Персональные тренировки', icon: '💪' },
    
    // Образование и консультации
    { name: 'Репетиторство', description: 'Частные уроки и подготовка к экзаменам', icon: '📚' },
    { name: 'Изучение языков', description: 'Обучение иностранным языкам', icon: '🗣️' },
    { name: 'Музыкальные уроки', description: 'Обучение игре на музыкальных инструментах', icon: '🎵' },
    { name: 'Юридические консультации', description: 'Правовая помощь и консультации', icon: '⚖️' },
    { name: 'Бухгалтерские услуги', description: 'Ведение учета и отчетности', icon: '📊' },
    { name: 'IT-консультации', description: 'Консультации по информационным технологиям', icon: '💻' },
    
    // Фото и видео
    { name: 'Фотограф', description: 'Фотосъемка различных мероприятий', icon: '📸' },
    { name: 'Видеограф', description: 'Видеосъемка и монтаж', icon: '🎬' },
    { name: 'Оператор дрона', description: 'Аэросъемка с помощью дронов', icon: '🚁' },
    
    // События и праздники
    { name: 'Организация мероприятий', description: 'Организация праздников и корпоративов', icon: '🎉' },
    { name: 'Аниматоры', description: 'Детские аниматоры и ведущие', icon: '🎭' },
    { name: 'Музыканты', description: 'Музыкальное сопровождение мероприятий', icon: '🎤' },
    { name: 'Флористы', description: 'Оформление цветами и букетами', icon: '🌸' },
    
    // Сад и огород
    { name: 'Ландшафтный дизайн', description: 'Озеленение и благоустройство участков', icon: '🌳' },
    { name: 'Садовник', description: 'Уход за садом и растениями', icon: '🌱' },
    { name: 'Уборка снега', description: 'Расчистка снега и наледи', icon: '❄️' },
    
    // Безопасность
    { name: 'Охранные услуги', description: 'Охрана объектов и мероприятий', icon: '🛡️' },
    { name: 'Монтаж сигнализации', description: 'Установка охранных систем', icon: '🚨' },
    
    // Прочие услуги
    { name: 'Няня', description: 'Уход за детьми', icon: '👶' },
    { name: 'Сиделка', description: 'Уход за пожилыми людьми', icon: '👴' },
    { name: 'Выгул собак', description: 'Услуги по выгулу домашних животных', icon: '🐕' },
    { name: 'Химчистка обуви', description: 'Чистка и ремонт обуви', icon: '👟' },
    { name: 'Ремонт часов', description: 'Ремонт и обслуживание часов', icon: '⌚' },
    { name: 'Ремонт обуви', description: 'Ремонт и восстановление обуви', icon: '👞' },
    { name: 'Изготовление ключей', description: 'Дублирование и изготовление ключей', icon: '🗝️' },
    { name: 'Риелторские услуги', description: 'Помощь в покупке и продаже недвижимости', icon: '🏘️' },
    { name: 'Страховые услуги', description: 'Оформление страховых полисов', icon: '📋' },
    { name: 'Туристические услуги', description: 'Организация путешествий и туров', icon: '✈️' },
  ]

  const categories = await Promise.all(
    categoryData.map(category => 
      prisma.category.create({
        data: {
          ...category,
          isActive: true,
          executorCount: 0,
          orderCount: 0
        }
      })
    )
  )

  console.log('🏷️ Categories created')

  // Создаем администраторов
  const admin1 = await prisma.user.create({
    data: {
      name: 'Главный администратор',
      email: 'admin@serviceplatform.by',
      phone: '+375 (29) 000-00-00',
      passwordHash: '$2b$10$hashed_password_here',
      role: 'admin',
      status: 'active',
      location: 'Минск',
      isVerified: true,
    }
  })

  const admin2 = await prisma.user.create({
    data: {
      name: 'Менеджер платформы',
      email: 'manager@serviceplatform.by',
      phone: '+375 (29) 000-00-01',
      passwordHash: '$2b$10$hashed_password_here',
      role: 'admin',
      status: 'active',
      location: 'Минск',
      isVerified: true,
    }
  })

  console.log('👑 Admins created')

    console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })