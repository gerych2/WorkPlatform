import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description } = await request.json()
    const categoryId = parseInt(params.id)

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Название категории обязательно' },
        { status: 400 }
      )
    }

    // Проверяем, что категория существует
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    // Проверяем, что категория с таким названием не существует (кроме текущей)
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        name: name.trim(),
        id: { not: categoryId }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Категория с таким названием уже существует' },
        { status: 400 }
      )
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: 'Категория успешно обновлена'
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Ошибка обновления категории' },
      { status: 500 }
    )
  }
}

// Удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = parseInt(params.id)

    // Проверяем, что категория существует
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    // Проверяем, есть ли заказы с этой категорией
    const ordersWithCategory = await prisma.order.count({
      where: { categoryId: categoryId }
    })

    if (ordersWithCategory > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить категорию, которая используется в заказах' },
        { status: 400 }
      )
    }

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
      { error: 'Ошибка удаления категории' },
      { status: 500 }
    )
  }
}


