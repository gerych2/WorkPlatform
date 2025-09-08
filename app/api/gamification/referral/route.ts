import { NextRequest, NextResponse } from 'next/server'
import { ReferralService } from '../../../../lib/gamification/referralService'

const referralService = new ReferralService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const stats = await referralService.getReferralStats(parseInt(userId))
    
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, referralCode } = body

    if (!userId || !referralCode) {
      return NextResponse.json({ error: 'User ID and referral code are required' }, { status: 400 })
    }

    const result = await referralService.useReferralCode(parseInt(userId), referralCode)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error using referral code:', error)
    return NextResponse.json(
      { error: 'Failed to use referral code' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const referralCode = await referralService.createReferralCode(parseInt(userId))
    
    return NextResponse.json({ success: true, referralCode })
  } catch (error) {
    console.error('Error creating referral code:', error)
    return NextResponse.json(
      { error: 'Failed to create referral code' },
      { status: 500 }
    )
  }
}