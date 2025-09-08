import dotenv from 'dotenv'

// Загружаем переменные окружения ПЕРВЫМИ
dotenv.config()

import { emailService } from '../lib/email/emailService'

async function testEmailSystem() {
  console.log('📧 Тестирование email системы...\n')

  // Переинициализируем EmailService после загрузки переменных окружения
  emailService.reinitialize()

  // Проверяем загрузку переменных окружения
  console.log('🔍 Проверка переменных окружения:')
  console.log(`   FORMSPREE_ENDPOINT: ${process.env.FORMSPREE_ENDPOINT || 'НЕ УСТАНОВЛЕН'}`)
  console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'НЕ УСТАНОВЛЕН'}`)
  console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || 'НЕ УСТАНОВЛЕН'}`)
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'НЕ УСТАНОВЛЕН'}`)
  console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? 'УСТАНОВЛЕН' : 'НЕ УСТАНОВЛЕН'}`)
  console.log('')

  try {
    // Проверяем подключение к email серверу
    console.log('1. Проверка подключения к email серверу...')
    const isConnected = await emailService.verifyConnection()
    
    if (!isConnected) {
      console.log('❌ Не удалось подключиться к email серверу')
      console.log('💡 Убедитесь, что в .env файле указаны правильные настройки:')
      console.log('   EMAIL_HOST=smtp.gmail.com')
      console.log('   EMAIL_PORT=587')
      console.log('   EMAIL_USER=your-email@gmail.com')
      console.log('   EMAIL_PASS=your-app-password')
      return
    }

    console.log('✅ Подключение к email серверу успешно\n')

    // Тестируем отправку уведомления о повышении уровня
    console.log('2. Тестирование уведомления о повышении уровня...')
    const testEmail = 'test@example.com' // Используем тестовый email
    
    console.log(`   Используем тестовый email: ${testEmail}`)

    const levelUpResult = await emailService.sendLevelUpNotification(testEmail, {
      newLevel: 3,
      title: 'Мастер',
      icon: '🏆',
      description: 'Отличная работа! Вы достигли нового уровня!'
    })

    if (levelUpResult) {
      console.log('✅ Уведомление о повышении уровня отправлено')
    } else {
      console.log('❌ Ошибка отправки уведомления о повышении уровня')
    }

    // Тестируем отправку уведомления о новом заказе
    console.log('\n3. Тестирование уведомления о новом заказе...')
    const newOrderResult = await emailService.sendNewOrderNotification(testEmail, {
      id: 123,
      serviceDescription: 'Ремонт компьютера',
      clientName: 'Иван Петров',
      address: 'ул. Ленина, 10',
      phone: '+7 (999) 123-45-67',
      orderDate: '15.01.2024',
      orderTime: '14:00',
      totalPrice: 2500
    })

    if (newOrderResult) {
      console.log('✅ Уведомление о новом заказе отправлено')
    } else {
      console.log('❌ Ошибка отправки уведомления о новом заказе')
    }

    // Тестируем отправку уведомления о выполнении заказа
    console.log('\n4. Тестирование уведомления о выполнении заказа...')
    const completedOrderResult = await emailService.sendOrderCompletedNotification(testEmail, {
      id: 123,
      serviceDescription: 'Ремонт компьютера',
      executorName: 'Алексей Смирнов',
      totalPrice: 2500
    })

    if (completedOrderResult) {
      console.log('✅ Уведомление о выполнении заказа отправлено')
    } else {
      console.log('❌ Ошибка отправки уведомления о выполнении заказа')
    }

    // Тестируем рассылку
    console.log('\n5. Тестирование рассылки...')
    const newsletterResult = await emailService.sendNewsletter([testEmail], {
      subject: 'Тестовая рассылка',
      content: '<h2>Привет!</h2><p>Это тестовое письмо для проверки системы рассылок.</p>',
      textContent: 'Привет! Это тестовое письмо для проверки системы рассылок.',
      ctaText: 'Перейти на сайт',
      ctaUrl: 'https://example.com'
    })

    if (newsletterResult.success > 0) {
      console.log(`✅ Рассылка отправлена (успешно: ${newsletterResult.success}, ошибок: ${newsletterResult.failed})`)
    } else {
      console.log('❌ Ошибка отправки рассылки')
    }

    console.log('\n🎉 Тестирование email системы завершено!')
    console.log('💡 Проверьте почтовый ящик для получения тестовых писем')

  } catch (error) {
    console.error('❌ Ошибка при тестировании email системы:', error)
  }
}

testEmailSystem()
