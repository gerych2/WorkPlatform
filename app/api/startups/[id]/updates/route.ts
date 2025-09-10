import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/startups/[id]/updates - Получить обновления стартапа
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = parseInt(params.id)

    const updates = await prisma.startupUpdate.findMany({
      where: { startupId },
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
    })

    return NextResponse.json({
      success: true,
      data: updates
    })
  } catch (error) {
    console.error('Error fetching startup updates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch startup updates' },
      { status: 500 }
    )
  }
}

// POST /api/startups/[id]/updates - Создать обновление для стартапа (только для админов)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startupId = parseInt(params.id)
    const userId = 1 // ID админа

    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const update = await prisma.startupUpdate.create({
      data: {
        startupId,
        title,
        content,
        authorId: userId
      },
      include: {
        author: {
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
      data: update
    })
  } catch (error) {
    console.error('Error creating startup update:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create startup update' },
      { status: 500 }
    )
  }
}
