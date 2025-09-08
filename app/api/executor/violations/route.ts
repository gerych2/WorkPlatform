import { NextRequest, NextResponse } from 'next/server'
import { ViolationSystem } from '../../../../lib/violationSystem'
import { getUserDataFromToken } from '../../../../lib/serverUtils'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const userData = getUserDataFromToken(authHeader)

    if (!userData || userData.role !== 'executor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Получаем историю нарушений
    const violations = await ViolationSystem.getExecutorViolations(userData.id)

    // Проверяем статус блокировки
    const blockStatus = await ViolationSystem.isExecutorBlocked(userData.id)

    return NextResponse.json({
      violations,
      blockStatus,
      violationsCount: violations.length
    })

  } catch (error) {
    console.error('Error fetching violations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

