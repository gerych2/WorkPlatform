import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const achievementId = parseInt(params.id)
    const body = await request.json()
    const { isActive } = body

    if (isNaN(achievementId)) {
      return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 })
    }

    const achievement = await prisma.achievement.update({
      where: { id: achievementId },
      data: { isActive }
    })
    
    return NextResponse.json({ success: true, achievement })
  } catch (error) {
    console.error('Error toggling achievement:', error)
    return NextResponse.json(
      { error: 'Failed to toggle achievement' },
      { status: 500 }
    )
  }
}
