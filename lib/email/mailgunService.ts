// Альтернативный email сервис через Mailgun
// Регистрация: https://www.mailgun.com/

interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

class MailgunService {
  private apiKey: string
  private domain: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY || ''
    this.domain = process.env.MAILGUN_DOMAIN || ''
    this.baseUrl = `https://api.mailgun.net/v3/${this.domain}`
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const formData = new URLSearchParams()
      formData.append('from', `Prodo Agency <noreply@${this.domain}>`)
      formData.append('to', to)
      formData.append('subject', template.subject)
      formData.append('html', template.html)
      if (template.text) {
        formData.append('text', template.text)
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      })

      if (response.ok) {
        console.log('📧 Email отправлен через Mailgun:', to)
        return true
      } else {
        console.error('❌ Ошибка отправки через Mailgun:', await response.text())
        return false
      }
    } catch (error) {
      console.error('❌ Ошибка Mailgun:', error)
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
}

export const mailgunService = new MailgunService()


