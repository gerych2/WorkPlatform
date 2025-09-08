'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'

interface Executor {
  id: number
  name: string
  email: string
  phone: string
  executorProfile?: {
    categories: number[]
    experience: number
    rating: number
    bio: string
  }
}

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

export default function SelectTime() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedExecutor, setSelectedExecutor] = useState<Executor | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [serviceDescription, setServiceDescription] = useState<string>('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    // Проверяем аутентификацию
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user && user.id && user.role === 'client') {
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
        // Получаем выбранного исполнителя
        const executorStr = localStorage.getItem('selectedExecutor')
        if (executorStr) {
          try {
            const executor = JSON.parse(executorStr)
            setSelectedExecutor(executor)
          } catch (error) {
            console.error('Error parsing selected executor:', error)
            router.push('/dashboard/client/search')
          }
        } else {
          router.push('/dashboard/client/search')
        }

        // Получаем описание услуги
        const serviceStr = localStorage.getItem('serviceDescription')
        if (serviceStr) {
          setServiceDescription(serviceStr)
        }
      }
    })
  }, [router])

  const fetchTimeSlots = async (date: string) => {
    if (!selectedExecutor) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/executor/schedule?executorId=${selectedExecutor.id}&date=${date}`)
      
      if (response.ok) {
        const data = await response.json()
        const slots = data.availableSlots.map((time: string) => ({
          time,
          available: true
        }))
        setTimeSlots(slots)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch time slots:', errorData.error)
        
        // Показываем сообщение об ошибке, если дата в прошлом
        if (errorData.error && errorData.error.includes('прошедшую дату')) {
          setTimeSlots([])
          // Можно добавить уведомление пользователю
        } else {
          setTimeSlots([])
        }
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
      setTimeSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    fetchTimeSlots(date)
    setShowDatePicker(false)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleConfirmBooking = () => {
    console.log('Кнопка подтверждения нажата')
    console.log('selectedDate:', selectedDate)
    console.log('selectedTime:', selectedTime)
    console.log('selectedExecutor:', selectedExecutor)
    console.log('serviceDescription:', serviceDescription)

    if (!selectedDate || !selectedTime || !selectedExecutor) {
      console.log('Не все обязательные поля заполнены')
      return
    }

    // Сохраняем выбранное время и описание услуги
    localStorage.setItem('selectedDateTime', JSON.stringify({
      date: selectedDate,
      time: selectedTime
    }))
    localStorage.setItem('serviceDescription', serviceDescription || 'Услуга не указана')

    console.log('Данные сохранены в localStorage')

    // Проверяем, есть ли данные формы в localStorage (прямое бронирование)
    const orderFormData = localStorage.getItem('orderFormData')
    
    if (orderFormData) {
      // Это прямое бронирование - переходим к созданию заказа
      console.log('Переходим к созданию заказа')
      router.push('/dashboard/client/create-order')
    } else {
      // Это обычный поиск - переходим к бронированию
      console.log('Переходим к бронированию')
      router.push('/dashboard/client/booking')
    }
  }

  const getToday = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getNext30Days = () => {
    const days = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('ru-RU', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        })
      })
    }
    
    return days
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
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

  if (!selectedExecutor) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Исполнитель не выбран</p>
          <Button 
            onClick={() => router.push('/dashboard/client/search')}
            className="mt-4"
          >
            Выбрать исполнителя
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Выберите время
          </h1>
          <p className="text-gray-600">
            Выберите удобное время для выполнения услуги
          </p>
          
          {/* Информация о прямом бронировании */}
          {localStorage.getItem('orderFormData') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Прямое бронирование</h3>
              <p className="text-sm text-blue-700">
                Вы бронируете время у конкретного исполнителя. После выбора времени вы перейдете к созданию заказа.
              </p>
            </div>
          )}
        </div>

        {/* Информация об исполнителе */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedExecutor.name}
              </h3>
              <p className="text-gray-600">
                {selectedExecutor.executorProfile?.bio || 'Опытный исполнитель'}
              </p>
              {selectedExecutor.executorProfile?.rating && typeof selectedExecutor.executorProfile.rating === 'number' && (
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 text-sm text-gray-600">
                    {selectedExecutor.executorProfile.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Описание услуги */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Опишите задачу
          </h3>
          <textarea
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            placeholder="Опишите подробно, что нужно сделать..."
            className="w-full p-4 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 resize-none"
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-2">
            Чем подробнее вы опишете задачу, тем точнее исполнитель сможет оценить время и стоимость
          </p>
        </div>

        {/* Выбор даты */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Выберите дату
          </h3>
          
          {!selectedDate ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getNext30Days().map((day) => (
                <button
                  key={day.date}
                  onClick={() => handleDateSelect(day.date)}
                  className="p-3 text-center border border-secondary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {day.display}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary-600" />
                <span className="text-lg font-medium text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedDate('')}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Изменить дату
              </Button>
            </div>
          )}
        </div>

        {/* Выбор времени */}
        {selectedDate && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Выберите время
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin mr-3" />
                <span className="text-gray-600">Загружаем доступное время...</span>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">На выбранную дату нет доступного времени</p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate('')}
                  className="mt-4"
                >
                  Выбрать другую дату
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      selectedTime === slot.time
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : slot.available
                        ? 'border-secondary-300 hover:border-primary-500 hover:bg-primary-50 text-gray-900'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {formatTime(slot.time)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Кнопка подтверждения */}
        {selectedDate && selectedTime && (
          <div className="flex justify-center">
            <Button
              onClick={handleConfirmBooking}
              className="px-8 py-3 text-lg"
              disabled={!selectedDate || !selectedTime || !selectedExecutor}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Подтвердить время
            </Button>
          </div>
        )}

        {/* Навигация */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/client/search')}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад к поиску
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/client')}
          >
            В кабинет
          </Button>
        </div>
      </div>
    </div>
  )
}
