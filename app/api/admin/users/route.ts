import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscriptions: {
          select: {
            plan: true,
            status: true,
            endDate: true
          }
        },
        _count: {
          select: {
            clientOrders: true,
            executorOrders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role, status, location, bio, isVerified } = body

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: 'temp_password_hash', // Временное решение
        role: role as any,
        status: (status || 'active') as any,
        location: location || null,
        bio: bio || null,
        isVerified: isVerified || false
      }
    })
    
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
