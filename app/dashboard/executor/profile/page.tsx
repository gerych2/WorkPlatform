'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Loader2,
  Edit3,
  CheckCircle,
  AlertCircle,
  Star,
  Clock,
  DollarSign,
  Briefcase,
  Award,
  Upload
} from 'lucide-react'

interface ExecutorProfile {
  id: number
  description: string
  experience: string
  hourlyRate: number | null
  rating: number
  reviewsCount: number
  completedOrders: number
  responseTime: string
  categories: number[]
  workingHours: any
  isVerified: boolean
  verificationStatus: string
}

interface Category {
  id: number
  name: string
  description: string
}

export default function ExecutorProfile() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [executorProfile, setExecutorProfile] = useState<ExecutorProfile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Форма редактирования
  const [formData, setFormData] = useState({
    description: '',
    experience: '',
    hourlyRate: '',
    responseTime: '24 часа',
    categories: [] as number[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Проверяем аутентификацию
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const user = JSON.parse(userStr)
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
        fetchData(user)
        // Загружаем отзывы после установки currentUser
        setTimeout(() => fetchReviews(), 100)
      }
    })
  }, [router])

  // Загружаем отзывы когда currentUser установлен
  useEffect(() => {
    if (currentUser?.id && isAuthenticated) {
      fetchReviews()
    }
  }, [currentUser, isAuthenticated])

  const fetchData = async (user: any) => {
    try {
      const [profileResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/executor-profile?userId=${user.id}`),
        fetch('/api/categories')
      ])

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setExecutorProfile(profileData.profile)
        setFormData({
          description: profileData.profile.description || '',
          experience: profileData.profile.experience || '',
          hourlyRate: profileData.profile.hourlyRate?.toString() || '',
          responseTime: profileData.profile.responseTime || '24 часа',
          categories: profileData.profile.categories || []
        })
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) newErrors.description = 'Описание обязательно'
    if (!formData.experience.trim()) newErrors.experience = 'Опыт обязателен'
    if (formData.categories.length === 0) newErrors.categories = 'Выберите хотя бы одну категорию'

    if (formData.hourlyRate && isNaN(Number(formData.hourlyRate))) {
      newErrors.hourlyRate = 'Ставка должна быть числом'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/executor-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(currentUser)).toString('base64')}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          ...formData,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setExecutorProfile(data.profile)
        setIsEditing(false)
        alert('Профиль успешно обновлен!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Ошибка при обновлении профиля')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Произошла ошибка при обновлении профиля')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (executorProfile) {
      setFormData({
        description: executorProfile.description || '',
        experience: executorProfile.experience || '',
        hourlyRate: executorProfile.hourlyRate?.toString() || '',
        responseTime: executorProfile.responseTime || '24 часа',
        categories: executorProfile.categories || []
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  const toggleCategory = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : 'Неизвестная категория'
  }

  const getResponseTimeText = (responseTime: string) => {
    const timeMap: { [key: string]: string } = {
      'fast': 'Быстро',
      'medium': 'Средне',
      'slow': 'Медленно',
      '24 часа': '24 часа',
      '1 час': '1 час',
      '2 часа': '2 часа',
      '4 часа': '4 часа',
      '8 часов': '8 часов',
      '12 часов': '12 часов'
    }
    return timeMap[responseTime] || responseTime
  }

  const fetchReviews = async () => {
    if (!currentUser?.id) return

    setIsLoadingReviews(true)
    try {
      const response = await fetch(`/api/reviews?reviewedId=${currentUser.id}`)
      
      if (response.ok) {
        const data = await response.json()
        const reviewsData = data.reviews || []
        setReviews(reviewsData)
        
        // Обновляем рейтинг исполнителя
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0)
          const averageRating = totalRating / reviewsData.length
          
          setExecutorProfile(prev => prev ? {
            ...prev,
            rating: averageRating,
            reviewsCount: reviewsData.length
          } : null)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoadingReviews(false)
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
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gradient-to-r from-primary-500 to-secondary-600 rounded-2xl p-8 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10 flex items-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl mr-6">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Мой профиль
                  </h1>
                  <p className="text-white/80 text-lg">
                    Управляйте информацией о своих услугах и настройте профиль
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-8">
            {/* Личная информация */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600" />
                  Личная информация
                </h2>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="flex items-center hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя и фамилия
                  </label>
                  <p className="text-gray-900 py-2">{currentUser.name || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 py-2">{currentUser.email || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <p className="text-gray-900 py-2">{currentUser.phone || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Местоположение
                  </label>
                  <p className="text-gray-900 py-2">{currentUser.location || 'Не указано'}</p>
                </div>
              </div>
            </div>

            {/* Профессиональная информация */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
                Профессиональная информация
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание услуг *
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        errors.description 
                          ? 'border-secondary-500 focus:border-secondary-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                      }`}
                      placeholder="Расскажите о себе и своих услугах..."
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {executorProfile?.description || 'Не указано'}
                    </p>
                  )}
                  {errors.description && <p className="text-secondary-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Опыт работы *
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="5 лет"
                        className={errors.experience ? 'border-secondary-500' : ''}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {executorProfile?.experience || 'Не указано'}
                      </p>
                    )}
                    {errors.experience && <p className="text-secondary-500 text-sm mt-1">{errors.experience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ставка за час (BYN)
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                        placeholder="50"
                        min="0"
                        step="0.01"
                        className={errors.hourlyRate ? 'border-secondary-500' : ''}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {executorProfile?.hourlyRate ? `${executorProfile.hourlyRate} BYN/час` : 'Не указана'}
                      </p>
                    )}
                    {errors.hourlyRate && <p className="text-secondary-500 text-sm mt-1">{errors.hourlyRate}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время ответа
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.responseTime}
                      onChange={(e) => handleInputChange('responseTime', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    >
                      <option value="1 час">1 час</option>
                      <option value="2 часа">2 часа</option>
                      <option value="4 часа">4 часа</option>
                      <option value="8 часов">8 часов</option>
                      <option value="24 часа">24 часа</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">
                      {getResponseTimeText(executorProfile?.responseTime || '24 часа')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категории услуг *
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            formData.categories.includes(category.id)
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-300 hover:border-secondary-400'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {executorProfile?.categories.map((categoryId) => (
                        <span
                          key={categoryId}
                          className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                        >
                          {getCategoryName(categoryId)}
                        </span>
                      ))}
                    </div>
                  )}
                  {errors.categories && <p className="text-secondary-500 text-sm mt-1">{errors.categories}</p>}
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 mt-6 pt-6 border-t border-secondary-200">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="hover:bg-secondary-50 hover:border-secondary-300 transition-all duration-200"
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-8">
            {/* Статистика */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary-600" />
                Статистика
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Рейтинг</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-secondary-400 mr-1" />
                    <span className="font-semibold">
                      {executorProfile?.rating ? Number(executorProfile.rating).toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Отзывы</span>
                  <span className="font-semibold">{executorProfile?.reviewsCount || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Заказов выполнено</span>
                  <span className="font-semibold">{executorProfile?.completedOrders || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Время ответа</span>
                  <span className="font-semibold">{getResponseTimeText(executorProfile?.responseTime || '24 часа')}</span>
                </div>
              </div>
            </div>

            {/* Статус верификации */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
                Верификация
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Статус</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    executorProfile?.isVerified 
                      ? 'bg-secondary-100 text-secondary-800' 
                      : 'bg-secondary-100 text-secondary-800'
                  }`}>
                    {executorProfile?.isVerified ? 'Верифицирован' : 'На проверке'}
                  </span>
                </div>

                {!executorProfile?.isVerified && (
                  <div className="mt-4 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                    <p className="text-sm text-secondary-800">
                      Ваш профиль находится на проверке. После верификации вы сможете получать больше заказов.
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* Отзывы о исполнителе */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-secondary-500" />
                Отзывы о вас
              </h3>
              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600 mr-2" />
                  <span className="text-gray-600">Загрузка отзывов...</span>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                    <div key={review.id} className="bg-gradient-to-r from-secondary-50 to-secondary-50 border border-secondary-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex items-center mr-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-secondary-400' : 'text-gray-300'
                                }`}
                                fill={i < review.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-gray-900 text-base block truncate">
                              {review.client?.name || 'Клиент'}
                            </span>
                            <div className="text-xs text-gray-600 truncate">
                              {review.order?.category?.name || 'Услуга'}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      {review.comment && (
                        <div className="bg-white rounded-md p-3 border border-secondary-100">
                          <p className="text-gray-800 text-sm leading-relaxed italic break-words">
                            "{review.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {reviews.length > 3 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
                      >
                        {showAllReviews ? (
                          <>
                            <span>Скрыть отзывы</span>
                            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Показать все отзывы ({reviews.length})</span>
                            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Пока нет отзывов о вас</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Отзывы появятся после завершения заказов
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}