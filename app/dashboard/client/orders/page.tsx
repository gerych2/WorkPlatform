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
      comment: reviewData.comment || ''
    }

    console.log('Проверяем данные перед отправкой:', {
      orderId: reviewPayload.orderId,
      clientId: reviewPayload.clientId,
      executorId: reviewPayload.executorId,
      reviewerId: reviewPayload.reviewerId,
      reviewedId: reviewPayload.reviewedId,
      rating: reviewPayload.rating,
      comment: reviewPayload.comment
    })

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
            <div className="mt-4 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-secondary-500 mr-2" />
                  <span className="text-lg font-semibold text-secondary-800">
                    {Number(currentUser.clientRating).toFixed(1)}
                  </span>
                  <span className="text-secondary-600 ml-2">
                    ({currentUser.clientReviewsCount || 0} отзывов)
                  </span>
                </div>
              </div>
              <p className="text-sm text-secondary-700 mt-1">
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
                      <Button 
                        variant="outline" 
                        className="flex-1 group-hover:bg-primary-50 group-hover:border-primary-300 transition-all duration-200"
                        onClick={() => router.push(`/dashboard/client/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Подробнее
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => handleCancelOrder(order.id)}
                          variant="outline"
                          className="flex-1 text-secondary-600 border-secondary-300 hover:bg-secondary-50 group-hover:border-secondary-400 transition-all duration-200"
                        >
                          Отменить
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
                          Отзыв
                        </Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal">
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
                        star <= reviewData.rating ? 'text-secondary-400' : 'text-gray-300'
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