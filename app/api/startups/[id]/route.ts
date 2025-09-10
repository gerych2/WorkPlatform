import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/startups/[id] - Получить конкретный стартап
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = parseInt(params.id)

    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        volunteers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        updates: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            volunteers: true,
            tasks: true,
            updates: true
          }
        }
      }
    })

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: startup
    })
  } catch (error) {
    console.error('Error fetching startup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch startup' },
      { status: 500 }
    )
  }
}

// PUT /api/startups/[id] - Обновить стартап (только для админов)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = parseInt(params.id)
    const body = await request.json()
    const { title, description, category, status } = body

    const updateData: any = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (category) updateData.category = category
    if (status) updateData.status = status

    const startup = await prisma.startup.update({
      where: { id: startupId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            volunteers: true,
            tasks: true,
            updates: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: startup
    })
  } catch (error) {
    console.error('Error updating startup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update startup' },
      { status: 500 }
    )
  }
}

// DELETE /api/startups/[id] - Удалить стартап (только для админов)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = parseInt(params.id)

    await prisma.startup.delete({
      where: { id: startupId }
    })

    return NextResponse.json({
      success: true,
      message: 'Startup deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting startup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete startup' },
      { status: 500 }
    )
  }
}
