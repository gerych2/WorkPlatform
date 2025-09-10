import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { id: 'asc' }
    })
    
    return NextResponse.json({ success: true, achievements })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, icon, xpReward, category, rarity } = body

    if (!title || !description || !icon || xpReward === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const achievement = await prisma.achievement.create({
      data: {
        title,
        description,
        icon,
        xpReward: parseInt(xpReward),
        category,
        rarity: rarity || 'common',
        isActive: true
      }
    })
    
    return NextResponse.json({ success: true, achievement })
  } catch (error) {
    console.error('Error creating achievement:', error)
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    )
  }
}


