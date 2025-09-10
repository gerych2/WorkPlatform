import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/startups/[id]/tasks - Получить задачи стартапа
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = parseInt(params.id)

    const tasks = await prisma.startupTask.findMany({
      where: { startupId },
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
    })

    return NextResponse.json({
      success: true,
      data: tasks
    })
  } catch (error) {
    console.error('Error fetching startup tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch startup tasks' },
      { status: 500 }
    )
  }
}

// POST /api/startups/[id]/tasks - Создать задачу для стартапа (только для админов)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = parseInt(params.id)

    const body = await request.json()
    const { title, description, priority, assignedTo, dueDate } = body

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const task = await prisma.startupTask.create({
      data: {
        startupId,
        title,
        description,
        priority: priority || 'medium',
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('Error creating startup task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create startup task' },
      { status: 500 }
    )
  }
}
