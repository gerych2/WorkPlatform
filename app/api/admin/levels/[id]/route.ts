import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const levelId = parseInt(params.id)
    const body = await request.json()
    const { level, title, description, icon, xpRequired, color } = body

    if (isNaN(levelId)) {
      return NextResponse.json({ error: 'Invalid level ID' }, { status: 400 })
    }

    const levelData = await prisma.level.update({
      where: { id: levelId },
      data: {
        level: parseInt(level),
        title,
        description,
        icon,
        xpRequired: parseInt(xpRequired),
        color: color || '#6B7280'
      }
    })
    
    return NextResponse.json({ success: true, level: levelData })
  } catch (error) {
    console.error('Error updating level:', error)
    return NextResponse.json(
      { error: 'Failed to update level' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const levelId = parseInt(params.id)

    if (isNaN(levelId)) {
      return NextResponse.json({ error: 'Invalid level ID' }, { status: 400 })
    }

    await prisma.level.delete({
      where: { id: levelId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting level:', error)
    return NextResponse.json(
      { error: 'Failed to delete level' },
      { status: 500 }
    )
  }
}
