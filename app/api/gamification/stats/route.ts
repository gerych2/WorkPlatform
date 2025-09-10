import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '../../../../lib/gamification/gamificationService'
import { ReferralService } from '../../../../lib/gamification/referralService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('🎮 API Gamification Stats - Запрос для пользователя:', userId)

    if (!userId) {
      console.log('🎮 API Gamification Stats - Ошибка: User ID не предоставлен')
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🎮 API Gamification Stats - Получение статистики для пользователя:', userId)
    const stats = await gamificationService.getUserStats(parseInt(userId))
    
    console.log('🎮 API Gamification Stats - Статистика получена:', stats)
    
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('🎮 API Gamification Stats - Ошибка:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gamification stats' },
      { status: 500 }
    )
  }
}
