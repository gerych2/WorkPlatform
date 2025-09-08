import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '../../../lib/gamification/notificationService'

const notificationService = new NotificationService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const notifications = await notificationService.getUserNotifications(parseInt(userId))
    const unreadCount = await notificationService.getUnreadCount(parseInt(userId))
    
    return NextResponse.json({ 
      success: true, 
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}