'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Notification } from '../../../../components/ui/Notification'
import { safeBase64Encode } from '../../../../lib/utils'
import { 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle,
  Loader2,
  DollarSign,
  Calendar,
  Filter,
  Eye,
  MessageSquare,
  Star
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
  createdAt: string
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

export default function ClientOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
  
  // Фильтры
  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    dateFrom: '',
    dateTo: ''
  })

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
        fetchOrders(user)
      }
    })
  }, [router])

  const fetchOrders = async (user?: any) => {
    try {
      const userToUse = user || currentUser
      if (!userToUse) {
        console.error('No user provided to fetchOrders')
        return
      }
      
      console.log('Fetching orders for user:', userToUse.id)
      const params = new URLSearchParams()
      params.append('clientId', userToUse.id)
      if (filters.status) params.append('status', filters.status)
      if (filters.urgency) params.append('urgency', filters.urgency)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(userToUse))}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Orders fetched:', data)
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders:', response.status)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  // Дебаунс для фильтров
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated && currentUser) {
        fetchOrders(currentUser)
      }
    }, 500) // 500ms задержка

    return () => clearTimeout(timeoutId)
  }, [filters.status, filters.urgency, filters.dateFrom, filters.dateTo, isAuthenticated, currentUser])

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
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-primary-100 text-primary-800',
      'in_progress': 'bg-secondary-100 text-secondary-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
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

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Вы уверены, что хотите отменить заказ?')) return

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
        alert('Заказ отменен')
        fetchOrders(currentUser)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Ошибка при отмене заказа')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Произошла ошибка при отмене заказа')
    }
  }

  const handleSubmitReview = async () => {
    if (!currentUser || !selectedOrder || !selectedOrder.executor) return

    const reviewPayload = {
      orderId: selectedOrder.id,
      clientId: currentUser.id,
      executorId: selectedOrder.executor.id,
      reviewerId: currentUser.id, // Клиент оставляет отзыв
      reviewedId: selectedOrder.executor.id, // На исполнителя
      rating: reviewData.rating,
      comment: reviewData.comment
    }

    // Принудительно добавляем поля, если они undefined
    if (!reviewPayload.reviewerId) {
      reviewPayload.reviewerId = currentUser.id
    }
    if (!reviewPayload.reviewedId) {
      reviewPayload.reviewedId = selectedOrder.executor.id
    }

    console.log('Клиент отправляет отзыв:', reviewPayload)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify(reviewPayload)
      })

      if (response.ok) {
        showNotification('success', 'Отзыв успешно оставлен!')
        setShowReviewModal(false)
        setSelectedOrder(null)
        setReviewData({ rating: 5, comment: '' })
        fetchOrders(currentUser)
      } else {
        const errorData = await response.json()
        showNotification('error', `Ошибка при отправке отзыва: ${errorData.error}`)
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Мои заказы
          </h1>
          <p className="text-gray-600">
            Управляйте своими заказами и отслеживайте их статус
          </p>
          
          {/* Рейтинг клиента */}
          {currentUser.clientRating && Number(currentUser.clientRating) > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-lg font-semibold text-yellow-800">
                    {Number(currentUser.clientRating).toFixed(1)}
                  </span>
                  <span className="text-yellow-600 ml-2">
                    ({currentUser.clientReviewsCount || 0} отзывов)
                  </span>
                </div>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Ваш рейтинг как клиента
              </p>
            </div>
          )}
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary-600" />
            Фильтры
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Дата от
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата до
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
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
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow">
                {/* Заголовок заказа */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {order.serviceDescription}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {order.address}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {order.orderTime}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(order.urgency)}`}>
                        {getUrgencyText(order.urgency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Детали заказа */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Категория</p>
                    <p className="font-medium text-gray-900">{order.category.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Стоимость</p>
                    <p className="font-bold text-primary-600 text-lg">
                      {order.priceType === 'negotiable' ? (
                        <span className="text-gray-500">По договоренности</span>
                      ) : (
                        `${order.totalPrice} BYN`
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Создан</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                {/* Информация об исполнителе */}
                {order.executor && (
                  <div className="border-t border-secondary-200 pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Исполнитель
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{order.executor.name}</p>
                        <p className="text-sm text-gray-600">{order.executor.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Дополнительная информация */}
                {(order.notes || order.specialRequirements) && (
                  <div className="border-t border-secondary-200 pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Дополнительная информация</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {order.notes && (
                        <p><strong>Заметки:</strong> {order.notes}</p>
                      )}
                      {order.specialRequirements && (
                        <p><strong>Особые требования:</strong> {order.specialRequirements}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Действия */}
                <div className="border-t border-secondary-200 pt-4">
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/client/orders/${order.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Подробнее
                    </Button>
                    
                    {order.status === 'pending' && (
                      <Button
                        onClick={() => handleCancelOrder(order.id)}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Отменить заказ
                      </Button>
                    )}
                    
                    {order.status === 'completed' && order.executor && (
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowReviewModal(true)
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Оставить отзыв
                      </Button>
                    )}
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
              Заказов пока нет
            </h3>
            <p className="text-gray-600 mb-4">
              Создайте свой первый заказ, чтобы найти подходящего мастера
            </p>
            <Button onClick={() => router.push('/dashboard/client/booking')}>
              Создать заказ
            </Button>
          </div>
        )}
      </div>

      {/* Модальное окно для отзыва */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Оставить отзыв</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оценка
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-2xl ${
                        star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий (необязательно)
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Расскажите о качестве выполненной работы..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedOrder(null)
                }}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmitReview}
                className="flex-1"
              >
                Отправить отзыв
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}