import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Проверяем расписание исполнителя...')

  try {
    // Находим исполнителя
    const executor = await prisma.user.findFirst({
      where: { 
        email: 'executor@example.com',
        role: 'executor'
      }
    })

    if (!executor) {
      console.log('❌ Исполнитель не найден')
      return
    }

    console.log(`👤 Найден исполнитель: ${executor.name} (ID: ${executor.id})`)

    // Проверяем рабочие часы
    const workingHours = await prisma.workingHours.findMany({
      where: { executorId: executor.id },
      orderBy: { dayOfWeek: 'asc' }
    })

    console.log(`📅 Рабочие часы (${workingHours.length} записей):`)
    workingHours.forEach(hour => {
      const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
      console.log(`  ${dayNames[hour.dayOfWeek]}: ${hour.isWorking ? `${hour.startTime} - ${hour.endTime}` : 'Не работает'}`)
    })

    // Проверяем события
    const events = await prisma.calendarEvent.findMany({
      where: { executorId: executor.id },
      take: 5
    })

    console.log(`📋 События (${events.length} записей):`)
    events.forEach(event => {
      console.log(`  ${event.title} - ${event.date} ${event.time}`)
    })

    // Тестируем API для конкретной даты
    const testDate = '2024-09-09' // Понедельник
    console.log(`\n🧪 Тестируем API для даты ${testDate}:`)
    
    const targetDate = new Date(testDate)
    let dayOfWeek = targetDate.getDay()
    
    // Исправляем логику: понедельник = 0, воскресенье = 6
    if (dayOfWeek === 0) {
      dayOfWeek = 6 // Воскресенье становится последним днем недели
    } else {
      dayOfWeek = dayOfWeek - 1 // Сдвигаем на 1 день назад
    }

    console.log(`  День недели (исправленный): ${dayOfWeek}`)

    const workingHoursForDay = await prisma.workingHours.findFirst({
      where: {
        executorId: executor.id,
        dayOfWeek: dayOfWeek,
        isWorking: true
      }
    })

    if (workingHoursForDay) {
      console.log(`  ✅ Рабочие часы найдены: ${workingHoursForDay.startTime} - ${workingHoursForDay.endTime}`)
    } else {
      console.log(`  ❌ Рабочие часы не найдены для дня недели ${dayOfWeek}`)
    }

  } catch (error) {
    console.log('❌ Ошибка:', error)
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


