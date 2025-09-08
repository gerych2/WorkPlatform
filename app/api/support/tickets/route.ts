import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/email/emailService'
import { NotificationService } from '@/lib/gamification/notificationService'

const notificationService = new NotificationService()

const prisma = new PrismaClient()

// GET - Получить тикеты пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get('userId') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID пользователя не указан' },
        { status: 400 }
      )
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      include: {
        messages: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      tickets
    })
  } catch (error) {
    console.error('Ошибка получения тикетов:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST - Создать новый тикет
export async function POST(request: NextRequest) {
  try {
    const { userId, subject, description, category, priority } = await request.json()

    if (!userId || !subject || !description) {
      return NextResponse.json(
        { success: false, error: 'Не все поля заполнены' },
        { status: 400 }
      )
    }

    // Создаем тикет
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        description,
        category: category || 'general',
        priority: priority || 'medium',
        status: 'open'
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

    // Создаем уведомление для пользователя
    await notificationService.createNotification({
      userId,
      type: 'support_ticket_created',
      title: 'Обращение в службу поддержки создано',
      message: `Ваше обращение "${subject}" успешно создано. Мы ответим в ближайшее время.`,
      metadata: {
        ticketId: ticket.id,
        category: category || 'general',
        priority: priority || 'medium'
      }
    })

    // Отправляем уведомление админам
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { id: true, email: true }
      })

      const adminEmails = admins.map(admin => admin.email).filter(Boolean) as string[]
      
      // Создаем уведомления для всех админов
      for (const admin of admins) {
        await notificationService.createNotification({
          userId: admin.id,
          type: 'support_ticket_admin',
          title: 'Новое обращение в службу поддержки',
          message: `Пользователь ${ticket.user.name} создал обращение: "${subject}"`,
          metadata: {
            ticketId: ticket.id,
            userEmail: ticket.user.email,
            category: category || 'general',
            priority: priority || 'medium'
          }
        })
      }
      
      if (adminEmails.length > 0) {
        await emailService.sendEmail(adminEmails[0], {
          subject: `🎫 Новое обращение в службу поддержки: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🎫 Новое обращение в службу поддержки</h1>
              </div>
              
              <div style="padding: 20px; background: #f8f9fa;">
                <h2 style="color: #333;">Детали обращения:</h2>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                  <p><strong>Тема:</strong> ${subject}</p>
                  <p><strong>Пользователь:</strong> ${ticket.user.name}</p>
                  <p><strong>Email:</strong> ${ticket.user.email}</p>
                  <p><strong>Категория:</strong> ${category}</p>
                  <p><strong>Приоритет:</strong> ${priority}</p>
                  <p><strong>Описание:</strong></p>
                  <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px;">
                    ${description.replace(/\n/g, '<br>')}
                  </div>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="http://localhost:3000/admin/support" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Перейти в админ-панель
                  </a>
                </div>
              </div>
            </div>
          `,
          text: `Новое обращение в службу поддержки от ${ticket.user.name}: ${subject}`
        })
      }
    } catch (emailError) {
      console.error('Ошибка отправки email уведомления:', emailError)
    }

    return NextResponse.json({
      success: true,
      ticket
    })
  } catch (error) {
    console.error('Ошибка создания тикета:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
