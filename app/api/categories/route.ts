import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { orderCount: 'desc' }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, icon } = body

    // Валидация обязательных полей
    if (!name) {
      return NextResponse.json(
        { error: 'Название категории обязательно' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли категория с таким названием
    const existingCategory = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Категория с таким названием уже существует' },
        { status: 400 }
      )
    }

    // Создаем новую категорию
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        isActive: true,
        executorCount: 0,
        orderCount: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Категория успешно создана',
      category: newCategory
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании категории' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description, icon, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID категории обязателен' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли категория
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    // Обновляем категорию
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Категория успешно обновлена',
      category: updatedCategory
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении категории' },
      { status: 500 }
    )
  }
}

