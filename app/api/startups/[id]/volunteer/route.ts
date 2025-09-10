import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/startups/[id]/volunteer - Записаться на стартап как доброволец (отключено)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { success: false, error: 'Функция отключена. Используйте форму заявки.' },
    { status: 400 }
  )
}

// DELETE /api/startups/[id]/volunteer - Покинуть стартап (отключено)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { success: false, error: 'Функция отключена. Используйте форму заявки.' },
    { status: 400 }
  )
}
