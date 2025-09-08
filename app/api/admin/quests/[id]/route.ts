import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questId = parseInt(params.id)
    const body = await request.json()
    const { title, description, icon, xpReward, category, difficulty, isRepeatable, maxCompletions, requirements, deadline } = body

    if (isNaN(questId)) {
      return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 })
    }

    const quest = await prisma.quest.update({
      where: { id: questId },
      data: {
        title,
        description,
        icon,
        xpReward: parseInt(xpReward),
        category: category || 'daily',
        difficulty: difficulty || 'easy',
        isRepeatable: isRepeatable || false,
        maxCompletions: maxCompletions || 1,
        requirements: requirements || '',
        deadline: deadline ? new Date(deadline) : null
      }
    })
    
    return NextResponse.json({ success: true, quest })
  } catch (error) {
    console.error('Error updating quest:', error)
    return NextResponse.json(
      { error: 'Failed to update quest' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questId = parseInt(params.id)

    if (isNaN(questId)) {
      return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 })
    }

    await prisma.quest.delete({
      where: { id: questId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quest:', error)
    return NextResponse.json(
      { error: 'Failed to delete quest' },
      { status: 500 }
    )
  }
}
