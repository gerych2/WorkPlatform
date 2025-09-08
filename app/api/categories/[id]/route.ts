import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id)

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        orders: {
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            },
            executor: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id)

    // Проверяем, существует ли категория
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    // Проверяем, есть ли активные заказы в этой категории
    const activeOrders = await prisma.order.count({
      where: {
        categoryId,
        status: {
          in: ['pending', 'confirmed', 'in_progress']
        }
      }
    })

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить категорию с активными заказами' },
        { status: 400 }
      )
    }

    // Удаляем категорию
    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      success: true,
      message: 'Категория успешно удалена'
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении категории' },
      { status: 500 }
    )
  }
}
