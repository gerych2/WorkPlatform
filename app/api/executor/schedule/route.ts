import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение расписания исполнителя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const executorId = searchParams.get('executorId')
    const date = searchParams.get('date') // YYYY-MM-DD

    if (!executorId) {
      return NextResponse.json({ error: 'Executor ID is required' }, { status: 400 })
    }

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const targetDate = new Date(date)
    
    // Проверяем, что дата не в прошлом
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Сбрасываем время для сравнения только дат
    targetDate.setHours(0, 0, 0, 0)
    
    if (targetDate < today) {
      return NextResponse.json({ 
        error: 'Нельзя записаться на прошедшую дату',
        availableSlots: []
      }, { status: 400 })
    }
    
    let dayOfWeek = targetDate.getDay()
    
    // Исправляем логику: понедельник = 0, воскресенье = 6
    if (dayOfWeek === 0) {
      dayOfWeek = 6 // Воскресенье становится последним днем недели
    } else {
      dayOfWeek = dayOfWeek - 1 // Сдвигаем на 1 день назад
    }

    // Получаем рабочие часы исполнителя на этот день недели
    const workingHours = await prisma.workingHours.findFirst({
      where: {
        executorId: parseInt(executorId),
        dayOfWeek: dayOfWeek,
        isWorking: true
      }
    })

    // Получаем события исполнителя на эту дату
    const events = await prisma.calendarEvent.findMany({
      where: {
        executorId: parseInt(executorId),
        date: targetDate
      },
      orderBy: {
        time: 'asc'
      }
    })

    // Получаем заказы исполнителя на эту дату
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const orders = await prisma.order.findMany({
      where: {
        executorId: parseInt(executorId),
        orderDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['confirmed', 'in_progress']
        }
      },
      include: {
        client: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        orderTime: 'asc'
      }
    })

    // Формируем занятые временные слоты
    const busySlots: any[] = []

    // Добавляем события
    events.forEach(event => {
      busySlots.push({
        start: event.time,
        end: addMinutes(event.time, event.duration),
        type: 'event',
        title: event.title,
        description: event.description
      })
    })

    // Добавляем заказы
    orders.forEach(order => {
      const duration = order.estimatedDuration || 2 // По умолчанию 2 часа
      // orderTime теперь строка в формате "HH:MM"
      const orderTime = typeof order.orderTime === 'string' ? order.orderTime : (order.orderTime as any).toTimeString().slice(0, 5)
      busySlots.push({
        start: orderTime,
        end: addMinutes(orderTime, (duration as any) * 60),
        type: 'order',
        title: `Заказ: ${order.serviceDescription}`,
        client: order.client
      })
    })

    return NextResponse.json({
      workingHours,
      busySlots,
      availableSlots: generateAvailableSlots(workingHours, busySlots)
    })

  } catch (error) {
    console.error('Error fetching executor schedule:', error)
    console.error('Error details:', (error as any).message)
    console.error('Stack trace:', (error as any).stack)
    return NextResponse.json(
      { error: 'Failed to fetch executor schedule', details: (error as any).message },
      { status: 500 }
    )
  }
}

// Вспомогательная функция для добавления минут к времени
function addMinutes(timeString: string, minutes: number): string {
  const [hours, mins] = timeString.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}

// Генерация доступных временных слотов
function generateAvailableSlots(workingHours: any, busySlots: any[]): string[] {
  if (!workingHours) {
    return []
  }

  const slots = []
  const startTime = workingHours.startTime
  const endTime = workingHours.endTime
  const slotDuration = 60 // 1 час

  // Конвертируем время в минуты
  const timeToMinutes = (time: string) => {
    const [hours, mins] = time.split(':').map(Number)
    return hours * 60 + mins
  }

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  // Создаем слоты по 1 часу
  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
    const slotStart = minutesToTime(minutes)
    const slotEnd = minutesToTime(minutes + slotDuration)

    // Проверяем, не пересекается ли слот с занятым временем
    const isBusy = busySlots.some(busySlot => {
      const busyStart = timeToMinutes(busySlot.start)
      const busyEnd = timeToMinutes(busySlot.end)
      
      return (minutes < busyEnd && minutes + slotDuration > busyStart)
    })

    if (!isBusy) {
      slots.push(slotStart)
    }
  }

  return slots
}
