'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '../../../components/layout/Header'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Search, Star, MapPin, Clock, Phone, User, Settings, Loader2, Trophy } from 'lucide-react'
import { GamificationDashboard } from '../../../components/gamification/GamificationDashboard'
import { NotificationCenter } from '../../../components/gamification/NotificationCenter'

interface Category {
  id: number
  name: string
  description: string
  icon: string
}

interface Order {
  id: number
  serviceDescription: string
  status: string
  totalPrice: number
  orderDate: string
  address: string
  executor?: {
    name: string
  }
  category: {
    name: string
  }
}

interface Executor {
  id: number
  name: string
  location: string
  executorProfile: {
    rating: number
    completedOrders: number
    hourlyRate: number
  }
  _count: {
    executorReviews: number
  }
}

export default function ClientDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topExecutors, setTopExecutors] = useState<Executor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gamification'>('dashboard')

  useEffect(() => {
    // Проверяем аутентификацию при загрузке
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user && user.id && user.role === 'client') {
            console.log('🔍 Загружаем актуальные данные для пользователя:', user.id)
            
            // Загружаем актуальные данные пользователя из БД
            const response = await fetch(`/api/users/${user.id}`)
            if (response.ok) {
              const userData = await response.json()
              console.log('✅ Получены данные из БД:', userData)
              
              const updatedUser = { ...user, ...userData.user }
              console.log('🔄 Обновленный пользователь:', updatedUser)
              
              setCurrentUser(updatedUser)
              // Обновляем localStorage актуальными данными
              localStorage.setItem('currentUser', JSON.stringify(updatedUser))
              console.log('💾 localStorage обновлен')
            } else {
              console.log('❌ Ошибка загрузки данных из БД')
              setCurrentUser(user)
            }
            setIsAuthenticated(true)
            return user
          }
        }
        // Если пользователь не найден или не клиент, перенаправляем на логин
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
      }
    })
  }, [router])

  const fetchData = async (user: any) => {
    try {
      // Загружаем все данные параллельно
      const [categoriesResponse, ordersResponse, executorsResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/orders?clientId=' + user.id),
        fetch('/api/executors?limit=4')
      ])

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        // Проверяем, что ordersData.orders существует и является массивом
        if (ordersData.orders && Array.isArray(ordersData.orders)) {
          setRecentOrders(ordersData.orders.slice(0, 3)) // Берем только 3 последних заказа
        } else {
          setRecentOrders([])
        }
      }

      if (executorsResponse.ok) {
        const executorsData = await executorsResponse.json()
        // Проверяем, что executorsData.executors существует и является массивом
        if (executorsData.executors && Array.isArray(executorsData.executors)) {
          setTopExecutors(executorsData.executors)
        } else {
          setTopExecutors([])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // В случае ошибки устанавливаем пустые массивы
      setRecentOrders([])
      setTopExecutors([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Ожидает подтверждения',
      'confirmed': 'Подтвержден',
      'in_progress': 'В работе',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-primary-100 text-primary-800',
      'in_progress': 'bg-secondary-100 text-secondary-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  // Если не аутентифицирован, показываем загрузку
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
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Добро пожаловать, {currentUser?.name || 'Клиент'}! 👋
          </h1>
          <p className="text-gray-600">
            Управляйте своими заказами и находите лучших мастеров для ваших задач
          </p>
        </div>

        {/* Вкладки */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Дашборд
              </button>
              <button
                onClick={() => setActiveTab('gamification')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'gamification'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="h-4 w-4 inline mr-2" />
                Геймификация
              </button>
            </nav>
          </div>
        </div>

        {/* Контент вкладок */}
        {activeTab === 'dashboard' && (
          <>
            {/* Информация о пользователе */}
            {currentUser && (
              <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-secondary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{currentUser.name}</h2>
                    <p className="text-gray-600">{currentUser.email}</p>
                    <p className="text-gray-600">{currentUser.phone}</p>
                    <p className="text-gray-600">{currentUser.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Статус: {currentUser.status}</p>
                    <p className="text-sm text-gray-500">Дата регистрации: {new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <button 
                    onClick={async () => {
                      try {
                        console.log('🔄 Принудительно обновляем данные...')
                        const response = await fetch(`/api/users/${currentUser.id}`)
                        if (response.ok) {
                          const userData = await response.json()
                          const updatedUser = { ...currentUser, ...userData.user }
                          setCurrentUser(updatedUser)
                          localStorage.setItem('currentUser', JSON.stringify(updatedUser))
                          console.log('✅ Данные обновлены!')
                          alert('Данные обновлены!')
                        }
                      } catch (error) {
                        console.error('Ошибка обновления:', error)
                      }
                    }}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors text-sm"
                  >
                    🔄 Обновить данные
                  </button>
                </div>
              </div>
            )}

        {/* Поиск */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Поиск мастеров</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Что нужно сделать?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
              >
                <option value="">Все категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => {
                const params = new URLSearchParams()
                if (searchQuery) params.append('query', searchQuery)
                if (selectedCategory) params.append('category', selectedCategory)
                window.location.href = `/dashboard/client/search?${params.toString()}`
              }}
              className="px-8"
            >
              <Search className="h-5 w-5 mr-2" />
              Найти
            </Button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Последние заказы */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">📋 Последние заказы</h2>
                <Link href="/dashboard/client/orders">
                  <Button variant="outline" size="sm">
                    Все заказы
                  </Button>
                </Link>
              </div>
              
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {order.serviceDescription}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Категория: {order.category?.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {order.address}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <p className="text-lg font-bold text-gray-900 mt-2">
                            {order.totalPrice} BYN
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-secondary-400" />
                  </div>
                  <p className="text-gray-600 mb-4">У вас пока нет заказов</p>
                  <Link href="/dashboard/client/booking">
                    <Button>
                      Создать первый заказ
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Топ исполнители */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">⭐ Топ исполнители</h2>
              
              {topExecutors.length > 0 ? (
                <div className="space-y-4">
                  {topExecutors.map((executor) => (
                    <div key={executor.id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {executor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{executor.name}</h3>
                          <p className="text-sm text-gray-600">{executor.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-medium">
                            {executor.executorProfile?.rating ? 
                              Number(executor.executorProfile.rating).toFixed(1) : 
                              '0.0'
                            }
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({executor._count?.executorReviews || 0})
                          </span>
                        </div>
                        <span className="text-primary-600 font-medium">
                          от {executor.executorProfile?.hourlyRate || '0'} BYN/ч
                        </span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-secondary-100">
                        <p className="text-xs text-gray-500">
                          Выполнено заказов: {executor.executorProfile?.completedOrders || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-secondary-400" />
                  </div>
                  <p className="text-gray-600">Пока нет исполнителей</p>
                </div>
              )}
              
              <div className="mt-6">
                <Link href="/dashboard/client/search">
                  <Button variant="outline" className="w-full">
                    Найти больше мастеров
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🚀 Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/client/booking">
              <div className="p-4 border border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Создать заказ</h3>
                <p className="text-sm text-gray-600">Опишите задачу и найдите мастера</p>
              </div>
            </Link>
            
            <Link href="/dashboard/client/search">
              <div className="p-4 border border-secondary-200 rounded-lg hover:border-secondary-300 hover:shadow-md transition-all cursor-pointer">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Поиск мастеров</h3>
                <p className="text-sm text-gray-600">Найдите исполнителя по категории</p>
              </div>
            </Link>
            
            <Link href="/dashboard/client/profile">
              <div className="p-4 border border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Профиль</h3>
                <p className="text-sm text-gray-600">Управляйте настройками аккаунта</p>
              </div>
            </Link>
          </div>
        </div>
          </>
        )}

        {activeTab === 'gamification' && currentUser && (
          <GamificationDashboard userId={currentUser.id} />
        )}
      </div>
    </div>
  )
} 