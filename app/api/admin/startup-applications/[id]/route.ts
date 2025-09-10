import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { EmailService } from '@/lib/email/emailService'

const prisma = new PrismaClient()
const emailService = new EmailService()

// PUT /api/admin/startup-applications/[id] - Обновить статус заявки
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = parseInt(params.id)
    const body = await request.json()
    const { status, notes } = body

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Некорректный статус' },
        { status: 400 }
      )
    }

    const application = await prisma.startupApplication.update({
      where: { id: applicationId },
      data: {
        status,
        notes: notes || null
      },
      include: {
        startup: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    })

    // Отправляем уведомление пользователю
    try {
      const statusMessages = {
        approved: {
          subject: '🎉 Ваша заявка на стартап одобрена!',
          message: `Поздравляем! Ваша заявка на стартап "${application.startup.title}" была одобрена. Администратор свяжется с вами в ближайшее время для дальнейших инструкций.`
        },
        rejected: {
          subject: '❌ Заявка на стартап отклонена',
          message: `К сожалению, ваша заявка на стартап "${application.startup.title}" была отклонена. Спасибо за интерес к нашим проектам!`
        }
      }

      if (statusMessages[status as keyof typeof statusMessages]) {
        const { subject, message } = statusMessages[status as keyof typeof statusMessages]
        
        await emailService.sendEmail(application.email, {
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${subject}</h2>
              <p style="color: #666; line-height: 1.6;">${message}</p>
              ${notes ? `<p style="color: #666; line-height: 1.6;"><strong>Комментарий администратора:</strong><br>${notes}</p>` : ''}
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                С уважением,<br>
                Команда платформы
              </p>
            </div>
          `
        })
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError)
      // Не прерываем выполнение, если не удалось отправить email
    }

    return NextResponse.json({
      success: true,
      data: application
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/startup-applications/[id] - Удалить заявку
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = parseInt(params.id)

    await prisma.startupApplication.delete({
      where: { id: applicationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Заявка удалена'
    })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
