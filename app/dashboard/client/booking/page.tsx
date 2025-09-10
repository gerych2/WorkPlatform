'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { AutoCompleteSelect } from '../../../../components/ui/AutoCompleteSelect'
import { Notification } from '../../../../components/ui/Notification'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  DollarSign,
  Zap,
  Clock3,
  X
} from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string
  icon?: string
}

export default function CreateOrder() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Форма заказа
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

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
        fetchCategories()
        // Заполняем данные пользователя
        setFormData(prev => ({
          ...prev,
          clientName: user.name || '',
          phone: user.phone || '',
          address: user.location || ''
        }))
        
        // Проверяем, был ли выбран исполнитель
        const selectedExecutor = localStorage.getItem('selectedExecutor')
        if (selectedExecutor) {
          try {
            const executor = JSON.parse(selectedExecutor)
            // Автозаполняем категорию на основе специализации исполнителя
            if (executor.executorProfile && executor.executorProfile.categories && executor.executorProfile.categories.length > 0) {
              setFormData(prev => ({
                ...prev,
                categoryId: executor.executorProfile.categories[0].toString()
              }))
            }
          } catch (error) {
            console.error('Error parsing selected executor:', error)
          }
        }

        // Проверяем, было ли выбрано время
        const selectedDateTime = localStorage.getItem('selectedDateTime')
        if (selectedDateTime) {
          try {
            const dateTime = JSON.parse(selectedDateTime)
            setFormData(prev => ({
              ...prev,
              orderDate: dateTime.date,
              orderTime: dateTime.time
            }))
          } catch (error) {
            console.error('Error parsing selected date time:', error)
          }
        }

        // Проверяем, было ли введено описание услуги
        const serviceDescription = localStorage.getItem('serviceDescription')
        if (serviceDescription) {
          setFormData(prev => ({
            ...prev,
            serviceDescription: serviceDescription
          }))
        }
      }
    })
  }, [router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const categoriesData = await response.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.categoryId) newErrors.categoryId = 'Выберите категорию'
    if (!formData.serviceDescription.trim()) newErrors.serviceDescription = 'Опишите задачу'
    if (!formData.address.trim()) newErrors.address = 'Укажите адрес'
    if (!formData.phone.trim()) newErrors.phone = 'Укажите телефон'
    if (!formData.clientName.trim()) newErrors.clientName = 'Укажите имя'
    if (!formData.orderDate) newErrors.orderDate = 'Выберите дату'
    if (!formData.orderTime) newErrors.orderTime = 'Выберите время'
    if (formData.priceType === 'fixed' && (!formData.totalPrice || parseFloat(formData.totalPrice) <= 0)) {
      newErrors.totalPrice = 'Укажите корректную стоимость'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Получаем выбранного исполнителя из localStorage
      const selectedExecutor = localStorage.getItem('selectedExecutor')
      let executorId = null
      
      if (selectedExecutor) {
        try {
          const executor = JSON.parse(selectedExecutor)
          executorId = executor.id
        } catch (error) {
          console.error('Error parsing selected executor:', error)
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(currentUser)).toString('base64')}`
        },
        body: JSON.stringify({
          ...formData,
          totalPrice: formData.priceType === 'fixed' ? formData.totalPrice : null,
          executorId: executorId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка создания заказа')
      }

      const result = await response.json()
      
      if (result.executorId) {
        showNotification('success', 'Заказ успешно создан! Уведомление отправлено выбранному исполнителю.')
      } else {
        showNotification('success', 'Заказ успешно создан! Уведомления отправлены всем исполнителям в категории.')
      }
      
      // Очищаем выбранного исполнителя из localStorage
      localStorage.removeItem('selectedExecutor')
      localStorage.removeItem('selectedDateTime')
      localStorage.removeItem('serviceDescription')
      
      // Перенаправляем на страницу заказов
      router.push('/dashboard/client/orders')

    } catch (error) {
      console.error('Error creating order:', error)
      showNotification('error', error instanceof Error ? error.message : 'Произошла ошибка при создании заказа')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategorySelect = (option: Category | null) => {
    setSelectedCategory(option)
    setFormData(prev => ({ 
      ...prev, 
      categoryId: option ? option.id.toString() : '' 
    }))
    if (errors.categoryId) {
      setErrors(prev => ({ ...prev, categoryId: '' }))
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-secondary-600 bg-secondary-100'
      case 'medium': return 'text-secondary-600 bg-secondary-100'
      case 'high': return 'text-secondary-600 bg-secondary-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'Низкая'
      case 'medium': return 'Средняя'
      case 'high': return 'Высокая'
      default: return 'Средняя'
    }
  }

  const getPreferredTimeText = (time: string) => {
    switch (time) {
      case 'morning': return 'Утро (8:00 - 12:00)'
      case 'afternoon': return 'День (12:00 - 17:00)'
      case 'evening': return 'Вечер (17:00 - 21:00)'
      case 'any': return 'Любое время'
      default: return 'Любое время'
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
      
      {/* Уведомления */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Создать новый заказ
          </h1>
          <p className="text-gray-600">
            Опишите вашу задачу и найдите подходящего мастера
          </p>
        </div>

        {/* Форма создания заказа */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div className="border-b border-secondary-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Основная информация
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория услуги *
                  </label>
                  <AutoCompleteSelect
                    options={categories}
                    value={selectedCategory}
                    onChange={handleCategorySelect}
                    placeholder="Начните вводить название услуги..."
                    searchPlaceholder="Поиск по категориям..."
                    className={errors.categoryId ? 'border-secondary-500' : ''}
                  />
                  {errors.categoryId && (
                    <p className="text-secondary-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срочность
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((urgency) => (
                      <button
                        key={urgency}
                        type="button"
                        onClick={() => handleInputChange('urgency', urgency)}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.urgency === urgency
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-secondary-300 hover:border-secondary-400'
                        }`}
                      >
                        <Zap className="h-4 w-4 mx-auto mb-1" />
                        {getUrgencyText(urgency)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание задачи *
                </label>
                <textarea
                  value={formData.serviceDescription}
                  onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                  placeholder="Подробно опишите, что нужно сделать..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    errors.serviceDescription 
                      ? 'border-secondary-500 focus:border-secondary-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                  }`}
                />
                {errors.serviceDescription && (
                  <p className="text-secondary-500 text-sm mt-1 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.serviceDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Контактная информация */}
            <div className="border-b border-secondary-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary-600" />
                Контактная информация
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя *
                  </label>
                  <Input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Имя и фамилия"
                    className={errors.clientName ? 'border-secondary-500' : ''}
                  />
                  {errors.clientName && (
                    <p className="text-secondary-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.clientName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+375 (29) 123-45-67"
                    className={errors.phone ? 'border-secondary-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-secondary-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес *
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Полный адрес выполнения работ"
                    className={errors.address ? 'border-secondary-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-secondary-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Время и стоимость */}
            <div className="border-b border-secondary-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                Время и стоимость
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата выполнения *
                  </label>
                  <Input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => handleInputChange('orderDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.orderDate ? 'border-secondary-500' : ''}
                    readOnly={!!localStorage.getItem('selectedDateTime')}
                  />
                  {localStorage.getItem('selectedDateTime') && (
                    <p className="text-primary-600 text-sm mt-1 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Время выбрано в календаре исполнителя
                    </p>
                  )}
                  {errors.orderDate && (
                    <p className="text-secondary-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.orderDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время выполнения *
                  </label>
                  <Input
                    type="time"
                    value={formData.orderTime}
                    onChange={(e) => handleInputChange('orderTime', e.target.value)}
                    className={errors.orderTime ? 'border-secondary-500' : ''}
                    readOnly={!!localStorage.getItem('selectedDateTime')}
                  />
                  {localStorage.getItem('selectedDateTime') && (
                    <p className="text-primary-600 text-sm mt-1 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Время выбрано в календаре исполнителя
                    </p>
                  )}
                  {errors.orderTime && (
                    <p className="text-secondary-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.orderTime}
                    </p>
                  )}
                </div>

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
                    <option value="morning">Утро (8:00 - 12:00)</option>
                    <option value="afternoon">День (12:00 - 17:00)</option>
                    <option value="evening">Вечер (17:00 - 21:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Предполагаемая продолжительность (часы)
                  </label>
                  <Input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                    placeholder="2.5"
                    min="0.5"
                    step="0.5"
                    className="border-secondary-300"
                  />
                </div>

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
              </div>

              {formData.priceType === 'fixed' && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стоимость (BYN) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.totalPrice}
                      onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                      placeholder="100"
                      min="1"
                      step="0.01"
                      className={`pl-10 ${errors.totalPrice ? 'border-secondary-500' : 'border-secondary-300'}`}
                    />
                  </div>
                  {errors.totalPrice && (
                    <p className="text-secondary-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.totalPrice}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Дополнительная информация */}
            <div className="pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-primary-600" />
                Дополнительная информация
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дополнительные заметки
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Дополнительная информация, которая может быть полезна исполнителю..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Особые требования
                  </label>
                  <textarea
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    placeholder="Особые требования к исполнителю или условиям работы..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-between pt-6 border-t border-secondary-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/client')}
                className="px-8"
              >
                Отмена
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Создание заказа...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Создать заказ
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 