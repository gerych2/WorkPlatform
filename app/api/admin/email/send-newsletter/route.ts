import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/emailService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { subject, content, textContent } = await request.json()

    if (!subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Не все поля заполнены' },
        { status: 400 }
      )
    }

    // Получаем все email адреса пользователей
    const users = await prisma.user.findMany({
      select: {
        email: true
      }
    })

    // Фильтруем валидные email адреса
    const emails = users
      .map(user => user.email)
      .filter(email => email && email.trim() !== '') as string[]

    if (emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Нет пользователей для рассылки' },
        { status: 400 }
      )
    }

    // Отправляем рассылку
    const result = await emailService.sendNewsletter(emails, {
      subject,
      content,
      textContent: textContent || content.replace(/<[^>]*>/g, '')
    })

    return NextResponse.json({
      success: true,
      message: 'Рассылка отправлена',
      successCount: result.success,
      failedCount: result.failed,
      totalEmails: emails.length
    })
  } catch (error) {
    console.error('Ошибка отправки рассылки:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
