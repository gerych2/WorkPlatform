import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('⏰ Создаем рабочие часы для исполнителя...')

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

    // Проверяем, есть ли уже рабочие часы
    const existingHours = await prisma.workingHours.findMany({
      where: { executorId: executor.id }
    })

    if (existingHours.length > 0) {
      console.log('ℹ️ У исполнителя уже есть рабочие часы')
      return
    }

    // Создаем рабочие часы (используем новую логику: понедельник = 0)
    const workingHoursData = [
      { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isWorking: true }, // Понедельник
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isWorking: true }, // Вторник
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isWorking: true }, // Среда
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isWorking: true }, // Четверг
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isWorking: true }, // Пятница
      { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isWorking: true }, // Суббота
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isWorking: false } // Воскресенье
    ]

    await prisma.workingHours.createMany({
      data: workingHoursData.map(hour => ({
        executorId: executor.id,
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime,
        endTime: hour.endTime,
        isWorking: hour.isWorking
      }))
    })

    console.log('✅ Рабочие часы созданы:')
    const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
    workingHoursData.forEach(hour => {
      console.log(`   ${dayNames[hour.dayOfWeek]}: ${hour.isWorking ? `${hour.startTime} - ${hour.endTime}` : 'Не работает'}`)
    })

  } catch (error) {
    console.log('❌ Ошибка при создании рабочих часов:', error)
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


