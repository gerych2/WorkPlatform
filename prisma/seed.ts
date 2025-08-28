import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Очищаем существующие данные
  await prisma.review.deleteMany()
  await prisma.order.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.executorDocument.deleteMany()
  await prisma.executorProfile.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.complaint.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  console.log('🗑️  Existing data cleared')

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
      legalStatus: null
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
      legalStatus: null
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