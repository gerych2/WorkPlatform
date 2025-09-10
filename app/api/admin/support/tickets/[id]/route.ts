import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - Обновить статус тикета
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id)
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Статус не указан' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date()
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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
      }
    })

    return NextResponse.json({
      success: true,
      ticket
    })
  } catch (error) {
    console.error('Ошибка обновления тикета:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}


