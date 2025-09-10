'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '../../../components/layout/Header'
import { Button } from '../../../components/ui/Button'
import { Calendar, Clock, DollarSign, Star, CheckCircle, AlertCircle, User, Settings, Loader2, Crown, AlertTriangle, Trophy } from 'lucide-react'
import { GamificationDashboard } from '../../../components/gamification/GamificationDashboard'

interface Order {
  id: number
  serviceDescription: string
  status: string
  totalPrice: number
  orderDate: string
  orderTime: string
  address: string
  client: {
    name: string
    phone: string
  }
  category: {
    name: string
  }
}

interface Subscription {
  id: number
  planType: string
  startDate: string
  endDate: string
  status: string
  amount: number
}

interface ExecutorProfile {
  id: number
  rating: number
  reviewsCount: number
  completedOrders: number
  hourlyRate: number | null
  description: string
  experience: string
  categories: number[]
  isVerified: boolean
  verificationStatus: string
}

export default function ExecutorDashboard() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [executorProfile, setExecutorProfile] = useState<ExecutorProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gamification'>('dashboard')

  // Проверяем аутентификацию и загружаем данные пользователя
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user && user.id && user.role === 'executor') {
            setCurrentUser(user)
            setIsAuthenticated(true)
            await fetchData(user)
          } else {
            router.push('/auth/login')
          }
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  const fetchData = async (user: any) => {
    try {
      // Загружаем все данные параллельно
      const [profileResponse, subscriptionResponse, ordersResponse] = await Promise.all([
        fetch(`/api/executor-profile?userId=${user.id}`),
        fetch(`/api/subscriptions?userId=${user.id}`),
        fetch('/api/orders?executorId=' + user.id, {
          headers: {
            'Authorization': `Bearer ${Buffer.from(JSON.stringify(user)).toString('base64')}`
          }
        })
      ])

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setExecutorProfile(profileData.profile)
      }

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        if (subscriptionData.subscriptions && subscriptionData.subscriptions.length > 0) {
          const activeSubscription = subscriptionData.subscriptions.find((sub: Subscription) => 
            sub.status === 'active' && new Date(sub.endDate) > new Date()
          )
          setSubscription(activeSubscription || null)
        }
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        if (ordersData.orders && Array.isArray(ordersData.orders)) {
          setRecentOrders(ordersData.orders.slice(0, 5)) // Берем только 5 последних заказов
        } else {
          setRecentOrders([])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setRecentOrders([])
    } finally {
      setIsLoading(false)
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-secondary-100 text-secondary-800'
      case 'pending':
        return 'bg-secondary-100 text-secondary-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Подтвержден'
      case 'pending':
        return 'Ожидает подтверждения'
      case 'cancelled':
        return 'Отменен'
      default:
        return 'Неизвестно'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleOrderAction = async (orderId: number, action: 'confirm' | 'reject') => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(currentUser)).toString('base64')}`
        },
        body: JSON.stringify({
          status: action === 'confirm' ? 'confirmed' : 'cancelled'
        })
      })

      if (response.ok) {
        const actionText = action === 'confirm' ? 'подтвержден' : 'отклонен'
        alert(`Заказ ${actionText}!`)
        
        // Заказ обновлен - можно перезагрузить страницу для обновления данных
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error || 'Не удалось обновить заказ'}`)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Произошла ошибка при обновлении заказа')
    }
  }


  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Добро пожаловать, {currentUser?.name || 'Исполнитель'}! 👋
          </h1>
          <p className="text-gray-600">
            Управляйте заказами и развивайте свой бизнес
          </p>
        </div>

        {/* Информация о пользователе */}
        {currentUser && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentUser.name}</h2>
                <p className="text-gray-600">{currentUser.email}</p>
                <p className="text-gray-600">{currentUser.phone}</p>
                <p className="text-gray-600">{currentUser.location}</p>
                {executorProfile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Опыт: {executorProfile.experience}</p>
                    <p className="text-sm text-gray-500">
                      Ставка: {executorProfile.hourlyRate ? `${executorProfile.hourlyRate} BYN/час` : 'Не указана'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Статус верификации: {executorProfile.isVerified ? 'Верифицирован' : 'На проверке'}
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Статус: {currentUser.status}</p>
              </div>
            </div>
          </div>
        )}
        {/* Статус подписки */}
        {subscription && (
          <div className="mb-8 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-secondary-600" />
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Активная подписка
                  </h3>
                  <p className="text-secondary-700">
                    {subscription.planType} план • Действует до {new Date(subscription.endDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
              <span className="text-secondary-700 font-medium">
                {subscription.amount} BYN
              </span>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Выполнено заказов</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executorProfile?.completedOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Star className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Средний рейтинг</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executorProfile?.rating ? Number(executorProfile.rating).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Время ответа</p>
                <p className="text-2xl font-bold text-gray-900">
                  24 часа
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ставка за час</p>
                <p className="text-2xl font-bold text-gray-900">
                  {executorProfile?.hourlyRate ? `${executorProfile.hourlyRate} BYN` : 'Не указана'}
                </p>
              </div>
            </div>
          </div>
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
                <Trophy className="inline h-4 w-4 mr-1" />
                Геймификация
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Последние заказы */}
            <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Последние заказы
                </h2>
                <Link href="/dashboard/executor/orders">
                  <Button variant="outline" size="sm">
                    Посмотреть все
                  </Button>
                </Link>
              </div>
              
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {order.serviceDescription}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Категория: {order.category?.name}
                          </p>
                          <p className="text-sm text-gray-600">Клиент: {order.client.name}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>{new Date(order.orderDate).toLocaleDateString('ru-RU')}</span>
                            <span>{order.orderTime}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{order.address}</p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusText(order.status)}</span>
                          </span>
                          <p className="text-lg font-semibold text-primary-600 mt-2">
                            {order.totalPrice} BYN
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleOrderAction(order.id, 'confirm')}
                            >
                              Подтвердить
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleOrderAction(order.id, 'reject')}
                            >
                              Отклонить
                            </Button>
                          </>
                        )}
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
                  <Link href="/dashboard/executor/profile">
                    <Button variant="outline">
                      Настроить профиль
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статус профиля */}
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Статус профиля
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Верификация:</span>
                  <span className={`text-sm font-medium ${
                    executorProfile?.isVerified ? 'text-secondary-600' : 'text-secondary-600'
                  }`}>
                    {executorProfile?.isVerified ? 'Верифицирован' : 'На проверке'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Отзывы:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {executorProfile?.reviewsCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Категории:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {executorProfile?.categories?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Быстрые действия
              </h2>
              
              <div className="space-y-3">
                <Link href="/dashboard/executor/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Просмотреть заказы
                  </Button>
                </Link>
                <Link href="/dashboard/executor/subscription">
                  <Button variant="outline" className="w-full justify-start">
                    <Crown className="h-4 w-4 mr-2" />
                    Управлять подпиской
                  </Button>
                </Link>
                <Link href="/dashboard/executor/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Настроить профиль
                  </Button>
                </Link>
                <Link href="/dashboard/executor/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки
                  </Button>
                </Link>
                <Link href="/dashboard/executor/violations">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    История нарушений
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'gamification' && currentUser && (
          <GamificationDashboard userId={currentUser.id} />
        )}
      </main>
    </div>
  )
} 