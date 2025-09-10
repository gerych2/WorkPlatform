'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { AutoCompleteSelect } from '../../../../components/ui/AutoCompleteSelect'
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  User, 
  Filter,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Executor {
  id: number
  name: string
  email: string
  phone: string
  location: string
  status: string
  isVerified: boolean
  executorProfile: {
    id: number
    description: string
    experience: string
    hourlyRate: number | null
    rating: number
    reviewsCount: number
    completedOrders: number
    responseTime: string
    categories: number[]
    isVerified: boolean
  }
  _count: {
    executorReviews: number
  }
}

interface Category {
  id: number
  name: string
  description: string
  icon?: string
}

export default function ClientSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [executors, setExecutors] = useState<Executor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Фильтры
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || searchParams.get('query') || '',
    category: searchParams.get('category') || '',
    minRating: '',
    maxPrice: '',
    location: '',
    verified: false
  })
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedExecutor, setSelectedExecutor] = useState<Executor | null>(null)

  // Сортировка
  const [sortBy, setSortBy] = useState('rating')

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
        fetchExecutors()
        
        // Загружаем выбранного исполнителя из localStorage
        const savedExecutor = localStorage.getItem('selectedExecutor')
        if (savedExecutor) {
          try {
            setSelectedExecutor(JSON.parse(savedExecutor))
          } catch (error) {
            console.error('Error parsing saved executor:', error)
          }
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

  const fetchExecutors = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.query) params.append('query', filters.query)
      if (filters.category) params.append('category', filters.category)
      if (filters.minRating) params.append('minRating', filters.minRating)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.location) params.append('location', filters.location)
      if (filters.verified) params.append('verified', 'true')
      params.append('sortBy', sortBy)

      const response = await fetch(`/api/executors?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setExecutors(data.executors || [])
      }
    } catch (error) {
      console.error('Error fetching executors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchExecutors()
    }
  }, [filters, sortBy, isAuthenticated])

  // Обновляем фильтры при изменении URL параметров
  useEffect(() => {
    const queryParam = searchParams.get('q') || searchParams.get('query') || ''
    const categoryParam = searchParams.get('category') || ''
    
    if (queryParam !== filters.query || categoryParam !== filters.category) {
      setFilters(prev => ({
        ...prev,
        query: queryParam,
        category: categoryParam
      }))
    }
  }, [searchParams])

  const handleFilterChange = (field: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleCategorySelect = (option: Category | null) => {
    setSelectedCategory(option)
    setFilters(prev => ({ 
      ...prev, 
      category: option ? option.id.toString() : '' 
    }))
  }

  const handleSearch = () => {
    fetchExecutors()
  }

  const handleSelectExecutor = (executor: Executor) => {
    // Устанавливаем выбранного исполнителя в состояние
    setSelectedExecutor(executor)
    
    // Сохраняем выбранного исполнителя в localStorage
    localStorage.setItem('selectedExecutor', JSON.stringify(executor))
    
    // Проверяем, есть ли данные формы в localStorage (прямое бронирование)
    const orderFormData = localStorage.getItem('orderFormData')
    const selectedCategory = localStorage.getItem('selectedCategory')
    
    if (orderFormData && selectedCategory) {
      // Это прямое бронирование - переходим к выбору времени
      router.push('/dashboard/client/select-time')
    } else {
      // Это обычный поиск - переходим к выбору времени
      router.push('/dashboard/client/select-time')
    }
  }

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : 'Неизвестная категория'
  }

  const clearSelectedExecutor = () => {
    setSelectedExecutor(null)
    localStorage.removeItem('selectedExecutor')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Поиск исполнителей
          </h1>
          <p className="text-gray-600">
            Найдите подходящего мастера для ваших задач
          </p>
          
          {/* Информация о прямом бронировании */}
          {selectedExecutor && (
            <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-primary-900">Прямое бронирование</h3>
                  <p className="text-sm text-primary-700">
                    Выбран исполнитель: <span className="font-medium">{selectedExecutor.name}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelectedExecutor}
                >
                  Изменить
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Поиск и фильтры */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск по названию или описанию
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  placeholder="Что нужно сделать?"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <AutoCompleteSelect
                options={categories}
                value={selectedCategory}
                onChange={handleCategorySelect}
                placeholder="Выберите категорию..."
                searchPlaceholder="Поиск по категориям..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сортировка
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
              >
                <option value="rating">По рейтингу</option>
                <option value="price">По цене</option>
                <option value="reviews">По количеству отзывов</option>
                <option value="completed">По выполненным заказам</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Минимальный рейтинг
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
              >
                <option value="">Любой</option>
                <option value="4">4+ звезд</option>
                <option value="4.5">4.5+ звезд</option>
                <option value="5">5 звезд</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Максимальная цена (BYN/ч)
              </label>
              <Input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="100"
                min="0"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Местоположение
              </label>
              <Input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Минск"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Только верифицированные</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={handleSearch} className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Найти
            </Button>
            
            <div className="text-sm text-gray-600">
              Найдено: {executors.length} исполнителей
            </div>
          </div>
        </div>

        {/* Список исполнителей */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Поиск исполнителей...</p>
          </div>
        ) : executors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executors.map((executor) => (
              <div key={executor.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow">
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {executor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{executor.name}</h3>
                      <p className="text-sm text-gray-600">{executor.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {executor.isVerified && (
                      <div className="flex items-center text-secondary-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Верифицирован</span>
                      </div>
                    )}
                    <div className={`w-2 h-2 rounded-full ${
                      executor.status === 'active' ? 'bg-secondary-400' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>

                {/* Описание */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {executor.executorProfile?.description || 'Описание не указано'}
                </p>

                {/* Категории */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {(executor.executorProfile?.categories || []).slice(0, 3).map((categoryId) => (
                      <span
                        key={categoryId}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {getCategoryName(categoryId)}
                      </span>
                    ))}
                    {(executor.executorProfile?.categories || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{(executor.executorProfile?.categories || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-4 w-4 text-secondary-400 mr-1" />
                      <span className="font-semibold text-gray-900">
                        {executor.executorProfile?.rating ? 
                          Number(executor.executorProfile.rating).toFixed(1) : 
                          '0.0'
                        }
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {executor.executorProfile?.reviewsCount || 0} отзывов
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">
                      {executor.executorProfile?.completedOrders || 0}
                    </p>
                    <p className="text-xs text-gray-600">заказов</p>
                  </div>
                </div>

                {/* Дополнительная информация */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Время ответа: {executor.executorProfile?.responseTime || 'Не указано'}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>Опыт: {executor.executorProfile?.experience || 'Не указан'}</span>
                  </div>
                  {executor.executorProfile?.hourlyRate && (
                    <div className="flex items-center">
                      <span className="font-medium text-primary-600">
                        от {executor.executorProfile.hourlyRate} BYN/час
                      </span>
                    </div>
                  )}
                </div>

                {/* Действия */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => router.push(`/dashboard/client/executor/${executor.id}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    Профиль
                  </Button>
                  <Button
                    onClick={() => handleSelectExecutor(executor)}
                    className="flex-1"
                  >
                    Выбрать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Исполнители не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              Попробуйте изменить параметры поиска
            </p>
            <Button onClick={() => {
              setFilters({
                query: '',
                category: '',
                minRating: '',
                maxPrice: '',
                location: '',
                verified: false
              })
            }}>
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}