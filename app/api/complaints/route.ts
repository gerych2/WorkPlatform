import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const complainantId = searchParams.get('complainantId')
    const accusedId = searchParams.get('accusedId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (complainantId) {
      where.complainantId = parseInt(complainantId)
    }
    
    if (accusedId) {
      where.accusedId = parseInt(accusedId)
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        complainant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        accused: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            serviceDescription: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        resolvedByUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await prisma.complaint.count({ where })

    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { complainantId, accusedId, orderId, reason, description } = body

    // Валидация обязательных полей
    if (!complainantId || !accusedId || !reason) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли жалобщик
    const complainant = await prisma.user.findUnique({
      where: { id: parseInt(complainantId) }
    })

    if (!complainant) {
      return NextResponse.json(
        { error: 'Жалобщик не найден' },
        { status: 404 }
      )
    }

    // Проверяем, существует ли обвиняемый
    const accused = await prisma.user.findUnique({
      where: { id: parseInt(accusedId) }
    })

    if (!accused) {
      return NextResponse.json(
        { error: 'Обвиняемый не найден' },
        { status: 404 }
      )
    }

    // Проверяем, существует ли заказ (если указан)
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) }
      })

      if (!order) {
        return NextResponse.json(
          { error: 'Заказ не найден' },
          { status: 404 }
        )
      }
    }

    // Создаем жалобу
    const complaint = await prisma.complaint.create({
      data: {
        complainantId: parseInt(complainantId),
        accusedId: parseInt(accusedId),
        orderId: orderId ? parseInt(orderId) : null,
        reason,
        description,
        status: 'open'
      },
      include: {
        complainant: {
          select: {
            id: true,
            name: true
          }
        },
        accused: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Жалоба успешно создана',
      complaint
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании жалобы' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status, adminNotes, resolvedBy } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID жалобы обязателен' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли жалоба
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingComplaint) {
      return NextResponse.json(
        { error: 'Жалоба не найдена' },
        { status: 404 }
      )
    }

    // Обновляем жалобу
    const updatedComplaint = await prisma.complaint.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && { status }),
        ...(adminNotes && { adminNotes }),
        ...(resolvedBy && { resolvedBy: parseInt(resolvedBy) }),
        ...(status === 'resolved' && { resolvedAt: new Date() })
      },
      include: {
        complainant: {
          select: {
            id: true,
            name: true
          }
        },
        accused: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Жалоба успешно обновлена',
      complaint: updatedComplaint
    })

  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении жалобы' },
      { status: 500 }
    )
  }
}
