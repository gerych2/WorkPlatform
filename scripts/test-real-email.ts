import dotenv from 'dotenv'

// Загружаем переменные окружения ПЕРВЫМИ
dotenv.config()

import { emailService } from '../lib/email/emailService'

async function testRealEmail() {
  console.log('📧 Тестирование реальной отправки email...\n')

  // Переинициализируем EmailService после загрузки переменных окружения
  emailService.reinitialize()

  // Проверяем загрузку переменных окружения
  console.log('🔍 Проверка переменных окружения:')
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
      return
    }

    console.log('✅ Подключение к email серверу успешно\n')

    // Отправляем тестовое письмо на ваш реальный email
    console.log('2. Отправка тестового письма на troskomaksim96@gmail.com...')
    
    const result = await emailService.sendEmail('troskomaksim96@gmail.com', {
      subject: '🎉 Тестовая отправка с платформы!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 Тестовая отправка!</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Поздравляем!</h2>
            <p>Если вы видите это письмо, значит система email рассылки работает корректно!</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <h3 style="color: #333;">Детали теста:</h3>
              <p><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
              <p><strong>Отправитель:</strong> ${process.env.EMAIL_USER}</p>
              <p><strong>Получатель:</strong> troskomaksim96@gmail.com</p>
              <p><strong>Статус:</strong> ✅ Успешно отправлено</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:3000" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Перейти на платформу
              </a>
            </div>
          </div>
        </div>
      `,
      text: 'Поздравляем! Если вы видите это письмо, значит система email рассылки работает корректно!'
    })

    if (result) {
      console.log('✅ Тестовое письмо успешно отправлено на troskomaksim96@gmail.com')
      console.log('📧 Проверьте вашу почту!')
    } else {
      console.log('❌ Ошибка отправки тестового письма')
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании email системы:', error)
  }
}

testRealEmail()
