'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { FileUpload } from '../../../components/ui/FileUpload'
import { User, Shield, Building, UserCheck, Upload, AlertCircle, UserPlus } from 'lucide-react'


export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'executor',
    legalStatus: '' as 'ИП' | 'Юр. лицо' | 'Самозанятый' | '',
    location: '',
    description: '',
    experience: '',
    hourlyRate: '',
    categories: [] as string[],
    documents: [] as File[],
    referralCode: '' // Добавляем поле для реферального кода
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Получаем категории для выбора
  const [categories, setCategories] = useState<any[]>([])

  // Загружаем категории при монтировании компонента
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Загружаем категории...')
        const response = await fetch('/api/categories')
        if (response.ok) {
          const cats = await response.json()
          console.log('Получены категории:', cats)
          setCategories(cats)
        } else {
          console.error('Ошибка загрузки категорий:', response.statusText)
          setCategories([])
        }
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error)
        setCategories([])
      }
    }
    loadCategories()
  }, [])

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Имя обязательно'
      if (!formData.email.trim()) newErrors.email = 'Email обязателен'
      if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен'
      if (!formData.location.trim()) newErrors.location = 'Местоположение обязательно'
      if (!formData.password.trim()) newErrors.password = 'Пароль обязателен'
      if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Подтвердите пароль'
      
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Неверный формат email'
      }
      
      if (formData.phone && !/^\+375\s\(\d{2}\)\s\d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
        newErrors.phone = 'Формат: +375 (XX) XXX-XX-XX'
      }

      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Пароль должен содержать минимум 6 символов'
      }

      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают'
      }
    }

    if (currentStep === 2 && formData.role === 'executor') {
      if (!formData.legalStatus) newErrors.legalStatus = 'Выберите правовой статус'
      if (!formData.description.trim()) newErrors.description = 'Описание обязательно'
      if (!formData.experience.trim()) newErrors.experience = 'Опыт работы обязателен'
      if (!formData.hourlyRate.trim()) newErrors.hourlyRate = 'Почасовая ставка обязательна'
      if (formData.categories.length === 0) newErrors.categories = 'Выберите хотя бы одну категорию'
      if (formData.categories.length > 3) newErrors.categories = 'Можно выбрать максимум 3 категории'
      if (formData.documents.length === 0) newErrors.documents = 'Загрузите необходимые документы'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleInputChange = (field: string, value: string | string[] | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      if (prev.categories.includes(categoryId)) {
        // Убираем категорию
        return {
          ...prev,
          categories: prev.categories.filter(id => id !== categoryId)
        }
      } else {
        // Добавляем категорию, но не больше 3
        if (prev.categories.length >= 3) {
          setErrors(prevErrors => ({
            ...prevErrors,
            categories: 'Можно выбрать максимум 3 категории'
          }))
          return prev
        }
        return {
          ...prev,
          categories: [...prev.categories, categoryId]
        }
      }
    })
    
    // Очищаем ошибку при изменении
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: '' }))
    }
  }

  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({ ...prev, documents: files }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return

    setIsLoading(true)

    try {
      // Подготавливаем данные для регистрации
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        location: formData.location,
        legalStatus: formData.legalStatus as 'ИП' | 'Юр. лицо' | 'Самозанятый',
        referralCode: formData.referralCode, // Добавляем реферальный код
        profile: formData.role === 'executor' ? {
          description: formData.description,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          categories: formData.categories,
          workingHours: {},
          responseTime: '24 часа'
        } : undefined
      }

      // Регистрируем пользователя через API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка создания пользователя')
      }

      const result = await response.json()
      const newUser = result.user

      if (!newUser) {
        throw new Error('Ошибка создания пользователя')
      }

      // Очищаем старые данные и сохраняем нового пользователя
      localStorage.removeItem('currentUser')
      localStorage.removeItem('adminAuth')
      
      // Добавляем время регистрации
      const userWithRegistrationTime = {
        ...newUser,
        registrationTime: new Date().toISOString()
      }
      
      localStorage.setItem('currentUser', JSON.stringify(userWithRegistrationTime))

      // Показываем уведомление об успехе
      let successMessage = result.message || 'Регистрация успешна!'
      
      // Добавляем информацию о реферальном коде, если он был применен
      if (result.referral && result.referral.success) {
        successMessage += `\n\n🎉 Реферальный код применен! Вы получили бонусы: ${result.referral.rewards?.xp || 0} XP`
      } else if (result.referral && !result.referral.success) {
        successMessage += `\n\n⚠️ Реферальный код не найден или недействителен`
      }
      
      alert(successMessage)

      // Перенаправляем в соответствующий кабинет
      if (formData.role === 'client') {
        router.push('/dashboard/client')
      } else if (formData.role === 'executor') {
        router.push('/dashboard/executor')
      } else {
        router.push('/dashboard/admin')
      }

    } catch (error) {
      console.error('Ошибка регистрации:', error)
      alert(error instanceof Error ? error.message : 'Произошла ошибка при регистрации. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 0) return ''
    if (numbers.length <= 3) return `+${numbers}`
    if (numbers.length <= 5) return `+${numbers.slice(0, 3)} (${numbers.slice(3)}`
    if (numbers.length <= 8) return `+${numbers.slice(0, 3)} (${numbers.slice(3, 5)}) ${numbers.slice(5)}`
    return `+${numbers.slice(0, 3)} (${numbers.slice(3, 5)}) ${numbers.slice(5, 8)}-${numbers.slice(8, 10)}-${numbers.slice(10, 12)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-secondary-100 to-secondary-200 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <UserPlus className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-4">
            Регистрация в ProDoAgency
          </h1>
          <p className="text-xl text-gray-600">
            Присоединяйтесь к сообществу профессионалов и клиентов
          </p>
        </div>

        {/* Форма регистрации */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-secondary-200">
          {/* Прогресс-бар */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className={`flex items-center space-x-3 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 1 ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                }`}>
                  1
                </div>
                <span className="text-sm font-semibold">Основная информация</span>
              </div>
              
              <div className={`flex items-center space-x-3 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step >= 2 ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                }`}>
                  2
                </div>
                <span className="text-sm font-semibold">
                  {formData.role === 'executor' ? 'Профессиональная информация' : 'Завершение'}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-600 to-primary-700 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(step / (formData.role === 'executor' ? 2 : 1)) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Шаг 1: Основная информация */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Выбор роли */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    Выберите вашу роль
                  </label>
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      type="button"
                      onClick={() => handleInputChange('role', 'client')}
                      className={`p-6 border-2 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                        formData.role === 'client'
                          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50 text-primary-700 shadow-lg'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-lg mb-1">Клиент</div>
                      <div className="text-sm text-gray-600">Ищу услуги</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleInputChange('role', 'executor')}
                      className={`p-6 border-2 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                        formData.role === 'executor'
                          ? 'border-secondary-500 bg-gradient-to-br from-secondary-50 to-secondary-100 text-secondary-700 shadow-lg'
                          : 'border-gray-200 hover:border-secondary-300 hover:bg-secondary-50'
                      }`}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-secondary-600 to-secondary-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <div className="font-semibold text-lg mb-1">Исполнитель</div>
                      <div className="text-sm text-gray-600">Предоставляю услуги</div>
                    </button>
                  </div>
                </div>

                {/* Основные поля */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                      Имя и фамилия
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                                             placeholder="Ваше имя"
                      className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.name ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                      Email адрес
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                                             placeholder="your@email.com"
                      className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.email ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                      Телефон
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                      placeholder="+375 (29) 123-45-67"
                      className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                                     <div>
                     <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-3">
                       Местоположение
                     </label>
                     <Input
                       id="location"
                       type="text"
                       value={formData.location}
                       onChange={(e) => handleInputChange('location', e.target.value)}
                       placeholder="Минск, Центральный район"
                       className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                         errors.location ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                       }`}
                     />
                     {errors.location && (
                       <p className="text-red-500 text-sm mt-2 flex items-center">
                         <AlertCircle className="h-4 w-4 mr-2" />
                         {errors.location}
                       </p>
                     )}
                   </div>

                   <div>
                     <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                       Пароль
                     </label>
                     <Input
                       id="password"
                       type="password"
                       value={formData.password}
                       onChange={(e) => handleInputChange('password', e.target.value)}
                       placeholder="Минимум 6 символов"
                       autoComplete="off"
                       className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 no-password-icon ${
                         errors.password ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                       }`}
                     />
                     {errors.password && (
                       <p className="text-red-500 text-sm mt-2 flex items-center">
                         <AlertCircle className="h-4 w-4 mr-2" />
                         {errors.password}
                       </p>
                     )}
                   </div>

                   <div>
                     <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                       Подтвердите пароль
                     </label>
                     <Input
                       id="confirmPassword"
                       type="password"
                       value={formData.confirmPassword}
                       onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                       placeholder="Повторите пароль"
                       autoComplete="off"
                       className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 no-password-icon ${
                         errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                       }`}
                     />
                     {errors.confirmPassword && (
                       <p className="text-red-500 text-sm mt-2 flex items-center">
                         <AlertCircle className="h-4 w-4 mr-2" />
                         {errors.confirmPassword}
                       </p>
                     )}
                   </div>

                   {/* Поле реферального кода */}
                   <div>
                     <label htmlFor="referralCode" className="block text-sm font-semibold text-gray-700 mb-3">
                       Реферальный код друга <span className="text-gray-500 font-normal">(необязательно)</span>
                     </label>
                     <Input
                       id="referralCode"
                       type="text"
                       value={formData.referralCode}
                       onChange={(e) => handleInputChange('referralCode', e.target.value)}
                       placeholder="Введите код друга для получения бонусов"
                       autoComplete="off"
                       className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                         errors.referralCode ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                       }`}
                     />
                     {errors.referralCode && (
                       <p className="text-red-500 text-sm mt-2 flex items-center">
                         <AlertCircle className="h-4 w-4 mr-2" />
                         {errors.referralCode}
                       </p>
                     )}
                     <p className="text-gray-600 text-sm mt-2">
                       💡 Получите бонусы за регистрацию по коду друга!
                     </p>
                   </div>
                 </div>

                <div className="flex justify-end pt-4">
                                     <Button
                     type="button"
                     onClick={handleNext}
                     disabled={!formData.name || !formData.email || !formData.phone || !formData.location || !formData.password || !formData.confirmPassword}
                     className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                   >
                    <div className="flex items-center space-x-2">
                      <span>Продолжить</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* Шаг 2: Профессиональная информация (только для исполнителей) */}
            {step === 2 && formData.role === 'executor' && (
              <div className="space-y-6">
                {/* Правовой статус */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-4">
                    Правовой статус
                  </label>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { value: 'ИП', label: 'ИП', icon: Building, description: 'Индивидуальный предприниматель', color: 'primary' },
                      { value: 'Юр. лицо', label: 'Юр. лицо', icon: Building, description: 'Юридическое лицо', color: 'secondary' },
                      { value: 'Самозанятый', label: 'Самозанятый', icon: UserCheck, description: 'Самозанятый', color: 'primary' }
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('legalStatus', option.value as 'ИП' | 'Юр. лицо' | 'Самозанятый')}
                        className={`p-6 border-2 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                          formData.legalStatus === option.value
                            ? `border-${option.color}-500 bg-gradient-to-br from-${option.color}-50 to-${option.color}-100 text-${option.color}-700 shadow-lg`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br from-${option.color}-600 to-${option.color}-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md`}>
                          <option.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="font-semibold text-lg mb-1">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </button>
                    ))}
                  </div>
                  {errors.legalStatus && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.legalStatus}
                    </p>
                  )}
                </div>

                {/* Профессиональные поля */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Описание услуг
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Опишите, какие услуги вы предоставляете..."
                      rows={3}
                      className={`w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Опыт работы
                    </label>
                    <Input
                      id="experience"
                      type="text"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="5 лет в сфере электрики"
                      className={errors.experience ? 'border-red-500' : ''}
                    />
                    {errors.experience && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                      Почасовая ставка (BYN)
                    </label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      placeholder="25"
                      min="0"
                      step="0.01"
                      className={errors.hourlyRate ? 'border-red-500' : ''}
                    />
                    {errors.hourlyRate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.hourlyRate}
                      </p>
                    )}
                  </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Категории услуг ({formData.categories.length}/3)
                     </label>
                     {categories.length > 0 ? (
                       <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                         {categories.map(category => {
                           const isSelected = formData.categories.includes(category.id)
                           const isDisabled = !isSelected && formData.categories.length >= 3
                           
                           return (
                             <label key={category.id} className={`flex items-center space-x-2 ${isDisabled ? 'opacity-50' : ''}`}>
                               <input
                                 type="checkbox"
                                 checked={isSelected}
                                 onChange={() => handleCategoryToggle(category.id)}
                                 disabled={isDisabled}
                                 className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                               />
                               <span className="text-sm">{category.name}</span>
                             </label>
                           )
                         })}
                       </div>
                     ) : (
                       <div className="text-gray-500 text-sm py-2">
                         Загрузка категорий... {categories.length === 0 && 'Категории не загружены'}
                       </div>
                     )}
                     {errors.categories && (
                       <p className="text-red-500 text-sm mt-1 flex items-center">
                         <AlertCircle className="h-4 w-4 mr-1" />
                         {errors.categories}
                       </p>
                     )}
                   </div>
                </div>

                {/* Загрузка документов */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Загрузка документов
                  </label>
                  <FileUpload
                    label=""
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    value={formData.documents}
                    onChange={handleFileUpload}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Загрузите документы в зависимости от вашего правового статуса:
                  </p>
                  <ul className="text-sm text-gray-500 mt-1 space-y-1">
                    <li>• ИП: Свидетельство ИП, справка о регистрации</li>
                    <li>• Юр. лицо: Свидетельство о регистрации, устав</li>
                    <li>• Самозанятый: Справка о самозанятости</li>
                  </ul>
                  {errors.documents && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.documents}
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="px-8 py-3 border-2 border-secondary-300 text-gray-700 hover:border-secondary-400 hover:bg-secondary-50 font-semibold rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span>←</span>
                      <span>Назад</span>
                    </div>
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Регистрация...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5" />
                        <span>Завершить регистрацию</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Шаг 2: Завершение (для клиентов) */}
            {step === 2 && formData.role === 'client' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Готово к регистрации!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Проверьте введенные данные и завершите регистрацию
                  </p>
                  
                  <div className="bg-secondary-50 rounded-lg p-4 text-left">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Имя:</span>
                        <p className="text-gray-900">{formData.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Телефон:</span>
                        <p className="text-gray-900">{formData.phone}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Местоположение:</span>
                        <p className="text-gray-900">{formData.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="px-8 py-3 border-2 border-secondary-300 text-gray-700 hover:border-secondary-400 hover:bg-secondary-50 font-semibold rounded-xl transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span>←</span>
                      <span>Назад</span>
                    </div>
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Регистрация...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5" />
                        <span>Завершить регистрацию</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Ссылка на вход */}
        <div className="mt-8 text-center">
          <div className="p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200">
            <p className="text-gray-600 text-lg">
              Уже есть аккаунт?{' '}
              <a 
                href="/auth/login" 
                className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-4 hover:decoration-primary-400 transition-all duration-200"
              >
                Войти в систему
              </a>
            </p>
          </div>
        </div>
        
        {/* Кнопка выхода */}
        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              localStorage.removeItem('currentUser')
              localStorage.removeItem('adminAuth')
              window.location.reload()
            }}
            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            🚪 Выйти из системы
          </button>
        </div>
      </div>
    </div>
  )
}