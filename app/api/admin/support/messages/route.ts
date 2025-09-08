import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/email/emailService'
import { NotificationService } from '@/lib/gamification/notificationService'

const notificationService = new NotificationService()

const prisma = new PrismaClient()

// POST - Отправить сообщение от админа
export async function POST(request: NextRequest) {
  try {
    const { ticketId, message, isFromAdmin = true } = await request.json()

    if (!ticketId || !message) {
      return NextResponse.json(
        { success: false, error: 'Не все поля заполнены' },
        { status: 400 }
      )
    }

    // Получаем тикет с информацией о пользователе
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Тикет не найден' },
        { status: 404 }
      )
    }

    // Создаем сообщение от админа
    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        userId: ticket.userId, // ID пользователя, которому принадлежит тикет
        message,
        isFromAdmin: true
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    // Обновляем время последнего обновления тикета
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    })

    // Создаем уведомление для пользователя о новом ответе
    await notificationService.createNotification({
      userId: ticket.userId,
      type: 'support_ticket_reply',
      title: 'Ответ на ваше обращение',
      message: `Получен ответ от службы поддержки на обращение "${ticket.subject}"`,
      metadata: {
        ticketId: ticket.id,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      }
    })

    // Отправляем уведомление пользователю
    try {
      await emailService.sendEmail(ticket.user.email, {
        subject: `💬 Ответ на ваше обращение: ${ticket.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">💬 Ответ на ваше обращение</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <h2 style="color: #333;">Здравствуйте, ${ticket.user.name}!</h2>
              <p>Мы получили ответ на ваше обращение в службу поддержки.</p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p><strong>Обращение:</strong> ${ticket.subject}</p>
                <p><strong>Ответ от поддержки:</strong></p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="http://localhost:3000/dashboard/client/settings" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Перейти к обращению
                </a>
              </div>
            </div>
          </div>
        `,
        text: `Ответ на ваше обращение "${ticket.subject}": ${message}`
      })
    } catch (emailError) {
      console.error('Ошибка отправки email уведомления:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: newMessage
    })
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
