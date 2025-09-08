import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const quests = await prisma.quest.findMany({
      orderBy: { id: 'asc' }
    })
    
    return NextResponse.json({ success: true, quests })
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, icon, xpReward, category, difficulty, isRepeatable, maxCompletions, requirements, deadline } = body

    if (!title || !description || !icon || xpReward === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const quest = await prisma.quest.create({
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
        deadline: deadline ? new Date(deadline) : null,
        isActive: true
      }
    })
    
    return NextResponse.json({ success: true, quest })
  } catch (error) {
    console.error('Error creating quest:', error)
    return NextResponse.json(
      { error: 'Failed to create quest' },
      { status: 500 }
    )
  }
}
