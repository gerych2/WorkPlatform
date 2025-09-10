'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { safeBase64Encode } from '../../../../lib/utils'
import { 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  DollarSign,
  Zap,
  Star,
  Eye,
  Calendar,
  Filter
} from 'lucide-react'

interface Order {
  id: number
  serviceDescription: string
  status: string
  totalPrice: number | null
  priceType: string
  orderDate: string
  orderTime: string
  address: string
  urgency: string
  estimatedDuration: number | null
  preferredTime: string
  specialRequirements: string | null
  notes: string | null
  executorId?: number | null
  category: {
    id: number
    name: string
  }
  client: {
    id: number
    name: string
    email: string
    phone: string
    clientRating?: number
    clientReviewsCount?: number
  }
  executor?: {
    id: number
    name: string
    email: string
    phone: string
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

export default function ExecutorOrders() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [subscriptionRequired, setSubscriptionRequired] = useState(false)
  
  // Фильтры
  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    categoryId: ''
  })
  const [categories, setCategories] = useState<any[]>([])
  
  // Состояния для отзывов
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  })
  
  
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

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
        fetchSubscription(user)
        fetchCategories()
      }
    })
  }, [router])

  const fetchSubscription = async (user: any) => {
    try {
      const response = await fetch(`/api/subscriptions?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.subscriptions && data.subscriptions.length > 0) {
          const activeSubscription = data.subscriptions.find((sub: Subscription) => 
            sub.status === 'active' && new Date(sub.endDate) > new Date()
          )
          setSubscription(activeSubscription || null)
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

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

  const fetchOrders = async () => {
    if (!currentUser) return

    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.urgency) params.append('urgency', filters.urgency)
      if (filters.categoryId) params.append('categoryId', filters.categoryId)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        }
      })

      if (response.status === 403) {
        const errorData = await response.json()
        if (errorData.subscriptionRequired) {
          setSubscriptionRequired(true)
          setIsLoading(false)
          return
        }
      }

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        console.log('Orders loaded:', data.orders?.length || 0)
      } else {
        const errorData = await response.json()
        console.error('Error fetching orders:', errorData.error)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchOrders()
    }
  }, [isAuthenticated, currentUser, filters, searchQuery])

  // Обновляем поиск при изменении URL параметров
  useEffect(() => {
    const queryParam = searchParams.get('q') || ''
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam)
    }
  }, [searchParams])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Ожидает исполнителя',
      'confirmed': 'Подтвержден',
      'in_progress': 'В работе',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-secondary-100 text-secondary-800',
      'confirmed': 'bg-primary-100 text-primary-800',
      'in_progress': 'bg-secondary-100 text-secondary-800',
      'completed': 'bg-secondary-100 text-secondary-800',
      'cancelled': 'bg-secondary-100 text-secondary-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
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

  const handleAcceptOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify({
          status: 'confirmed',
          executorId: currentUser.id
        })
      })

      if (response.ok) {
        alert('Заказ принят!')
        // Принудительно обновляем список заказов
        await fetchOrders()
        // Дополнительно обновляем состояние через небольшую задержку
        setTimeout(() => {
          fetchOrders()
        }, 500)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Ошибка при принятии заказа')
      }
    } catch (error) {
      console.error('Error accepting order:', error)
      alert('Произошла ошибка при принятии заказа')
    }
  }

  const handleRejectOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      })

      if (response.ok) {
        alert('Заказ отклонен!')
        await fetchOrders()
        setTimeout(() => {
          fetchOrders()
        }, 500)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Ошибка при отклонении заказа')
      }
    } catch (error) {
      console.error('Error rejecting order:', error)
      alert('Произошла ошибка при отклонении заказа')
    }
  }

  const handleCompleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify({
          status: 'completed'
        })
      })

      if (response.ok) {
        alert('Заказ завершен!')
        await fetchOrders()
        setTimeout(() => {
          fetchOrders()
        }, 500)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Ошибка при завершении заказа')
      }
    } catch (error) {
      console.error('Error completing order:', error)
      alert('Произошла ошибка при завершении заказа')
    }
  }

  const handleSubmitReview = async () => {
    console.log('handleSubmitReview вызван')
    console.log('currentUser:', currentUser)
    console.log('selectedOrder:', selectedOrder)
    console.log('selectedOrder.client:', selectedOrder?.client)

    // Загружаем пользователя заново из localStorage
    let user = currentUser
    if (!user) {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          user = JSON.parse(userStr)
          console.log('Пользователь загружен из localStorage:', user)
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error)
      }
    }

    if (!user) {
      console.log('❌ currentUser не определен')
      showNotification('error', 'Пользователь не авторизован')
      return
    }

    if (!selectedOrder) {
      console.log('❌ selectedOrder не определен')
      showNotification('error', 'Заказ не выбран')
      return
    }

    if (!selectedOrder.client) {
      console.log('❌ selectedOrder.client не определен')
      showNotification('error', 'Клиент не найден')
      return
    }

    console.log('selectedOrder.client.id:', selectedOrder.client.id)
    console.log('user.id:', user.id)

    const reviewPayload = {
      orderId: selectedOrder.id,
      clientId: selectedOrder.client.id,
      executorId: user.id,
      reviewerId: user.id, // Исполнитель оставляет отзыв
      reviewedId: selectedOrder.client.id, // На клиента
      rating: reviewData.rating,
      comment: reviewData.comment
    }

    // Принудительно добавляем поля, если они undefined
    if (!reviewPayload.reviewerId) {
      reviewPayload.reviewerId = user.id
    }
    if (!reviewPayload.reviewedId) {
      reviewPayload.reviewedId = selectedOrder.client.id
    }

    console.log('Отправка отзыва с данными:', reviewPayload)
    console.log('JSON.stringify(reviewPayload):', JSON.stringify(reviewPayload))

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(user))}`
        },
        body: JSON.stringify(reviewPayload)
      })

      if (response.ok) {
        showNotification('success', 'Отзыв успешно оставлен!')
        setShowReviewModal(false)
        setSelectedOrder(null)
        setReviewData({ rating: 5, comment: '' })
        fetchOrders()
      } else {
        let errorMessage = 'Ошибка при отправке отзыва'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          // Если ответ не JSON, используем статус код
          errorMessage = `Ошибка сервера: ${response.status} ${response.statusText}`
        }
        showNotification('error', errorMessage)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      showNotification('error', 'Ошибка при отправке отзыва')
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

  if (subscriptionRequired) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-12 w-12 text-secondary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Требуется активная подписка
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Для просмотра заказов необходимо иметь активную подписку на платформе
            </p>
            <Button onClick={() => router.push('/dashboard/executor/subscription')}>
              Оформить подписку
            </Button>
          </div>
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
            Доступные заказы
          </h1>
          <p className="text-gray-600">
            Просматривайте и принимайте заказы в ваших категориях
          </p>
        </div>

        {/* Информация о подписке */}
        {subscription && (
          <div className="mb-6 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-secondary-600" />
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

        {/* Фильтры */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary-600" />
            Фильтры
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="">Все статусы</option>
                <option value="pending">Ожидает исполнителя</option>
                <option value="confirmed">Подтвержден</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
              </select>
          </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Срочность
              </label>
              <select
                value={filters.urgency}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="">Любая срочность</option>
                <option value="low">Низкая</option>
                <option value="medium">Средняя</option>
                <option value="high">Высокая</option>
              </select>
          </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="">Все категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Список заказов */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Загрузка заказов...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {orders.map((order) => (
              <div key={order.id} className="group relative">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-gray-100/50 overflow-hidden">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4 group-hover:rotate-6 transition-transform duration-300">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-primary-100 transition-colors duration-300 line-clamp-2">
                            {order.serviceDescription}
                          </h3>
                          <p className="text-white/80 text-sm font-medium">
                            {order.category.name}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                        <span className="line-clamp-1">{order.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-secondary-500" />
                        <span>{new Date(order.orderDate).toLocaleDateString('ru-RU')} в {order.orderTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(order.urgency)}`}>
                          <Zap className="h-3 w-3 mr-1" />
                          {getUrgencyText(order.urgency)}
                        </span>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Стоимость</p>
                          <p className="font-bold text-primary-600 text-lg">
                            {order.priceType === 'negotiable' ? (
                              <span className="text-gray-500">По договоренности</span>
                            ) : (
                              `${order.totalPrice} BYN`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>


                  
                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    {order.status === 'pending' && !order.executorId && (
                      <>
                        <Button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="flex-1 group-hover:bg-primary-600 transition-all duration-200"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Принять заказ
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 group-hover:bg-primary-50 group-hover:border-primary-300 transition-all duration-200"
                          onClick={() => router.push(`/dashboard/executor/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Подробнее
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'pending' && order.executorId === currentUser?.id && (
                      <>
                        <Button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="flex-1 group-hover:bg-primary-600 transition-all duration-200"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Подтвердить
                        </Button>
                        <Button
                          onClick={() => handleRejectOrder(order.id)}
                          variant="outline"
                          className="flex-1 text-secondary-600 border-secondary-300 hover:bg-secondary-50 group-hover:border-secondary-400 transition-all duration-200"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'confirmed' && order.executorId === currentUser?.id && (
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary-50 group-hover:border-primary-300 transition-all duration-200"
                        onClick={() => router.push(`/dashboard/executor/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Подробнее
                      </Button>
                    )}
                    
                    {order.status === 'in_progress' && order.executorId === currentUser?.id && (
                      <>
                        <Button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="flex-1 group-hover:bg-primary-600 transition-all duration-200"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Готово
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 group-hover:bg-primary-50 group-hover:border-primary-300 transition-all duration-200"
                          onClick={() => router.push(`/dashboard/executor/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Подробнее
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'completed' && (
                      <>
                        <Button 
                          variant="outline" 
                          className="flex-1 group-hover:bg-primary-50 group-hover:border-primary-300 transition-all duration-200"
                          onClick={() => router.push(`/dashboard/executor/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Подробнее
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 group-hover:bg-secondary-50 group-hover:border-secondary-300 transition-all duration-200"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowReviewModal(true)
                          }}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Отзыв
                        </Button>
                      </>
                    )}
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Заказы не найдены
            </h3>
            <p className="text-gray-600">
              В данный момент нет доступных заказов в ваших категориях
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно для отзыва */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Оставить отзыв о клиенте
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Рейтинг
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl ${
                      star <= reviewData.rating ? 'text-secondary-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий (необязательно)
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Опишите ваше впечатление о работе с клиентом..."
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedOrder(null)
                  setReviewData({ rating: 5, comment: '' })
                }}
              >
                Отмена
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitReview}
              >
                Отправить отзыв
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Уведомления */}
      {notification && (
        <div className={`fixed top-4 right-4 z-modal p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-secondary-100 text-secondary-800 border border-secondary-200' 
            : 'bg-secondary-100 text-secondary-800 border border-secondary-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
