import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/emailService'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, content } = await request.json()

    if (!to || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Не все поля заполнены' },
        { status: 400 }
      )
    }

    // Отправляем письмо
    const result = await emailService.sendEmail(to, {
      subject,
      html: content,
      text: content.replace(/<[^>]*>/g, '') // Убираем HTML теги для текстовой версии
    })

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Письмо успешно отправлено'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Ошибка отправки письма' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Ошибка отправки одиночного письма:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}


