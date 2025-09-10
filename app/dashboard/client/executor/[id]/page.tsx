'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '../../../../../components/layout'
import { Button } from '../../../../../components/ui/Button'
import { 
  User, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Award
} from 'lucide-react'

interface ExecutorProfile {
  id: number
  description: string
  experience: string
  hourlyRate: number
  responseTime: string
  categories: number[]
  rating: number
  reviewsCount: number
  completedOrders: number
  user: {
    id: number
    name: string
    email: string
    phone: string
    location: string
    status: string
    createdAt: string
  }
}

interface Category {
  id: number
  name: string
}

interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  client: {
    id: number
    name: string
  }
  order: {
    id: number
    category: {
      name: string
    }
  }
}

export default function ExecutorProfileView() {
  const params = useParams()
  const router = useRouter()
  const executorId = params.id as string

  const [executorProfile, setExecutorProfile] = useState<ExecutorProfile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Получаем текущего пользователя
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    if (executorId) {
      fetchExecutorProfile()
      fetchCategories()
      fetchReviews()
    }
  }, [executorId])

  const fetchExecutorProfile = async () => {
    try {
      const response = await fetch(`/api/executor-profile?userId=${executorId}`)
      if (response.ok) {
        const data = await response.json()
        setExecutorProfile(data.profile)
      } else {
        console.error('Failed to fetch executor profile')
      }
    } catch (error) {
      console.error('Error fetching executor profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const fetchReviews = async () => {
    if (!executorId) return

    setIsLoadingReviews(true)
    try {
      const response = await fetch(`/api/reviews?reviewedId=${executorId}`)
      if (response.ok) {
        const data = await response.json()
        const reviewsData = data.reviews || []
        setReviews(reviewsData)
        
        // Обновляем рейтинг исполнителя на основе отзывов
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

  const handleBookExecutor = () => {
    if (executorProfile) {
      // Сохраняем выбранного исполнителя в localStorage
      localStorage.setItem('selectedExecutor', JSON.stringify({
        id: executorProfile.id,
        name: executorProfile.user.name,
        rating: executorProfile.rating,
        categories: executorProfile.categories.map(catId => getCategoryName(catId)),
        hourlyRate: executorProfile.hourlyRate,
        responseTime: executorProfile.responseTime
      }))
      
      // Перенаправляем на страницу выбора времени (сначала дата, потом время)
      router.push('/dashboard/client/select-time')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mr-3" />
          <span className="text-lg text-gray-600">Загрузка профиля...</span>
        </div>
      </div>
    )
  }

  if (!executorProfile) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Профиль не найден</h1>
            <p className="text-gray-600 mb-6">Исполнитель с таким ID не существует</p>
            <Button onClick={() => router.push('/dashboard/client/search')}>
              Вернуться к поиску
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Кнопка назад */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок и рейтинг */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {executorProfile.user.name}
                  </h1>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(executorProfile.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill={i < Math.floor(executorProfile.rating) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {typeof executorProfile.rating === 'number' ? executorProfile.rating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-gray-600 ml-2">
                      ({executorProfile.reviewsCount} отзывов)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{executorProfile.user.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {executorProfile.hourlyRate} ₽/час
                  </div>
                  <div className="text-sm text-gray-500">Почасовая оплата</div>
                </div>
              </div>
            </div>

            {/* О мастере */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                О мастере
              </h2>
              {executorProfile.description ? (
                <p className="text-gray-700 leading-relaxed mb-4">
                  {executorProfile.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">Мастер не добавил описание</p>
              )}
              
              {executorProfile.experience && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Опыт работы:</h3>
                  <p className="text-gray-700">{executorProfile.experience}</p>
                </div>
              )}
            </div>

            {/* Категории услуг */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary-600" />
                Категории услуг
              </h2>
              <div className="flex flex-wrap gap-2">
                {executorProfile.categories.map((categoryId) => (
                  <span
                    key={categoryId}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {getCategoryName(categoryId)}
                  </span>
                ))}
              </div>
            </div>

            {/* Отзывы */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Отзывы клиентов
              </h2>
              
              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600 mr-2" />
                  <span className="text-gray-600">Загрузка отзывов...</span>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex items-center mr-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill={i < review.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">
                            {review.client.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-2">{review.comment}</p>
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
                  <p className="text-gray-500">Пока нет отзывов</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Отзывы появятся после завершения заказов
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статистика */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary-600" />
                Статистика
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Рейтинг</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="font-semibold">
                      {typeof executorProfile.rating === 'number' ? executorProfile.rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Отзывы</span>
                  <span className="font-semibold">{executorProfile.reviewsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Заказов выполнено</span>
                  <span className="font-semibold">{executorProfile.completedOrders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Время ответа</span>
                  <span className="font-semibold">{getResponseTimeText(executorProfile.responseTime)}</span>
                </div>
              </div>
            </div>

            {/* Местоположение */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Местоположение
              </h3>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">{executorProfile.user.location}</span>
              </div>
            </div>

            {/* Кнопка бронирования */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {executorProfile.hourlyRate} ₽/час
                </div>
                <div className="text-sm text-gray-500 mb-4">Почасовая оплата</div>
                <Button
                  onClick={handleBookExecutor}
                  className="w-full py-3 text-lg font-semibold"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Забронировать время
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Сначала выберите дату, затем время
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
