import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/startups - Получить все стартапы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }
    if (status && status !== 'all') {
      where.status = status
    }

    const [startups, total] = await Promise.all([
      prisma.startup.findMany({
        where,
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
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true
            }
          },
          _count: {
            select: {
              volunteers: true,
              tasks: true,
              updates: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.startup.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        startups,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching startups:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch startups' },
      { status: 500 }
    )
  }
}

// POST /api/startups - Создать новый стартап (только для админов)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, createdBy } = body

    if (!title || !description || !category || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Title, description, category and createdBy are required' },
        { status: 400 }
      )
    }

    const startup = await prisma.startup.create({
      data: {
        title,
        description,
        category,
        createdBy: parseInt(createdBy)
      },
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
    console.error('Error creating startup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create startup' },
      { status: 500 }
    )
  }
}
