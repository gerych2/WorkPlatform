'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Calendar, Clock, Plus, Edit, Trash2, Check, X } from 'lucide-react'

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  orderId?: string
  clientName?: string
  service?: string
}

interface DaySchedule {
  date: string
  dayName: string
  dayNumber: number
  isToday: boolean
  isCurrentMonth: boolean
  timeSlots: TimeSlot[]
}

export default function ExecutorCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [newSlot, setNewSlot] = useState({
    startTime: '09:00',
    endTime: '10:00',
    isAvailable: true
  })

  // Загружаем временные слоты при монтировании
  useEffect(() => {
    loadTimeSlots()
  }, [])

  const loadTimeSlots = () => {
    const savedSlots = localStorage.getItem('executorTimeSlots')
    if (savedSlots) {
      try {
        setTimeSlots(JSON.parse(savedSlots))
      } catch (error) {
        console.error('Ошибка при загрузке временных слотов:', error)
      }
    }
  }

  const saveTimeSlots = (slots: TimeSlot[]) => {
    setTimeSlots(slots)
    localStorage.setItem('executorTimeSlots', JSON.stringify(slots))
  }

  // Генерация календаря
  const generateCalendar = (date: Date): DaySchedule[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const calendar: DaySchedule[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const isToday = currentDate.toDateString() === new Date().toDateString()
      const isCurrentMonth = currentDate.getMonth() === month
      
      // Генерация временных слотов для дня
      const timeSlots: TimeSlot[] = generateTimeSlotsForDay(currentDate)
      
      calendar.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: currentDate.toLocaleDateString('ru-RU', { weekday: 'short' }),
        dayNumber: currentDate.getDate(),
        isToday,
        isCurrentMonth,
        timeSlots
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return calendar
  }

  // Генерация временных слотов для конкретного дня
  const generateTimeSlotsForDay = (date: Date): TimeSlot[] => {
    const dateStr = date.toISOString().split('T')[0]
    
    // Получаем слоты для конкретной даты
    const dateSlotsFromStorage = timeSlots.filter(slot => slot.date === dateStr)
    
    // Если есть сохраненные слоты для этой даты, используем их
    if (dateSlotsFromStorage.length > 0) {
      return dateSlotsFromStorage.map(slot => {
        // Проверяем, есть ли заказы на это время
        const existingOrder = getExistingOrder(dateStr, slot.startTime)
        return {
          ...slot,
          orderId: existingOrder?.id,
          clientName: existingOrder?.clientName,
          service: existingOrder?.service,
          isAvailable: slot.isAvailable && !existingOrder
        }
      })
    }
    
    // Если нет сохраненных слотов, генерируем базовые слоты
    const slots: TimeSlot[] = []
    for (let hour = 9; hour < 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
      
      const existingOrder = getExistingOrder(dateStr, startTime)
      
      slots.push({
        id: `${dateStr}-${startTime}`,
        date: dateStr,
        startTime,
        endTime,
        isAvailable: !existingOrder,
        orderId: existingOrder?.id,
        clientName: existingOrder?.clientName,
        service: existingOrder?.service
      })
    }
    
    return slots
  }

  // Моковые данные существующих заказов
  const getExistingOrder = (date: string, time: string) => {
    const orders = [
      {
        id: '1',
        date: '2024-12-22',
        time: '14:00',
        clientName: 'Анна Петрова',
        service: 'Ремонт электрики'
      },
      {
        id: '2',
        date: '2024-12-23',
        time: '10:00',
        clientName: 'Михаил Сидоров',
        service: 'Установка розеток'
      }
    ]
    
    return orders.find(order => order.date === date && order.time === time)
  }

  const calendar = generateCalendar(currentDate)

  // Навигация по месяцам
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Управление временными слотами
  const addTimeSlot = () => {
    if (selectedDate && newSlot.startTime && newSlot.endTime) {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const slotId = editingSlot ? editingSlot.id : `${dateStr}-${newSlot.startTime}-${Date.now()}`
      
      const slot: TimeSlot = {
        id: slotId,
        date: dateStr,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isAvailable: newSlot.isAvailable
      }
      
      let updatedSlots
      if (editingSlot) {
        // Редактируем существующий слот
        updatedSlots = timeSlots.map(s => s.id === editingSlot.id ? slot : s)
        setEditingSlot(null)
      } else {
        // Добавляем новый слот
        updatedSlots = [...timeSlots, slot]
      }
      
      saveTimeSlots(updatedSlots)
      setShowAddSlot(false)
      setNewSlot({ startTime: '09:00', endTime: '10:00', isAvailable: true })
    }
  }

  const editTimeSlot = (slot: TimeSlot) => {
    setEditingSlot(slot)
    setNewSlot({
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable
    })
    setShowAddSlot(true)
  }

  const deleteTimeSlot = (slotId: string) => {
    const updatedSlots = timeSlots.filter(s => s.id !== slotId)
    saveTimeSlots(updatedSlots)
  }

  const toggleSlotAvailability = (slot: TimeSlot) => {
    const updatedSlots = timeSlots.map(s => 
      s.id === slot.id 
        ? { ...s, isAvailable: !s.isAvailable }
        : s
    )
    saveTimeSlots(updatedSlots)
  }

  const getSlotStatusColor = (slot: TimeSlot) => {
    if (slot.orderId) return 'bg-blue-100 text-blue-800'
    if (slot.isAvailable) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-600'
  }

  const getSlotStatusText = (slot: TimeSlot) => {
    if (slot.orderId) return 'Забронирован'
    if (slot.isAvailable) return 'Доступен'
    return 'Недоступен'
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="executor" userName="Исполнитель" notificationsCount={3} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и навигация */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Календарь и расписание
              </h1>
              <p className="text-gray-600">
                Управляйте доступным временем и отслеживайте заказы
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button variant="outline" onClick={goToToday}>
                Сегодня
              </Button>
              <Button onClick={() => setShowAddSlot(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить слот
              </Button>
            </div>
          </div>
        </div>

        {/* Навигация по месяцам */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goToPreviousMonth}>
              ← Предыдущий месяц
            </Button>
            
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Сегодня
              </Button>
            </div>
            
            <Button variant="outline" onClick={goToNextMonth}>
              Следующий месяц →
            </Button>
          </div>
        </div>

        {/* Календарь */}
        <div className="card mb-6">
          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Сетка календаря */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((day) => (
              <div
                key={day.date}
                className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors ${
                  day.isToday ? 'bg-primary-50 border-primary-300' : ''
                } ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'} ${
                  selectedDate && day.date === selectedDate.toISOString().split('T')[0] 
                    ? 'ring-2 ring-primary-500 bg-primary-100' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDate(new Date(day.date))}
              >
                {/* Номер дня */}
                <div className={`text-sm font-medium mb-2 ${
                  day.isToday ? 'text-primary-600' : 
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.dayNumber}
                </div>

                {/* Временные слоты */}
                <div className="space-y-1">
                  {day.timeSlots.slice(0, 3).map((slot) => (
                    <div
                      key={slot.id}
                      className={`text-xs p-1 rounded cursor-pointer ${
                        slot.orderId ? 'bg-blue-100 text-blue-800' :
                        slot.isAvailable ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (slot.orderId) {
                          // Показать детали заказа
                          console.log('Заказ:', slot)
                        } else {
                          editTimeSlot(slot)
                        }
                      }}
                    >
                      {slot.startTime}
                      {slot.orderId && ' ✓'}
                    </div>
                  ))}
                  
                  {day.timeSlots.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.timeSlots.length - 3} еще
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Детали выбранного дня */}
        {selectedDate && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <Button variant="outline" size="sm" onClick={() => setShowAddSlot(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить слот
              </Button>
            </div>

            {/* Временные слоты дня */}
            <div className="space-y-3">
              {generateTimeSlotsForDay(selectedDate).map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      slot.orderId ? 'bg-blue-50 border-blue-200' :
                      slot.isAvailable ? 'bg-green-50 border-green-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSlotStatusColor(slot)}`}>
                        {getSlotStatusText(slot)}
                      </span>
                      
                      {slot.orderId && (
                        <div className="text-sm text-gray-600">
                          {slot.clientName} - {slot.service}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {!slot.orderId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSlotAvailability(slot)}
                        >
                          {slot.isAvailable ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editTimeSlot(slot)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {!slot.orderId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTimeSlot(slot.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Модальное окно добавления/редактирования слота */}
        {showAddSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingSlot ? 'Редактировать слот' : 'Добавить временной слот'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время начала
                  </label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время окончания
                  </label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={newSlot.isAvailable}
                    onChange={(e) => setNewSlot({ ...newSlot, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                    Слот доступен для бронирования
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddSlot(false)
                    setEditingSlot(null)
                    setNewSlot({ startTime: '09:00', endTime: '10:00', isAvailable: true })
                  }}
                >
                  Отмена
                </Button>
                
                <Button onClick={addTimeSlot}>
                  {editingSlot ? 'Сохранить' : 'Добавить'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 