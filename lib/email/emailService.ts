import nodemailer from 'nodemailer'
import { formspreeService } from './formspreeService'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter!: nodemailer.Transporter
  private isDevelopment!: boolean

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Проверяем наличие Gmail настроек
    this.isDevelopment = !process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS
    
    console.log('🔧 EmailService инициализация:')
    console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'НЕ УСТАНОВЛЕН'}`)
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'НЕ УСТАНОВЛЕН'}`)
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? 'УСТАНОВЛЕН' : 'НЕ УСТАНОВЛЕН'}`)
    console.log(`   Режим: ${this.isDevelopment ? 'РАЗРАБОТКИ' : 'ПРОДАКШЕН'}`)
    
    if (this.isDevelopment) {
      // Для разработки используем мок-транспорт
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      })
    } else {
      // Для продакшена используем реальный SMTP
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || ''
        },
        tls: {
          rejectUnauthorized: false
        }
      })
    }
  }

  // Переинициализация после загрузки переменных окружения
  reinitialize() {
    this.initialize()
  }

  // Проверка подключения
  async verifyConnection(): Promise<boolean> {
    try {
      if (this.isDevelopment) {
        console.log('✅ Email сервер готов к отправке (режим разработки)')
        return true
      }
      
      // Проверяем Gmail SMTP подключение
      
      await this.transporter.verify()
      console.log('✅ Email сервер готов к отправке')
      return true
    } catch (error) {
      console.error('❌ Ошибка подключения к email серверу:', error)
      return false
    }
  }

  // Отправка email
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      if (this.isDevelopment) {
        // В режиме разработки логируем с деталями
        console.log('📧 [DEV] Email отправлен:')
        console.log(`   Кому: ${to}`)
        console.log(`   Тема: ${template.subject}`)
        console.log(`   HTML: ${template.html.substring(0, 100)}...`)
        console.log(`   📝 В продакшене это письмо будет отправлено на: ${to}`)
        return true
      }

      // Используем Gmail SMTP для отправки
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      await this.transporter.sendMail(mailOptions)
      console.log('📧 Email отправлен через Gmail:', to)
      return true
    } catch (error) {
      console.error('❌ Ошибка отправки email:', error)
      return false
    }
  }

  // Отправка уведомления о новом заказе (исполнителю)
  async sendNewOrderNotification(executorEmail: string, orderData: any): Promise<boolean> {
    if (this.isDevelopment) {
      return await this.sendEmail(executorEmail, {
        subject: '🎯 Новый заказ для вас!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎯 Новый заказ!</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <h2 style="color: #333;">Детали заказа:</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p><strong>Услуга:</strong> ${orderData.serviceDescription || 'Не указано'}</p>
                <p><strong>Клиент:</strong> ${orderData.clientName || 'Не указано'}</p>
                <p><strong>Адрес:</strong> ${orderData.address || 'Не указано'}</p>
                <p><strong>Телефон:</strong> ${orderData.phone || 'Не указано'}</p>
                <p><strong>Дата:</strong> ${orderData.orderDate || 'Не указано'}</p>
                <p><strong>Время:</strong> ${orderData.orderTime || 'Не указано'}</p>
                <p><strong>Цена:</strong> ${orderData.totalPrice || 0} ₽</p>
              </div>
            </div>
          </div>
        `,
        text: `Новый заказ! Услуга: ${orderData.serviceDescription}, Клиент: ${orderData.clientName}, Цена: ${orderData.totalPrice} ₽`
      })
    }

    return await this.sendEmail(executorEmail, {
      subject: '🎯 Новый заказ для вас!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎯 Новый заказ!</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Детали заказа:</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p><strong>Услуга:</strong> ${orderData.serviceDescription || 'Не указано'}</p>
              <p><strong>Клиент:</strong> ${orderData.clientName || 'Не указано'}</p>
              <p><strong>Адрес:</strong> ${orderData.address || 'Не указано'}</p>
              <p><strong>Телефон:</strong> ${orderData.phone || 'Не указано'}</p>
              <p><strong>Дата:</strong> ${orderData.orderDate || 'Не указано'}</p>
              <p><strong>Время:</strong> ${orderData.orderTime || 'Не указано'}</p>
              <p><strong>Цена:</strong> ${orderData.totalPrice || 0} ₽</p>
            </div>
          </div>
        </div>
      `,
      text: `Новый заказ! Услуга: ${orderData.serviceDescription}, Клиент: ${orderData.clientName}, Цена: ${orderData.totalPrice} ₽`
    })
  }

  // Отправка уведомления о выполнении заказа (клиенту)
  async sendOrderCompletedNotification(clientEmail: string, orderData: any): Promise<boolean> {
    if (this.isDevelopment) {
      return await this.sendEmail(clientEmail, {
        subject: '✅ Ваш заказ выполнен!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">✅ Заказ выполнен!</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <h2 style="color: #333;">Ваш заказ успешно выполнен!</h2>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p><strong>Услуга:</strong> ${orderData.serviceDescription || 'Не указано'}</p>
                <p><strong>Исполнитель:</strong> ${orderData.executorName || 'Не указано'}</p>
                <p><strong>Дата выполнения:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Сумма:</strong> ${orderData.totalPrice || 0} ₽</p>
              </div>
            </div>
          </div>
        `,
        text: `Заказ выполнен! Услуга: ${orderData.serviceDescription}, Исполнитель: ${orderData.executorName}, Сумма: ${orderData.totalPrice} ₽`
      })
    }

    return await this.sendEmail(clientEmail, {
      subject: '✅ Ваш заказ выполнен!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Заказ выполнен!</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Ваш заказ успешно выполнен!</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p><strong>Услуга:</strong> ${orderData.serviceDescription || 'Не указано'}</p>
              <p><strong>Исполнитель:</strong> ${orderData.executorName || 'Не указано'}</p>
              <p><strong>Дата выполнения:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
              <p><strong>Сумма:</strong> ${orderData.totalPrice || 0} ₽</p>
            </div>
          </div>
        </div>
      `,
      text: `Заказ выполнен! Услуга: ${orderData.serviceDescription}, Исполнитель: ${orderData.executorName}, Сумма: ${orderData.totalPrice} ₽`
    })
  }

  // Отправка уведомления о повышении уровня
  async sendLevelUpNotification(userEmail: string, levelData: any): Promise<boolean> {
    if (this.isDevelopment) {
      return await this.sendEmail(userEmail, {
        subject: `🎉 Поздравляем! Вы достигли уровня ${levelData.newLevel}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">🎉 Поздравляем!</h1>
              <h2 style="color: #333; margin: 10px 0 0 0;">Вы достигли уровня ${levelData.newLevel}!</h2>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 10px 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">${levelData.icon}</div>
                <h3 style="color: #333; margin: 0;">${levelData.title}</h3>
                <p style="color: #666; margin: 10px 0;">${levelData.description || 'Отличная работа!'}</p>
              </div>
            </div>
          </div>
        `,
        text: `Поздравляем! Вы достигли уровня ${levelData.newLevel} - ${levelData.title}!`
      })
    }

    return await this.sendEmail(userEmail, {
      subject: `🎉 Поздравляем! Вы достигли уровня ${levelData.newLevel}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">🎉 Поздравляем!</h1>
            <h2 style="color: #333; margin: 10px 0 0 0;">Вы достигли уровня ${levelData.newLevel}!</h2>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 10px 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">${levelData.icon}</div>
              <h3 style="color: #333; margin: 0;">${levelData.title}</h3>
              <p style="color: #666; margin: 10px 0;">${levelData.description || 'Отличная работа!'}</p>
            </div>
          </div>
        </div>
      `,
      text: `Поздравляем! Вы достигли уровня ${levelData.newLevel} - ${levelData.title}!`
    })
  }

  // Отправка новостной рассылки
  async sendNewsletter(emails: string[], newsletterData: any): Promise<{ success: number; failed: number }> {
    if (this.isDevelopment) {
      let success = 0
      let failed = 0

      for (const email of emails) {
        const result = await this.sendEmail(email, {
          subject: newsletterData.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">📢 ${newsletterData.subject}</h1>
              </div>
              
              <div style="padding: 20px; background: #f8f9fa;">
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 10px 0;">
                  ${newsletterData.content}
                </div>
              </div>
            </div>
          `,
          text: newsletterData.textContent || newsletterData.subject
        })
        
        if (result) {
          success++
        } else {
          failed++
        }
      }

      return { success, failed }
    }

    let success = 0
    let failed = 0

    for (const email of emails) {
      const result = await this.sendEmail(email, {
        subject: newsletterData.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">📢 ${newsletterData.subject}</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 10px 0;">
                ${newsletterData.content}
              </div>
            </div>
          </div>
        `,
        text: newsletterData.textContent || newsletterData.subject
      })
      
      if (result) {
        success++
      } else {
        failed++
      }
    }

    return { success, failed }
  }
}

export const emailService = new EmailService()
