import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const achievementId = parseInt(params.id)
    const body = await request.json()
    const { title, description, icon, xpReward, category, rarity } = body

    if (isNaN(achievementId)) {
      return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 })
    }

    const achievement = await prisma.achievement.update({
      where: { id: achievementId },
      data: {
        title,
        description,
        icon,
        xpReward: parseInt(xpReward),
        category,
        rarity: rarity || 'common'
      }
    })
    
    return NextResponse.json({ success: true, achievement })
  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const achievementId = parseInt(params.id)

    if (isNaN(achievementId)) {
      return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 })
    }

    await prisma.achievement.delete({
      where: { id: achievementId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return NextResponse.json(
      { error: 'Failed to delete achievement' },
      { status: 500 }
    )
  }
}


