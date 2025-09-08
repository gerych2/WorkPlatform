import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '../../../../lib/gamification/gamificationService'
import { ReferralService } from '../../../../lib/gamification/referralService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const stats = await gamificationService.getUserStats(parseInt(userId))
    
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Error fetching gamification stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gamification stats' },
      { status: 500 }
    )
  }
}
