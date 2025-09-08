// Email сервис через Formspree
// Регистрация: https://formspree.io

import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

interface FormspreeData {
  email: string
  subject: string
  message: string
  html?: string
}

class FormspreeService {
  private endpoint: string

  constructor() {
    this.endpoint = process.env.FORMSPREE_ENDPOINT || ''
    console.log('🔧 FormspreeService инициализирован с endpoint:', this.endpoint)
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      if (!this.endpoint) {
        console.error('❌ FORMSPREE_ENDPOINT не настроен')
        return false
      }

      // Formspree отправляет на ваш email, но мы указываем получателя в тексте
      const formData: FormspreeData = {
        email: 'admin@prodo-agency.com', // Ваш email для получения уведомлений
        subject: `[Уведомление для: ${to}] ${template.subject}`,
        message: `Получатель: ${to}\n\n${template.text || template.subject}`,
        html: `
          <div style="border: 2px solid #e74c3c; padding: 10px; margin-bottom: 20px; background: #fdf2f2;">
            <h3 style="color: #e74c3c; margin: 0;">📧 Уведомление для: ${to}</h3>
            <p style="margin: 5px 0 0 0; color: #666;">Это письмо должно быть отправлено на указанный адрес</p>
          </div>
          ${template.html}
        `
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        console.log('📧 Уведомление отправлено через Formspree (получатель:', to, ')')
        return true
      } else {
        console.error('❌ Ошибка отправки через Formspree:', await response.text())
        return false
      }
    } catch (error) {
      console.error('❌ Ошибка Formspree:', error)
      return false
    }
  }

  async sendNewsletter(emails: string[], newsletterData: any): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const email of emails) {
      const result = await this.sendEmail(email, {
        subject: newsletterData.subject,
        html: newsletterData.content,
        text: newsletterData.textContent
      })
      
      if (result) {
        success++
      } else {
        failed++
      }
    }

    return { success, failed }
  }

  // Специальные методы для разных типов уведомлений
  async sendNewOrderNotification(executorEmail: string, orderData: any): Promise<boolean> {
    return await this.sendEmail(executorEmail, {
      subject: '🎯 Новый заказ для вас!',
      html: `
        <h2>Новый заказ!</h2>
        <p><strong>Услуга:</strong> ${orderData.serviceDescription || 'Не указано'}</p>
        <p><strong>Клиент:</strong> ${orderData.clientName || 'Не указано'}</p>
        <p><strong>Адрес:</strong> ${orderData.address || 'Не указано'}</p>
        <p><strong>Телефон:</strong> ${orderData.phone || 'Не указано'}</p>
        <p><strong>Дата:</strong> ${orderData.orderDate || 'Не указано'}</p>
        <p><strong>Время:</strong> ${orderData.orderTime || 'Не указано'}</p>
        <p><strong>Цена:</strong> ${orderData.totalPrice || 0} ₽</p>
      `,
      text: `Новый заказ! Услуга: ${orderData.serviceDescription}, Клиент: ${orderData.clientName}, Цена: ${orderData.totalPrice} ₽`
    })
  }

  async sendOrderCompletedNotification(clientEmail: string, orderData: any): Promise<boolean> {
    return await this.sendEmail(clientEmail, {
      subject: '✅ Ваш заказ выполнен!',
      html: `
        <h2>Заказ выполнен!</h2>
        <p><strong>Услуга:</strong> ${orderData.serviceDescription || 'Не указано'}</p>
        <p><strong>Исполнитель:</strong> ${orderData.executorName || 'Не указано'}</p>
        <p><strong>Дата выполнения:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
        <p><strong>Сумма:</strong> ${orderData.totalPrice || 0} ₽</p>
      `,
      text: `Заказ выполнен! Услуга: ${orderData.serviceDescription}, Исполнитель: ${orderData.executorName}, Сумма: ${orderData.totalPrice} ₽`
    })
  }

  async sendLevelUpNotification(userEmail: string, levelData: any): Promise<boolean> {
    return await this.sendEmail(userEmail, {
      subject: `🎉 Поздравляем! Вы достигли уровня ${levelData.newLevel}!`,
      html: `
        <h2>🎉 Поздравляем!</h2>
        <h3>Вы достигли уровня ${levelData.newLevel} - ${levelData.title}!</h3>
        <p>${levelData.description || 'Отличная работа!'}</p>
        <p><strong>Новые возможности:</strong></p>
        <ul>
          <li>Приоритет в поиске исполнителей</li>
          <li>Скидки на подписки</li>
          <li>Эксклюзивные предложения</li>
        </ul>
      `,
      text: `Поздравляем! Вы достигли уровня ${levelData.newLevel} - ${levelData.title}!`
    })
  }
}

export const formspreeService = new FormspreeService()
