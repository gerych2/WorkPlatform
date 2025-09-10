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
  Star
} from 'lucide-react'

export default function ClientProfile() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Форма редактирования
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
            setFormData({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              location: user.location || '',
            })
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
        fetchUserData(user)
      }
    })
  }, [router])

  // Загружаем отзывы когда пользователь загружен
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      fetchReviews()
    }
  }, [currentUser, isAuthenticated])

  const fetchUserData = async (user: any) => {
    try {
      const response = await fetch(`/api/users/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        const updatedUser = { ...user, ...data.user }
        setCurrentUser(updatedUser)
        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          location: updatedUser.location || '',
        })
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!currentUser) return
    
    setIsLoadingReviews(true)
    try {
      const response = await fetch(`/api/reviews?reviewedId=${currentUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Имя обязательно'
    if (!formData.email.trim()) newErrors.email = 'Email обязателен'
    if (!formData.phone.trim()) newErrors.phone = 'Телефон обязателен'
    if (!formData.location.trim()) newErrors.location = 'Местоположение обязательно'

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Некорректный формат email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(currentUser)).toString('base64')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        const updatedUser = { ...currentUser, ...data.user }
        setCurrentUser(updatedUser)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
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
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      location: currentUser.location || '',
    })
    setErrors({})
    setIsEditing(false)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gradient-to-r from-primary-500 to-secondary-600 rounded-2xl p-8 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10 flex items-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl mr-6">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Мой профиль
                  </h1>
                  <p className="text-white/80 text-lg">
                    Управляйте информацией о своем аккаунте
                  </p>
                  
                  {/* Рейтинг клиента */}
                  {currentUser.clientRating && Number(currentUser.clientRating) > 0 && (
                    <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <Star className="h-6 w-6 text-yellow-300 mr-2" />
                          <span className="text-2xl font-bold text-white">
                            {Number(currentUser.clientRating).toFixed(1)}
                          </span>
                          <span className="text-white/80 ml-2 text-lg">
                            ({currentUser.clientReviewsCount || 0} отзывов)
                          </span>
                        </div>
                      </div>
                      <p className="text-white/80 text-sm mt-1">
                        Ваш рейтинг как клиента
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Основная информация */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Основная информация
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
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-secondary-500 focus:border-secondary-500 focus:ring-secondary-500' : 'focus:border-primary-500 focus:ring-primary-500'}
                />
              ) : (
                <p className="text-gray-900 py-2">{currentUser.name || 'Не указано'}</p>
              )}
              {errors.name && <p className="text-secondary-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-secondary-500 focus:border-secondary-500 focus:ring-secondary-500' : 'focus:border-primary-500 focus:ring-primary-500'}
                />
              ) : (
                <p className="text-gray-900 py-2">{currentUser.email || 'Не указано'}</p>
              )}
              {errors.email && <p className="text-secondary-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-secondary-500 focus:border-secondary-500 focus:ring-secondary-500' : 'focus:border-primary-500 focus:ring-primary-500'}
                />
              ) : (
                <p className="text-gray-900 py-2">{currentUser.phone || 'Не указано'}</p>
              )}
              {errors.phone && <p className="text-secondary-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Местоположение
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={errors.location ? 'border-secondary-500 focus:border-secondary-500 focus:ring-secondary-500' : 'focus:border-primary-500 focus:ring-primary-500'}
                />
              ) : (
                <p className="text-gray-900 py-2">{currentUser.location || 'Не указано'}</p>
              )}
              {errors.location && <p className="text-secondary-500 text-sm mt-1">{errors.location}</p>}
            </div>

          </div>

          {isEditing && (
            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center hover:bg-primary-600 transition-all duration-200"
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

        {/* Статистика аккаунта */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
            Статистика аккаунта
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {currentUser.isVerified ? 'Верифицирован' : 'Не верифицирован'}
              </div>
              <p className="text-sm text-gray-600">Статус верификации</p>
            </div>

            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-600 mb-1">
                {new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}
              </div>
              <p className="text-sm text-gray-600">Дата регистрации</p>
            </div>

            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-600 mb-1">
                {currentUser.status === 'active' ? 'Активен' : 'Неактивен'}
              </div>
              <p className="text-sm text-gray-600">Статус аккаунта</p>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-primary-600" />
            Дополнительная информация
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-secondary-100">
              <span className="text-gray-600">Верификация</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                currentUser.isVerified 
                  ? 'bg-secondary-100 text-secondary-800' 
                  : 'bg-secondary-100 text-secondary-800'
              }`}>
                {currentUser.isVerified ? 'Верифицирован' : 'Не верифицирован'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-secondary-100">
              <span className="text-gray-600">Последний вход</span>
              <span className="text-gray-900">
                {currentUser.lastLogin 
                  ? new Date(currentUser.lastLogin).toLocaleDateString('ru-RU')
                  : 'Не указано'
                }
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Роль</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                Клиент
              </span>
            </div>
          </div>
        </div>

        {/* Отзывы о клиенте */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-8">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
            <Star className="h-5 w-5 mr-2 text-secondary-500" />
            Отзывы о вас
          </h2>

          {isLoadingReviews ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600 mr-2" />
              <span className="text-gray-600">Загрузка отзывов...</span>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                <div key={review.id} className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
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
                          {review.executor?.name || 'Исполнитель'}
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
                    <div className="bg-white rounded-md p-3 border border-primary-100">
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
  )
}