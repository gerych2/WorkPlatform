'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { safeBase64Encode } from '../../../../lib/utils'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Save,
  X,
  Edit,
  Trash2
} from 'lucide-react'

interface CalendarEvent {
  id: number
  title: string
  date: string
  time: string
  duration: number
  client?: {
    name: string
    phone: string
  }
  address?: string
  status?: string
  price?: number
  description: string
  type: 'order' | 'personal' | 'break' | 'unavailable'
}

interface WorkingHours {
  id?: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isWorking: boolean
}

export default function ExecutorCalendar() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Календарь
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  // Рабочие часы
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false)
  const [isEditingWorkingHours, setIsEditingWorkingHours] = useState(false)

  // Модальные окна
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  
  // Форма нового события
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    duration: 1,
    description: '',
    type: 'personal' as 'personal' | 'break' | 'unavailable'
  })

  useEffect(() => {
    // Проверяем аутентификацию
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        console.log('Calendar - userStr from localStorage:', userStr)
        if (userStr) {
          const user = JSON.parse(userStr)
          console.log('Calendar - parsed user:', user)
          if (user && user.id && user.role === 'executor') {
            setCurrentUser(user)
            setIsAuthenticated(true)
            return user
          }
        }
        router.push('/auth/login')
        return null
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/login')
        return null
      }
    }

    checkAuth().then(user => {
      if (user) {
        loadEvents(user)
        loadWorkingHours(user)
      }
    })
  }, [router])

  // Обработчик клавиши Escape для закрытия модальных окон
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showWorkingHoursModal) {
          setShowWorkingHoursModal(false)
        } else if (showEventModal) {
          setShowEventModal(false)
        } else if (showAddEventModal) {
          setShowAddEventModal(false)
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showWorkingHoursModal, showEventModal, showAddEventModal])

  const loadEvents = async (user: any) => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      console.log('Loading events for date range:', startDate.toISOString(), 'to', endDate.toISOString())
      
      const response = await fetch(`/api/executor/calendar-events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(user))}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Loaded events:', data)
        setEvents(data)
      } else {
        const errorData = await response.json()
        console.error('Failed to load events:', errorData)
        setEvents([])
      }
    } catch (error) {
      console.error('Error loading events:', error)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorkingHours = async (user: any) => {
    try {
      const response = await fetch('/api/executor/working-hours', {
        headers: {
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(user))}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Loaded working hours:', data)
        
        if (data && data.length > 0) {
          setWorkingHours(data)
        } else {
          // Если нет рабочих часов, создаем дефолтные
          const defaultHours = [
            { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isWorking: true }, // Понедельник
            { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isWorking: true }, // Вторник
            { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isWorking: true }, // Среда
            { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isWorking: true }, // Четверг
            { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isWorking: true }, // Пятница
            { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isWorking: true }, // Суббота
            { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isWorking: false } // Воскресенье
          ]
          setWorkingHours(defaultHours)
        }
      } else {
        console.error('Failed to load working hours, status:', response.status)
        // Создаем дефолтные часы при ошибке
        const defaultHours = [
          { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isWorking: true }, // Понедельник
          { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isWorking: true }, // Вторник
          { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isWorking: true }, // Среда
          { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isWorking: true }, // Четверг
          { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isWorking: true }, // Пятница
          { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isWorking: true }, // Суббота
          { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isWorking: false } // Воскресенье
        ]
        setWorkingHours(defaultHours)
      }
    } catch (error) {
      console.error('Error loading working hours:', error)
      // Создаем дефолтные часы при ошибке
      const defaultHours = [
        { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isWorking: true }, // Понедельник
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isWorking: true }, // Вторник
        { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isWorking: true }, // Среда
        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isWorking: true }, // Четверг
        { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isWorking: true }, // Пятница
        { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isWorking: true }, // Суббота
        { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isWorking: false } // Воскресенье
      ]
      setWorkingHours(defaultHours)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Исправляем логику: 8 сентября должно быть понедельником
    // В JavaScript: воскресенье = 0, понедельник = 1, ..., суббота = 6
    // В нашем календаре: понедельник = 0, вторник = 1, ..., воскресенье = 6
    let startingDayOfWeek = firstDay.getDay()
    if (startingDayOfWeek === 0) {
      startingDayOfWeek = 6 // Воскресенье становится последним днем недели
    } else {
      startingDayOfWeek = startingDayOfWeek - 1 // Сдвигаем на 1 день назад
    }

    const days = []
    
    // Добавляем пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getWeekDays = (date: Date) => {
    const dayOfWeek = date.getDay()
    const monday = new Date(date)
    
    // Исправляем логику: понедельник должен быть первым днем недели
    if (dayOfWeek === 0) {
      // Если это воскресенье, понедельник был 6 дней назад
      monday.setDate(date.getDate() - 6)
    } else {
      // Иначе понедельник был (dayOfWeek - 1) дней назад
      monday.setDate(date.getDate() - (dayOfWeek - 1))
    }
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      weekDays.push(day)
    }
    
    return weekDays
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
      return newDate
    })
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1)
      } else {
        newDate.setDate(newDate.getDate() + 1)
      }
      return newDate
    })
  }

  // Обновляем события при смене месяца
  useEffect(() => {
    if (currentUser) {
      loadEvents(currentUser)
    }
  }, [currentDate, currentUser])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setViewMode('day')
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const saveWorkingHours = async () => {
    if (!currentUser) return

    console.log('Saving working hours - currentUser:', currentUser)
    console.log('Saving working hours - workingHours:', workingHours)

    try {
      const response = await fetch('/api/executor/working-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify({ workingHours })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Working hours saved:', result)
        
        setIsEditingWorkingHours(false)
        setShowWorkingHoursModal(false)
        
        // Обновляем рабочие часы
        await loadWorkingHours(currentUser)
        alert('Рабочие часы сохранены!')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Ошибка при сохранении рабочих часов: ${errorData.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Error saving working hours:', error)
      alert('Ошибка при сохранении рабочих часов')
    }
  }

  const addEvent = async () => {
    if (!currentUser) return

    // Валидация
    if (!newEvent.title.trim()) {
      alert('Введите название события')
      return
    }
    if (!newEvent.date) {
      alert('Выберите дату')
      return
    }
    if (!newEvent.time) {
      alert('Выберите время')
      return
    }

    try {
      const response = await fetch('/api/executor/calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify(newEvent)
      })

      if (response.ok) {
        const createdEvent = await response.json()
        console.log('Event created:', createdEvent)
        
        setShowAddEventModal(false)
        setNewEvent({
          title: '',
          date: '',
          time: '',
          duration: 1,
          description: '',
          type: 'personal'
        })
        
        // Обновляем события
        await loadEvents(currentUser)
        alert('Событие добавлено!')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Ошибка при добавлении события: ${errorData.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Error adding event:', error)
      alert('Ошибка при добавлении события')
    }
  }

  const updateWorkingHour = (dayOfWeek: number, field: string, value: any) => {
    setWorkingHours(prev => prev.map(hour => 
      hour.dayOfWeek === dayOfWeek 
        ? { ...hour, [field]: value }
        : hour
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтвержден'
      case 'pending': return 'Ожидает'
      case 'cancelled': return 'Отменен'
      default: return 'Неизвестно'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Проверка аутентификации...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка календаря...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Календарь
          </h1>
          <p className="text-gray-600">
            Управляйте своим расписанием и заказами
          </p>
        </div>

        {/* Панель управления */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === 'month' && currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                {viewMode === 'week' && (() => {
                  const weekDays = getWeekDays(currentDate)
                  const startDate = weekDays[0]
                  const endDate = weekDays[6]
                  return `${startDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`
                })()}
                {viewMode === 'day' && currentDate.toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    if (viewMode === 'month') navigateMonth('prev')
                    else if (viewMode === 'week') navigateWeek('prev')
                    else if (viewMode === 'day') navigateDay('prev')
                  }}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setCurrentDate(new Date())}
                  variant="outline"
                  size="sm"
                >
                  Сегодня
                </Button>
                <Button
                  onClick={() => {
                    if (viewMode === 'month') navigateMonth('next')
                    else if (viewMode === 'week') navigateWeek('next')
                    else if (viewMode === 'day') navigateDay('next')
                  }}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'month' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Месяц
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'week' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Неделя
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'day' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  День
                </button>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowWorkingHoursModal(true)}
                className="flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Рабочие часы
              </Button>
              
              <Button 
                onClick={() => setShowAddEventModal(true)}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить событие
              </Button>
            </div>
          </div>
        </div>

        {/* Календарь */}
        {viewMode === 'month' && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            {/* Заголовки дней недели */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Дни месяца */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-24" />
                }

                const dayEvents = getEventsForDate(day)
                const isToday = day.toDateString() === new Date().toDateString()
                const isSelected = day.toDateString() === selectedDate.toDateString()

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`h-24 border border-secondary-200 rounded-lg p-2 cursor-pointer hover:bg-secondary-50 transition-colors ${
                      isToday ? 'bg-primary-50 border-primary-300' : ''
                    } ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-primary-600' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${
                            event.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {event.time} - {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} еще
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Недельный вид */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            {/* Заголовки дней недели */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {getWeekDays(selectedDate).map(day => (
                <div key={day.toISOString()} className="text-center">
                  <div className="text-sm font-medium text-gray-500 py-2">
                    {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-semibold ${
                    day.toDateString() === new Date().toDateString() 
                      ? 'text-primary-600' 
                      : 'text-gray-900'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* События недели */}
            <div className="grid grid-cols-7 gap-1">
              {getWeekDays(selectedDate).map(day => {
                const dayEvents = getEventsForDate(day)
                const isToday = day.toDateString() === new Date().toDateString()
                const isSelected = day.toDateString() === selectedDate.toDateString()

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`min-h-32 border border-secondary-200 rounded-lg p-2 cursor-pointer hover:bg-secondary-50 transition-colors ${
                      isToday ? 'bg-primary-50 border-primary-300' : ''
                    } ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${
                            event.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Детальный вид дня */}
        {viewMode === 'day' && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>

            <div className="space-y-4">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.time} ({event.duration}ч)
                          </span>
                          {event.address && (
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.address}
                            </span>
                          )}
                          {event.client && (
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {event.client.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {event.status && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                            {getStatusText(event.status)}
                          </span>
                        )}
                        {event.price && (
                          <p className="text-lg font-bold text-primary-600 mt-2">
                            {event.price} BYN
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">На этот день нет запланированных событий</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Модальное окно события */}
        {showEventModal && selectedEvent && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowEventModal(false)}
          >
            <div 
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                  title="Закрыть"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Описание</p>
                  <p className="text-gray-900">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Дата и время</p>
                    <p className="text-gray-900">
                      {new Date(selectedEvent.date).toLocaleDateString('ru-RU')} в {selectedEvent.time}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Длительность</p>
                    <p className="text-gray-900">{selectedEvent.duration} часа</p>
                  </div>
                </div>

                {selectedEvent.address && (
                  <div>
                    <p className="text-sm text-gray-600">Адрес</p>
                    <p className="text-gray-900">{selectedEvent.address}</p>
                  </div>
                )}

                {selectedEvent.client && (
                  <div>
                    <p className="text-sm text-gray-600">Клиент</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900">{selectedEvent.client.name}</p>
                        <p className="text-sm text-gray-600">{selectedEvent.client.phone}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Позвонить
                      </Button>
                    </div>
                  </div>
                )}

                {selectedEvent.status && (
                  <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                    <div>
                      <p className="text-sm text-gray-600">Статус</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedEvent.status)}`}>
                        {getStatusText(selectedEvent.status)}
                      </span>
                    </div>
                    
                    {selectedEvent.price && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Стоимость</p>
                        <p className="text-lg font-bold text-primary-600">{selectedEvent.price} BYN</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно рабочих часов */}
        {showWorkingHoursModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowWorkingHoursModal(false)}
          >
            <div 
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Настройка рабочих часов
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Нажмите X, кнопку "Закрыть" или клавишу Esc для закрытия
                  </p>
                </div>
                <button
                  onClick={() => setShowWorkingHoursModal(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-red-50 rounded-full p-2 transition-colors border border-gray-200 hover:border-red-300"
                  title="Закрыть (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {workingHours.map((hour, index) => (
                  <div key={hour.dayOfWeek} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-24">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hour.isWorking}
                          onChange={(e) => updateWorkingHour(hour.dayOfWeek, 'isWorking', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">
                          {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][hour.dayOfWeek]}
                        </span>
                      </label>
                    </div>
                    
                    {hour.isWorking && (
                      <>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">С</label>
                          <Input
                            type="time"
                            value={hour.startTime}
                            onChange={(e) => updateWorkingHour(hour.dayOfWeek, 'startTime', e.target.value)}
                            className="w-24"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">До</label>
                          <Input
                            type="time"
                            value={hour.endTime}
                            onChange={(e) => updateWorkingHour(hour.dayOfWeek, 'endTime', e.target.value)}
                            className="w-24"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setShowWorkingHoursModal(false)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Закрыть
                </Button>
                <Button onClick={saveWorkingHours}>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно добавления события */}
        {showAddEventModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddEventModal(false)}
          >
            <div 
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Добавить событие
                </h3>
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                  title="Закрыть"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название
                  </label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Название события"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата
                    </label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Время
                    </label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Длительность (часы)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="personal">Личное</option>
                      <option value="break">Перерыв</option>
                      <option value="unavailable">Недоступен</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Описание события"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddEventModal(false)}
                >
                  Отмена
                </Button>
                <Button onClick={addEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}