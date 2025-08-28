'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { Calendar, Clock, MapPin, Phone, User, CheckCircle, AlertCircle } from 'lucide-react'

interface Executor {
  id: number
  name: string
  category: string
  rating: number
  reviews: number
  price: string
  avatar: string
  isOnline: boolean
  experience: string
  location: string
  description: string
  services: string[]
  responseTime: string
  completedOrders: number
}

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface BookingForm {
  executorId: number | null
  selectedDate: string
  selectedTime: string
  service: string
  description: string
  address: string
  phone: string
  name: string
  notes: string
}

export default function ClientBooking() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedExecutor, setSelectedExecutor] = useState<Executor | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    executorId: null,
    selectedDate: '',
    selectedTime: '',
    service: '',
    description: '',
    address: '',
    phone: '',
    name: '',
    notes: ''
  })

  // Получаем данные выбранного мастера при загрузке компонента
  useEffect(() => {
    const savedExecutor = localStorage.getItem('selectedExecutor')
    if (savedExecutor) {
      try {
        const rawExecutor = JSON.parse(savedExecutor)
        
        // Очищаем объект, оставляя только нужные поля
        const cleanExecutor: Executor = {
          id: rawExecutor.id,
          name: rawExecutor.name,
          category: rawExecutor.category,
          rating: rawExecutor.rating,
          reviews: rawExecutor.reviews,
          price: rawExecutor.price,
          avatar: rawExecutor.avatar,
          isOnline: rawExecutor.isOnline,
          experience: rawExecutor.experience || 'Не указано',
          location: rawExecutor.location,
          description: rawExecutor.description || 'Описание не указано',
          services: rawExecutor.services || [rawExecutor.category],
          responseTime: rawExecutor.responseTime || 'Не указано',
          completedOrders: rawExecutor.completedOrders || 0
        }
        
        setSelectedExecutor(cleanExecutor)
        setBookingForm(prev => ({
          ...prev,
          executorId: cleanExecutor.id,
          service: cleanExecutor.category // Устанавливаем категорию как услугу по умолчанию
        }))
      } catch (error) {
        console.error('Ошибка при загрузке данных мастера:', error)
      }
    }
  }, [])

  // Моковые данные исполнителей (обновлены под Беларусь)
  const executors: Executor[] = [
    {
      id: 1,
      name: 'Электрик',
      category: 'Электрика',
      rating: 4.9,
      reviews: 127,
      price: 'от 120 BYN',
      avatar: 'АП',
      isOnline: true,
      experience: '8 лет',
      location: 'Минск, Центральный район',
      description: 'Профессиональный электрик с опытом работы в жилых и коммерческих помещениях. Выполняю все виды электромонтажных работ.',
      services: ['Ремонт проводки', 'Установка розеток', 'Монтаж освещения', 'Электробезопасность'],
      responseTime: '2.3 ч',
      completedOrders: 156
    },
    {
      id: 2,
      name: 'Косметолог',
      category: 'Косметология',
      rating: 4.8,
      reviews: 89,
      price: 'от 85 BYN',
      avatar: 'МИ',
      isOnline: false,
      experience: '5 лет',
      location: 'Минск, Серебрянка',
      description: 'Сертифицированный косметолог. Предоставляю услуги по уходу за лицом, массаж, чистка.',
      services: ['Чистка лица', 'Массаж лица', 'Уходовые процедуры', 'Консультации'],
      responseTime: '1.8 ч',
      completedOrders: 94
    },
    {
      id: 3,
      name: 'Дмитрий Козлов',
      category: 'Сантехника',
      rating: 4.7,
      reviews: 156,
      price: 'от 150 BYN',
      avatar: 'ДК',
      isOnline: true,
      experience: '12 лет',
      location: 'Минск, Московский район',
      description: 'Опытный сантехник. Устанавливаю и ремонтирую сантехнику, трубы, смесители.',
      services: ['Установка сантехники', 'Ремонт труб', 'Замена смесителей', 'Прочистка засоров'],
      responseTime: '3.1 ч',
      completedOrders: 203
    }
  ]

  // Генерация доступных дат (следующие 14 дней)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('ru-RU', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        day: date.getDate(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      })
    }
    
    return dates
  }

  // Генерация временных слотов для выбранной даты
  const generateTimeSlots = (date: string) => {
    const slots: TimeSlot[] = []
    
    if (!selectedExecutor) return slots
    
    // Проверяем, есть ли уже заказы на эту дату
    const existingBookings = getExistingBookings(date)
    
    // Базовые слоты с 9:00 до 18:00
    for (let hour = 9; hour < 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
      
      // Проверяем, не забронировано ли это время
      const isBooked = existingBookings.some(booking => 
        booking.time === startTime && booking.executorId === selectedExecutor.id
      )
      
      slots.push({
        id: `${date}-${startTime}`,
        date,
        startTime,
        endTime,
        isAvailable: !isBooked
      })
    }
    
    return slots
  }

  // Моковые данные существующих бронирований
  const getExistingBookings = (date: string) => {
    const bookings = [
      {
        date: '2024-12-22',
        time: '14:00',
        executorId: 1
      },
      {
        date: '2024-12-23',
        time: '10:00',
        executorId: 2
      }
    ]
    
    return bookings.filter(booking => booking.date === date)
  }

  const availableDates = generateAvailableDates()
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : []

  // Обработчики событий
  const handleExecutorSelect = (executor: Executor) => {
    if (!executor || !executor.id) {
      console.error('Некорректные данные исполнителя')
      return
    }
    
    setSelectedExecutor(executor)
    setBookingForm(prev => ({ ...prev, executorId: executor.id }))
    setCurrentStep(2)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    setBookingForm(prev => ({ ...prev, selectedDate: date }))
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setBookingForm(prev => ({ ...prev, selectedTime: time }))
  }

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (currentStep === 1 && selectedExecutor && selectedExecutor.id) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedDate && selectedTime) {
      setCurrentStep(3)
    } else if (currentStep === 3 && isFormValid()) {
      handleBooking()
    }
  }

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isFormValid = () => {
    return bookingForm.service && 
           bookingForm.description && 
           bookingForm.address && 
           bookingForm.phone && 
           bookingForm.name
  }

  const handleBooking = () => {
    if (!selectedExecutor) {
      console.error('Исполнитель не выбран')
      return
    }

    // Создаем объект заказа
    const newOrder = {
      id: Date.now(), // Временный ID для демо
      ...bookingForm,
      executor: {
        id: selectedExecutor.id,
        name: selectedExecutor.name,
        category: selectedExecutor.category
      },
      totalPrice: calculatePrice(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      date: selectedDate,
      time: selectedTime
    }

    // Сохраняем заказ в localStorage (в реальном приложении это будет API)
    const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    existingOrders.push(newOrder)
    localStorage.setItem('userOrders', JSON.stringify(existingOrders))

    console.log('Заказ создан:', newOrder)
    
    setShowSuccess(true)
    
    // Через 2 секунды перенаправляем на страницу заказов
    setTimeout(() => {
      router.push('/dashboard/client/orders')
    }, 2000)
  }

  const calculatePrice = () => {
    if (!selectedExecutor || !selectedExecutor.price) return 0
    
    // Базовая цена + доплата за срочность
    const basePrice = parseInt(selectedExecutor.price.match(/\d+/)?.[0] || '0')
    const isUrgent = selectedDate === availableDates[0]?.value // Если завтра
    
    return isUrgent ? basePrice * 1.5 : basePrice
  }

  const resetBooking = () => {
    setCurrentStep(1)
    setSelectedExecutor(null)
    setSelectedDate('')
    setSelectedTime('')
    setShowSuccess(false)
    setBookingForm({
      executorId: null,
      selectedDate: '',
      selectedTime: '',
      service: '',
      description: '',
      address: '',
      phone: '',
      name: '',
      notes: ''
    })
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userRole="client" userName="Клиент" notificationsCount={2} />
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Заказ успешно оформлен!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Мастер {selectedExecutor?.name} получил ваш заказ и свяжется с вами в ближайшее время для подтверждения.
            </p>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Детали заказа
              </h3>
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Мастер:</span>
                  <span className="font-medium">{selectedExecutor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Дата:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Время:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Услуга:</span>
                  <span className="font-medium">{bookingForm.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Адрес:</span>
                  <span className="font-medium">{bookingForm.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Стоимость:</span>
                  <span className="font-bold text-primary-600">{calculatePrice()} BYN</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button onClick={resetBooking} className="w-full">
                Оформить новый заказ
              </Button>
              
              <Button variant="outline" onClick={() => window.location.href = '/dashboard/client/orders'} className="w-full">
                Посмотреть мои заказы
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="client" userName="Клиент" notificationsCount={2} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Бронирование услуги
          </h1>
          <p className="text-gray-600">
            Выберите мастера, дату и время для получения услуги
          </p>
        </div>

        {/* Проверка загруженных данных */}
        {!selectedExecutor && (
          <div className="mb-8">
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-medium text-yellow-800">
                    Данные мастера не загружены
                  </h3>
                  <p className="text-yellow-700">
                    Пожалуйста, вернитесь на страницу поиска и выберите мастера заново.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/dashboard/client/search'}
                  className="w-full"
                >
                  Вернуться к поиску
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Прогресс-бар */}
        {selectedExecutor && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Выбор мастера</span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
              
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Дата и время</span>
              </div>
              
              <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
              
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">Детали заказа</span>
              </div>
            </div>
          </div>
        )}

        {/* Шаг 1: Выбор мастера */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Выберите мастера
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {executors.map((executor) => (
                  <div
                    key={executor.id}
                    className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedExecutor?.id === executor.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                    }`}
                    onClick={() => handleExecutorSelect(executor)}
                  >
                    <div className="text-center">
                      <div className="relative mx-auto mb-4">
                        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-xl">{executor.avatar}</span>
                        </div>
                        {executor.isOnline && (
                          <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-400 ring-2 ring-white" />
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{executor.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{executor.category}</p>
                      
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">{executor.rating}</span>
                        <span className="text-sm text-gray-500">({executor.reviews} отзывов)</span>
                      </div>
                      
                      <p className="text-lg font-bold text-primary-600 mb-3">{executor.price}</p>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Опыт: {executor.experience}</p>
                        <p>Время ответа: {executor.responseTime}</p>
                        <p>Выполнено заказов: {executor.completedOrders}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Шаг 2: Выбор даты и времени */}
        {currentStep === 2 && selectedExecutor && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Выберите дату и время
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Выбор даты */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Дата</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {availableDates.map((date) => (
                      <button
                        key={date.value}
                        onClick={() => handleDateSelect(date.value)}
                        className={`p-3 text-center rounded-lg border transition-colors ${
                          selectedDate === date.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${date.isWeekend ? 'bg-yellow-50' : ''}`}
                      >
                        <div className="text-sm font-medium">{date.label}</div>
                        {date.isWeekend && (
                          <div className="text-xs text-yellow-600">Выходной</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Выбор времени */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Время</h3>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleTimeSelect(slot.startTime)}
                          disabled={!slot.isAvailable}
                          className={`p-3 text-center rounded-lg border transition-colors ${
                            selectedTime === slot.startTime
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : slot.isAvailable
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Сначала выберите дату</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Шаг 3: Детали заказа */}
        {currentStep === 3 && selectedExecutor && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Детали заказа
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Услуга *
                  </label>
                  <select
                    value={bookingForm.service}
                    onChange={(e) => handleInputChange('service', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Выберите услугу</option>
                    {selectedExecutor?.services?.map((service, index) => (
                      <option key={index} value={service}>
                        {service}
                      </option>
                    )) || (
                      <option value={selectedExecutor?.category || 'Услуга'}>
                        {selectedExecutor?.category || 'Услуга'}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя *
                  </label>
                  <Input
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ваше имя"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <Input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+375 (29) 123-45-67"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес *
                  </label>
                  <Input
                    type="text"
                    value={bookingForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="ул. Ленина, д. 15, кв. 23, Минск"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание задачи *
                  </label>
                  <textarea
                    value={bookingForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Опишите, что нужно сделать..."
                    className="input-field min-h-[100px] resize-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дополнительные заметки
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Дополнительная информация, особые требования..."
                    className="input-field min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Сводка заказа */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Сводка заказа
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                 <div className="flex justify-between">
                   <span className="text-gray-600">Мастер:</span>
                   <span className="font-medium">{selectedExecutor?.name || 'Не выбран'}</span>
                 </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Дата:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Время:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Услуга:</span>
                  <span className="font-medium">{bookingForm.service || 'Не выбрано'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Стоимость:</span>
                                     <span className="font-bold text-primary-600">{calculatePrice()} BYN</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Навигация */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBackStep}
            disabled={currentStep === 1}
          >
            Назад
          </Button>
          
          <div className="flex items-center space-x-3">
            {currentStep < 3 && (
              <Button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !selectedExecutor) ||
                  (currentStep === 2 && (!selectedDate || !selectedTime))
                }
              >
                Далее
              </Button>
            )}
            
            {currentStep === 3 && (
              <Button
                onClick={handleNextStep}
                disabled={!isFormValid()}
                className="bg-green-600 hover:bg-green-700"
              >
                Подтвердить заказ
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 