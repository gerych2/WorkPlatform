import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/email/emailService'

const prisma = new PrismaClient()

// POST - Отправить сообщение в тикет
export async function POST(request: NextRequest) {
  try {
    const { ticketId, userId, message } = await request.json()

    if (!ticketId || !userId || !message) {
      return NextResponse.json(
        { success: false, error: 'Не все поля заполнены' },
        { status: 400 }
      )
    }

    // Проверяем, что тикет существует и принадлежит пользователю
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId
      },
      include: {
        user: {
          select: {
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

    // Создаем сообщение
    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        userId,
        message,
        isFromAdmin: false
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

    // Отправляем уведомление админам о новом сообщении
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { email: true }
      })

      const adminEmails = admins.map(admin => admin.email).filter(Boolean) as string[]
      
      if (adminEmails.length > 0) {
        await emailService.sendEmail(adminEmails[0], {
          subject: `💬 Новое сообщение в обращении: ${ticket.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">💬 Новое сообщение в обращении</h1>
              </div>
              
              <div style="padding: 20px; background: #f8f9fa;">
                <h2 style="color: #333;">Детали сообщения:</h2>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                  <p><strong>Обращение:</strong> ${ticket.subject}</p>
                  <p><strong>От:</strong> ${ticket.user.name}</p>
                  <p><strong>Сообщение:</strong></p>
                  <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px;">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="http://localhost:3000/admin/support" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Перейти в админ-панель
                  </a>
                </div>
              </div>
            </div>
          `,
          text: `Новое сообщение в обращении "${ticket.subject}" от ${ticket.user.name}: ${message}`
        })
      }
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


