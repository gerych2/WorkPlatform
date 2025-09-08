import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '../../../../lib/gamification/gamificationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, source, description, metadata } = body

    if (!userId || !amount || !source) {
      return NextResponse.json(
        { error: 'userId, amount, and source are required' },
        { status: 400 }
      )
    }

    const result = await gamificationService.addXp(userId, {
      amount,
      source,
      description: description || `Получено ${amount} XP`,
      metadata
    })
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error adding XP:', error)
    return NextResponse.json(
      { error: 'Failed to add XP' },
      { status: 500 }
    )
  }
}
