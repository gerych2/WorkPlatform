import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { level: 'asc' }
    })
    
    return NextResponse.json({ success: true, levels })
  } catch (error) {
    console.error('Error fetching levels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { level, title, description, icon, xpRequired, color } = body

    if (!level || !title || !description || !icon || xpRequired === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const levelData = await prisma.level.create({
      data: {
        level: parseInt(level),
        title,
        description,
        icon,
        xpRequired: parseInt(xpRequired),
        color: color || '#6B7280',
        isActive: true
      }
    })
    
    return NextResponse.json({ success: true, level: levelData })
  } catch (error) {
    console.error('Error creating level:', error)
    return NextResponse.json(
      { error: 'Failed to create level' },
      { status: 500 }
    )
  }
}


