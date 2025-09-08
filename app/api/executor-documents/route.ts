import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const documentType = searchParams.get('documentType')
    const verificationStatus = searchParams.get('verificationStatus')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {}
    
    if (userId) {
      where.userId = parseInt(userId)
    }
    
    if (documentType) {
      where.documentType = documentType
    }
    
    if (verificationStatus) {
      where.verificationStatus = verificationStatus
    }

    const documents = await prisma.executorDocument.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        verifiedByUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await prisma.executorDocument.count({ where })

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching executor documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch executor documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      documentType,
      filePath,
      fileName,
      notes
    } = body

    // Валидация обязательных полей
    if (!userId || !documentType) {
      return NextResponse.json(
        { error: 'userId и documentType обязательны' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь и является ли он исполнителем
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    if (user.role !== 'executor') {
      return NextResponse.json(
        { error: 'Пользователь не является исполнителем' },
        { status: 400 }
      )
    }

    // Создаем документ
    const document = await prisma.executorDocument.create({
      data: {
        userId: parseInt(userId),
        documentType,
        filePath,
        fileName,
        notes,
        verificationStatus: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Документ успешно загружен',
      document
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating executor document:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании документа' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, verificationStatus, verifiedBy, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID документа обязателен' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли документ
    const existingDocument = await prisma.executorDocument.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Документ не найден' },
        { status: 404 }
      )
    }

    // Обновляем документ
    const updatedDocument = await prisma.executorDocument.update({
      where: { id: parseInt(id) },
      data: {
        ...(verificationStatus && { verificationStatus }),
        ...(verifiedBy && { verifiedBy: parseInt(verifiedBy) }),
        ...(notes && { notes }),
        ...(verificationStatus === 'verified' && { verifiedAt: new Date() })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        verifiedByUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Если документ верифицирован, обновляем статус пользователя
    if (verificationStatus === 'verified') {
      await prisma.user.update({
        where: { id: existingDocument.userId },
        data: { isVerified: true }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Документ успешно обновлен',
      document: updatedDocument
    })

  } catch (error) {
    console.error('Error updating executor document:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении документа' },
      { status: 500 }
    )
  }
}
