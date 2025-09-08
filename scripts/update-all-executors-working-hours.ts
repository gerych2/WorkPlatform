import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Обновляем рабочие часы для всех исполнителей...')

  try {
    // Находим всех исполнителей
    const executors = await prisma.user.findMany({
      where: { role: 'executor' }
    })

    console.log(`👥 Найдено исполнителей: ${executors.length}`)

    for (const executor of executors) {
      console.log(`\n👤 Обрабатываем: ${executor.name} (ID: ${executor.id})`)

      // Проверяем, есть ли уже рабочие часы
      const existingHours = await prisma.workingHours.findMany({
        where: { executorId: executor.id }
      })

      if (existingHours.length > 0) {
        console.log(`  ℹ️ У исполнителя уже есть ${existingHours.length} записей рабочих часов`)
        
        // Проверяем, нужно ли обновить логику дней недели
        const hasOldLogic = existingHours.some(hour => hour.dayOfWeek === 1) // Старая логика: понедельник = 1
        
        if (hasOldLogic) {
          console.log(`  🔄 Обновляем логику дней недели...`)
          
          // Удаляем старые записи
          await prisma.workingHours.deleteMany({
            where: { executorId: executor.id }
          })
          
          // Создаем новые с правильной логикой
          await createWorkingHours(executor.id)
          console.log(`  ✅ Рабочие часы обновлены`)
        } else {
          console.log(`  ✅ Логика дней недели уже правильная`)
        }
      } else {
        console.log(`  ➕ Создаем рабочие часы...`)
        await createWorkingHours(executor.id)
        console.log(`  ✅ Рабочие часы созданы`)
      }
    }

    console.log('\n🎉 Обновление завершено!')

  } catch (error) {
    console.log('❌ Ошибка:', error)
  }
}

async function createWorkingHours(executorId: number) {
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
      executorId: executorId,
      dayOfWeek: hour.dayOfWeek,
      startTime: hour.startTime,
      endTime: hour.endTime,
      isWorking: hour.isWorking
    }))
  })
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
