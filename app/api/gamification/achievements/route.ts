import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '../../../../lib/gamification/gamificationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const achievements = await gamificationService.getUserAchievements(parseInt(userId))
    
    return NextResponse.json({ success: true, data: achievements })
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
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const newAchievements = await gamificationService.checkAchievements(parseInt(userId))
    
    return NextResponse.json({ success: true, data: newAchievements })
  } catch (error) {
    console.error('Error checking achievements:', error)
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}


