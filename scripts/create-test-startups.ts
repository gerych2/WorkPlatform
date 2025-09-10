import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestStartups() {
  try {
    console.log('🚀 Создание тестовых стартапов...')

    // Создаем тестового пользователя-создателя стартапов
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const creator = await prisma.user.upsert({
      where: { email: 'startup.creator@example.com' },
      update: {},
      create: {
        name: 'Александр Иванов',
        email: 'startup.creator@example.com',
        passwordHash: hashedPassword,
        role: 'client',
        status: 'active',
        phone: '+7 (999) 123-45-67',
        location: 'Москва',
        bio: 'Предприниматель и инноватор'
      }
    })

    console.log('✅ Создан пользователь-создатель:', creator.name)

    // Создаем тестовые стартапы
    const startups = [
      {
        title: 'Эко-приложение для сортировки мусора',
        description: 'Разрабатываем мобильное приложение, которое поможет людям правильно сортировать мусор и находить ближайшие пункты приема вторсырья. Приложение будет использовать ИИ для распознавания типов отходов по фото.',
        category: 'environmental',
        createdBy: creator.id
      },
      {
        title: 'Платформа для онлайн-обучения детей',
        description: 'Создаем интерактивную платформу для дистанционного обучения детей с использованием геймификации и VR-технологий. Платформа будет адаптироваться под индивидуальные потребности каждого ребенка.',
        category: 'education',
        createdBy: creator.id
      },
      {
        title: 'Сервис для пожилых людей',
        description: 'Разрабатываем мобильное приложение, которое поможет пожилым людям оставаться независимыми. Включает функции вызова помощи, напоминания о приеме лекарств, видеосвязь с родственниками.',
        category: 'health',
        createdBy: creator.id
      },
      {
        title: 'Блокчейн-платформа для благотворительности',
        description: 'Создаем прозрачную платформу для благотворительных пожертвований на блокчейне. Каждое пожертвование будет отслеживаться от донора до конечного получателя помощи.',
        category: 'social',
        createdBy: creator.id
      },
      {
        title: 'ИИ-ассистент для малого бизнеса',
        description: 'Разрабатываем ИИ-ассистента, который поможет владельцам малого бизнеса с маркетингом, планированием, анализом данных и принятием решений. Интеграция с популярными CRM-системами.',
        category: 'business',
        createdBy: creator.id
      },
      {
        title: 'Приложение для изучения программирования',
        description: 'Создаем интерактивное приложение для изучения программирования с пошаговыми уроками, практическими заданиями и системой менторства. Поддержка множества языков программирования.',
        category: 'tech',
        createdBy: creator.id
      }
    ]

    for (const startupData of startups) {
      const startup = await prisma.startup.create({
        data: startupData
      })
      console.log(`✅ Создан стартап: ${startup.title}`)

      // Создаем несколько задач для каждого стартапа
      const tasks = [
        {
          title: 'Исследование рынка и конкурентов',
          description: 'Провести анализ целевой аудитории, изучить существующие решения на рынке, определить уникальные преимущества продукта.',
          priority: 'high',
          startupId: startup.id
        },
        {
          title: 'Создание MVP (минимально жизнеспособного продукта)',
          description: 'Разработать базовую версию продукта с основным функционалом для тестирования гипотез.',
          priority: 'urgent',
          startupId: startup.id
        },
        {
          title: 'Разработка дизайна и пользовательского интерфейса',
          description: 'Создать удобный и привлекательный интерфейс, провести пользовательское тестирование.',
          priority: 'medium',
          startupId: startup.id
        },
        {
          title: 'Маркетинговая стратегия',
          description: 'Разработать план продвижения продукта, создать контент-план, настроить каналы коммуникации.',
          priority: 'medium',
          startupId: startup.id
        }
      ]

      for (const taskData of tasks) {
        await prisma.startupTask.create({
          data: taskData
        })
      }

      // Создаем несколько обновлений
      const updates = [
        {
          title: 'Старт проекта',
          content: `Мы рады объявить о начале работы над проектом "${startup.title}"! Присоединяйтесь к нашей команде и помогите нам воплотить эту идею в жизнь.`,
          startupId: startup.id,
          authorId: creator.id
        },
        {
          title: 'Первые результаты',
          content: 'Команда активно работает над проектом. Уже есть первые наработки и планы на ближайшие недели. Следите за обновлениями!',
          startupId: startup.id,
          authorId: creator.id
        }
      ]

      for (const updateData of updates) {
        await prisma.startupUpdate.create({
          data: updateData
        })
      }
    }

    console.log('🎉 Все тестовые стартапы созданы успешно!')
    console.log('📊 Статистика:')
    console.log(`- Создано стартапов: ${startups.length}`)
    console.log(`- Создано задач: ${startups.length * 4}`)
    console.log(`- Создано обновлений: ${startups.length * 2}`)

  } catch (error) {
    console.error('❌ Ошибка создания тестовых стартапов:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestStartups()

