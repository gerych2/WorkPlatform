'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { AutoCompleteSelect } from '../../../../components/ui/AutoCompleteSelect'
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  DollarSign,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Search
} from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string
  icon: string
}

export default function CreateOrder() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const [orderType, setOrderType] = useState<'general' | 'direct'>('general') // general - общий заказ, direct - прямое бронирование
  const [selectedExecutor, setSelectedExecutor] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    categoryId: '',
    serviceDescription: '',
    address: '',
    phone: '',
    clientName: '',
    notes: '',
    orderDate: '',
    orderTime: '',
    totalPrice: '',
    priceType: 'fixed', // fixed или negotiable
    urgency: 'medium',
    estimatedDuration: '',
    preferredTime: 'any',
    specialRequirements: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
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
        fetchCategories()
        setFormData(prev => ({
          ...prev,
          clientName: user.name || '',
          phone: user.phone || '',
          address: user.location || ''
        }))
        
        // Загружаем данные для прямого бронирования
        const orderFormData = localStorage.getItem('orderFormData')
        const selectedCategory = localStorage.getItem('selectedCategory')
        const selectedExecutor = localStorage.getItem('selectedExecutor')
        const selectedDateTime = localStorage.getItem('selectedDateTime')
        const serviceDescription = localStorage.getItem('serviceDescription')
        
        if (orderFormData && selectedCategory) {
          // Это прямое бронирование
          setOrderType('direct')
          setSelectedCategory(JSON.parse(selectedCategory))
          setSelectedExecutor(JSON.parse(selectedExecutor || '{}'))
          
          const formDataFromStorage = JSON.parse(orderFormData)
          setFormData(prev => ({
            ...prev,
            ...formDataFromStorage,
            clientName: user.name || '',
            phone: user.phone || '',
            address: user.location || ''
          }))
          
          if (selectedDateTime) {
            const dateTime = JSON.parse(selectedDateTime)
            setFormData(prev => ({
              ...prev,
              orderDate: dateTime.date,
              orderTime: dateTime.time
            }))
          }
          
          if (serviceDescription) {
            setFormData(prev => ({
              ...prev,
              serviceDescription: serviceDescription
            }))
          }
        }
      }
    })
  }, [router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategory(category)
    setFormData(prev => ({ 
      ...prev, 
      categoryId: category ? category.id.toString() : '' 
    }))
    if (errors.categoryId) {
      setErrors(prev => ({ ...prev, categoryId: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.categoryId) {
      newErrors.categoryId = 'Выберите категорию услуги'
    }
    if (!formData.serviceDescription.trim()) {
      newErrors.serviceDescription = 'Опишите требуемую услугу'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Укажите адрес'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Укажите телефон'
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Укажите ваше имя'
    }
    if (!formData.orderDate) {
      newErrors.orderDate = 'Выберите дату'
    }
    if (!formData.orderTime) {
      newErrors.orderTime = 'Выберите время'
    }
    if (formData.priceType === 'fixed' && !formData.totalPrice) {
      newErrors.totalPrice = 'Укажите стоимость услуги'
    }
    if (formData.totalPrice && parseFloat(formData.totalPrice) <= 0) {
      newErrors.totalPrice = 'Стоимость должна быть больше 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Для прямого бронирования проверяем, что выбран исполнитель
    if (orderType === 'direct' && !selectedExecutor) {
      alert('Для прямого бронирования необходимо выбрать исполнителя')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(currentUser)).toString('base64')}`
        },
        body: JSON.stringify({
          ...formData,
          totalPrice: formData.priceType === 'fixed' ? formData.totalPrice : null,
          executorId: orderType === 'direct' ? selectedExecutor?.id : null // Передаем ID исполнителя для прямого бронирования
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при создании заказа')
      }

      const result = await response.json()
      
      // Очищаем localStorage после успешного создания заказа
      localStorage.removeItem('orderFormData')
      localStorage.removeItem('selectedCategory')
      localStorage.removeItem('selectedExecutor')
      localStorage.removeItem('selectedDateTime')
      localStorage.removeItem('serviceDescription')
      
      if (orderType === 'direct') {
        alert(`Заказ успешно создан и отправлен исполнителю ${selectedExecutor?.name}!`)
      } else {
        alert(`Заказ успешно создан! Уведомления отправлены ${result.notifiedExecutors} исполнителям.`)
      }
      
      router.push('/dashboard/client/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      alert(error instanceof Error ? error.message : 'Произошла ошибка при создании заказа')
    } finally {
      setIsLoading(false)
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

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2">
                Создать заказ
              </h1>
              <p className="text-gray-600">
                Опишите требуемую услугу и найдите подходящего исполнителя
              </p>
            </div>
            
            {/* Кнопка быстрого переключения */}
            {orderType === 'direct' && localStorage.getItem('selectedDateTime') && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Очищаем данные прямого бронирования
                  localStorage.removeItem('selectedDateTime')
                  localStorage.removeItem('selectedExecutor')
                  localStorage.removeItem('orderFormData')
                  localStorage.removeItem('selectedCategory')
                  localStorage.removeItem('serviceDescription')
                  
                  // Переключаемся на общий заказ
                  setOrderType('general')
                  setSelectedExecutor(null)
                  setSelectedCategory(null)
                  
                  // Очищаем поля времени
                  setFormData(prev => ({
                    ...prev,
                    orderDate: '',
                    orderTime: '',
                    serviceDescription: ''
                  }))
                }}
                className="bg-white border-red-300 text-red-600 hover:bg-red-50"
              >
                🔓 Разблокировать время
              </Button>
            )}
          </div>
          
          {/* Выбор типа заказа */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Тип заказа</h3>
              {orderType === 'direct' && localStorage.getItem('selectedDateTime') && (
                <button
                  type="button"
                  onClick={() => {
                    // Очищаем данные прямого бронирования
                    localStorage.removeItem('selectedDateTime')
                    localStorage.removeItem('selectedExecutor')
                    localStorage.removeItem('orderFormData')
                    localStorage.removeItem('selectedCategory')
                    localStorage.removeItem('serviceDescription')
                    
                    // Переключаемся на общий заказ
                    setOrderType('general')
                    setSelectedExecutor(null)
                    setSelectedCategory(null)
                    
                    // Очищаем поля времени
                    setFormData(prev => ({
                      ...prev,
                      orderDate: '',
                      orderTime: '',
                      serviceDescription: ''
                    }))
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Переключиться на обычный заказ
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  orderType === 'general' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setOrderType('general')}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    orderType === 'general' 
                      ? 'border-primary-500 bg-primary-500' 
                      : 'border-gray-300'
                  }`}>
                    {orderType === 'general' && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">Общий заказ</h4>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Создайте заказ, и мастера сами его возьмут
                </p>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  orderType === 'direct' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setOrderType('direct')}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    orderType === 'direct' 
                      ? 'border-primary-500 bg-primary-500' 
                      : 'border-gray-300'
                  }`}>
                    {orderType === 'direct' && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">Прямое бронирование</h4>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Выберите конкретного мастера и запишитесь на его время
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Информация о выбранном исполнителе для прямого бронирования */}
          {orderType === 'direct' && selectedExecutor && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Выбранный исполнитель
              </h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {selectedExecutor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">{selectedExecutor.name}</h3>
                  <p className="text-sm text-blue-700">
                    {selectedExecutor.executorProfile?.experience || 'Опыт не указан'}
                  </p>
                  {selectedExecutor.executorProfile?.rating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm text-blue-600">
                        {selectedExecutor.executorProfile.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Основная информация */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Основная информация
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Категория услуги */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория услуги *
                </label>
                <AutoCompleteSelect
                  options={categories}
                  value={selectedCategory}
                  onChange={handleCategorySelect}
                  placeholder="Начните вводить название услуги..."
                  searchPlaceholder="Поиск по категориям..."
                  className={errors.categoryId ? 'border-red-500' : ''}
                />
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                )}
                
                {/* Кнопка поиска исполнителей для прямого бронирования */}
                {orderType === 'direct' && selectedCategory && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Сохраняем данные формы в localStorage
                        localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory))
                        localStorage.setItem('orderFormData', JSON.stringify(formData))
                        // Переходим к поиску исполнителей
                        router.push(`/dashboard/client/search?category=${selectedCategory.id}`)
                      }}
                      className="w-full"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Найти исполнителей в категории "{selectedCategory.name}"
                    </Button>
                  </div>
                )}
              </div>

              {/* Описание услуги */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание услуги *
                </label>
                <textarea
                  value={formData.serviceDescription}
                  onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                  placeholder="Подробно опишите, что нужно сделать..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 ${
                    errors.serviceDescription ? 'border-red-500' : 'border-secondary-300'
                  }`}
                />
                {errors.serviceDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.serviceDescription}</p>
                )}
              </div>

              {/* Адрес */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Адрес *
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Укажите точный адрес"
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Контактная информация */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Контактная информация
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Ваше имя *
                </label>
                <Input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Иван Иванов"
                  className={errors.clientName ? 'border-red-500' : ''}
                />
                {errors.clientName && (
                  <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Телефон *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+375 (29) 123-45-67"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Время и дата */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600" />
              Время выполнения
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата *
                </label>
                <Input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  readOnly={orderType === 'direct' && !!localStorage.getItem('selectedDateTime')}
                  className={`${errors.orderDate ? 'border-red-500' : ''} ${
                    orderType === 'direct' && localStorage.getItem('selectedDateTime') 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : ''
                  }`}
                />
                {orderType === 'direct' && localStorage.getItem('selectedDateTime') && (
                  <div className="mt-1">
                    <p className="text-sm text-blue-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Время выбрано в календаре исполнителя
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        // Очищаем данные прямого бронирования
                        localStorage.removeItem('selectedDateTime')
                        localStorage.removeItem('selectedExecutor')
                        localStorage.removeItem('orderFormData')
                        localStorage.removeItem('selectedCategory')
                        localStorage.removeItem('serviceDescription')
                        
                        // Переключаемся на общий заказ
                        setOrderType('general')
                        setSelectedExecutor(null)
                        setSelectedCategory(null)
                        
                        // Очищаем поля времени
                        setFormData(prev => ({
                          ...prev,
                          orderDate: '',
                          orderTime: '',
                          serviceDescription: ''
                        }))
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
                    >
                      Создать обычный заказ вместо прямого бронирования
                    </button>
                  </div>
                )}
                {errors.orderDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.orderDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Время *
                </label>
                <Input
                  type="time"
                  value={formData.orderTime}
                  onChange={(e) => handleInputChange('orderTime', e.target.value)}
                  readOnly={orderType === 'direct' && !!localStorage.getItem('selectedDateTime')}
                  className={`${errors.orderTime ? 'border-red-500' : ''} ${
                    orderType === 'direct' && localStorage.getItem('selectedDateTime') 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : ''
                  }`}
                />
                {orderType === 'direct' && localStorage.getItem('selectedDateTime') && (
                  <div className="mt-1">
                    <p className="text-sm text-blue-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Время выбрано в календаре исполнителя
                    </p>
                  </div>
                )}
                {errors.orderTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.orderTime}</p>
                )}
              </div>

              {/* Кнопка для переключения типа заказа */}
              {orderType === 'direct' && localStorage.getItem('selectedDateTime') && (
                <div className="md:col-span-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-yellow-900">Время заблокировано</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Время было выбрано в календаре исполнителя. Если хотите создать обычный заказ, нажмите кнопку ниже.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Очищаем данные прямого бронирования
                          localStorage.removeItem('selectedDateTime')
                          localStorage.removeItem('selectedExecutor')
                          localStorage.removeItem('orderFormData')
                          localStorage.removeItem('selectedCategory')
                          localStorage.removeItem('serviceDescription')
                          
                          // Переключаемся на общий заказ
                          setOrderType('general')
                          setSelectedExecutor(null)
                          setSelectedCategory(null)
                          
                          // Очищаем поля времени
                          setFormData(prev => ({
                            ...prev,
                            orderDate: '',
                            orderTime: '',
                            serviceDescription: ''
                          }))
                        }}
                        className="ml-4"
                      >
                        Создать обычный заказ
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Предпочтительное время
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                >
                  <option value="any">Любое время</option>
                  <option value="morning">Утром (6:00-12:00)</option>
                  <option value="afternoon">Днем (12:00-18:00)</option>
                  <option value="evening">Вечером (18:00-22:00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Стоимость */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
              Стоимость услуги
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип ценообразования
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceType"
                      value="fixed"
                      checked={formData.priceType === 'fixed'}
                      onChange={(e) => handleInputChange('priceType', e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Фиксированная цена</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priceType"
                      value="negotiable"
                      checked={formData.priceType === 'negotiable'}
                      onChange={(e) => handleInputChange('priceType', e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">По договоренности</span>
                  </label>
                </div>
              </div>

              {formData.priceType === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стоимость (BYN) *
                  </label>
                  <Input
                    type="number"
                    value={formData.totalPrice}
                    onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                    placeholder="100.00"
                    min="0"
                    step="0.01"
                    className={errors.totalPrice ? 'border-red-500' : ''}
                  />
                  {errors.totalPrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.totalPrice}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Дополнительные параметры */}
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-primary-600" />
              Дополнительные параметры
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Срочность
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                >
                  <option value="low">Низкая</option>
                  <option value="medium">Средняя</option>
                  <option value="high">Высокая</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Примерная продолжительность (часы)
                </label>
                <Input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                  placeholder="2.5"
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Особые требования
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  placeholder="Дополнительные требования или пожелания..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительные заметки
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Любая дополнительная информация..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Кнопка отправки */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Создание заказа...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Создать заказ
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}



