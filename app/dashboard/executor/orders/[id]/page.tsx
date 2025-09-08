'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '../../../../../components/layout/Header'
import { Button } from '../../../../../components/ui/Button'
import { safeBase64Encode } from '../../../../../lib/utils'
import { 
  ArrowLeft,
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle,
  Loader2,
  DollarSign,
  Calendar,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  XCircle,
  CheckSquare,
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

export default function ExecutorOrderDetails() {
  const router = useRouter()
  const params = useParams()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user && user.id && user.role === 'executor') {
            setCurrentUser(user)
            setIsAuthenticated(true)
            return
          }
        }
        router.push('/auth/login')
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, params.id])

  // Загружаем данные заказа после установки пользователя
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      fetchOrderDetails()
    }
  }, [currentUser, isAuthenticated, params.id])

  const fetchOrderDetails = async () => {
    if (!currentUser) {
      console.error('No current user available')
      return
    }

    setIsLoadingOrder(true)
    try {
      console.log('Fetching order details for ID:', params.id)
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        }
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Order data received:', data)
        setOrder(data)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch order details:', errorData)
        alert(`Ошибка загрузки заказа: ${errorData.error}`)
        router.push('/dashboard/executor/orders')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      alert(`Ошибка: ${error}`)
      router.push('/dashboard/executor/orders')
    } finally {
      setIsLoadingOrder(false)
    }
  }

  const handleAcceptOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${order?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify({ status: 'confirmed', executorId: currentUser?.id })
      })

      if (response.ok) {
        alert('Заказ принят!')
        fetchOrderDetails()
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error accepting order:', error)
      alert('Произошла ошибка')
    }
  }


  const handleCancelOrder = async () => {
    if (!currentUser) return

    const reason = prompt('Укажите причину отмены заказа (необязательно):')
    
    try {
      const response = await fetch('/api/executor/cancel-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify({
          orderId: parseInt(Array.isArray(params.id) ? params.id[0] : params.id),
          reason: reason || undefined
        })
      })

      if (response.ok) {
        alert('Заказ отменен и возвращен в открытый поиск!')
        router.push('/dashboard/executor/orders')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Ошибка при отмене заказа')
    }
  }

  const handleCompleteOrder = async () => {
    if (!currentUser) return

    const confirmed = confirm('Вы уверены, что заказ выполнен? После подтверждения заказ будет отмечен как завершенный.')
    
    if (!confirmed) return

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
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
        alert('Заказ успешно завершен! Клиент получит уведомление.')
        fetchOrderDetails()
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error completing order:', error)
      alert('Ошибка при завершении заказа')
    }
  }

  const handleSubmitReview = async () => {
    if (!currentUser || !order || !order.client) return

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(currentUser))}`
        },
        body: JSON.stringify({
          orderId: order.id,
          clientId: order.client.id,
          executorId: currentUser.id,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
      })

      if (response.ok) {
        alert('Отзыв успешно оставлен!')
        setShowReviewModal(false)
        setReviewData({ rating: 5, comment: '' })
        fetchOrderDetails()
      } else {
        const errorData = await response.json()
        alert(`Ошибка при отправке отзыва: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Ошибка при отправке отзыва')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-secondary-100 text-secondary-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения'
      case 'confirmed': return 'Подтвержден'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Завершен'
      case 'cancelled': return 'Отменен'
      default: return status
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'Низкая'
      case 'medium': return 'Средняя'
      case 'high': return 'Высокая'
      default: return urgency
    }
  }

  const canCancelOrder = (order: Order) => {
    if (!order) return false
    
    // Заказ нельзя отменить, если он уже завершен или отменен
    if (order.status === 'completed' || order.status === 'cancelled') {
      return false
    }
    
    // Проверяем, можно ли отменить заказ (за 24 часа до начала)
    const orderDateTime = new Date(`${order.orderDate}T${order.orderTime}`)
    const now = new Date()
    const timeDiff = orderDateTime.getTime() - now.getTime()
    const hoursUntilOrder = timeDiff / (1000 * 60 * 60)
    
    // Если до заказа меньше 24 часов, отменять нельзя
    if (hoursUntilOrder < 24) {
      return false
    }
    
    return true
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Загрузка заказа</h2>
            <p className="text-gray-600">
              Получаем информацию о заказе...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Заказ не найден</h2>
            <p className="text-gray-600 mb-4">
              Заказ с указанным ID не найден или у вас нет прав для его просмотра
            </p>
            <Button onClick={() => router.push('/dashboard/executor/orders')}>
              Вернуться к заказам
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Навигация */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/executor/orders')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к заказам
          </Button>
        </div>

        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2">
                Детали заказа #{order.id}
              </h1>
              <p className="text-gray-600">
                {order.serviceDescription}
              </p>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Описание услуги */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Описание услуги
              </h2>
              <p className="text-gray-700">{order.serviceDescription}</p>
              <div className="mt-4 flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Категория: <span className="font-medium">{order.category.name}</span>
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(order.urgency)}`}>
                  Срочность: {getUrgencyText(order.urgency)}
                </span>
              </div>
            </div>

            {/* Детали заказа */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Детали заказа
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Дата заказа</p>
                    <p className="font-medium">{new Date(order.orderDate).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Время</p>
                    <p className="font-medium">{order.orderTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Адрес</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                </div>
                {order.estimatedDuration && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Ожидаемая длительность</p>
                      <p className="font-medium">{order.estimatedDuration} часов</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Дополнительная информация */}
            {(order.notes || order.specialRequirements) && (
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Дополнительная информация
                </h2>
                <div className="space-y-4">
                  {order.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Заметки</h3>
                      <p className="text-gray-600">{order.notes}</p>
                    </div>
                  )}
                  {order.specialRequirements && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Особые требования</h3>
                      <p className="text-gray-600">{order.specialRequirements}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Стоимость */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Стоимость
              </h2>
              <div className="text-center">
                {order.priceType === 'negotiable' ? (
                  <div>
                    <p className="text-2xl font-bold text-primary-600 mb-2">
                      По договоренности
                    </p>
                    <p className="text-sm text-gray-500">
                      Стоимость будет обсуждена с клиентом
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-primary-600 mb-2">
                      {order.totalPrice} BYN
                    </p>
                    <p className="text-sm text-gray-500">
                      Фиксированная цена
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Информация о клиенте */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Клиент
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.client.name}</p>
                    <p className="text-sm text-gray-500">{order.client.email}</p>
                    {/* Рейтинг клиента */}
                    {order.client.clientRating && Number(order.client.clientRating) > 0 && (
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="text-xs text-gray-600">
                          {Number(order.client.clientRating).toFixed(1)} 
                          ({order.client.clientReviewsCount || 0} отзывов)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <p className="font-medium">{order.client.phone}</p>
                </div>
              </div>
            </div>

            {/* Действия */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Действия
              </h2>
              
              {/* Информация о возможностях */}
              {(order.status === 'confirmed' || order.status === 'in_progress') && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Отмена заказа:</strong> Вы можете отменить заказ в течение 12 часов после принятия без последствий.
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Завершение заказа:</strong> Если работа выполнена раньше запланированного времени, вы можете отметить заказ как готовый.
                  </p>
                </div>
              )}

              {/* Информация для принятых заказов */}
              {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'in_progress') && 
                order.executor?.id === currentUser?.id && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Отмена заказа:</strong> Вы можете отменить принятый заказ в течение 12 часов без последствий.
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                {order.status === 'pending' && !order.executor?.id && (
                  <Button
                    className="w-full"
                    onClick={handleAcceptOrder}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Принять заказ
                  </Button>
                )}
                
                {order.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCompleteOrder}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Заказ готов
                  </Button>
                )}
                
                {order.status === 'in_progress' && (
                  <Button
                    className="w-full"
                    onClick={handleCompleteOrder}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Заказ готов
                  </Button>
                )}

                {/* Кнопка отмены для принятых заказов (pending, confirmed, in_progress) */}
                {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'in_progress') && 
                  order.executor?.id === currentUser?.id && canCancelOrder(order) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCancelOrder}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Отменить заказ
                  </Button>
                )}

                {/* Сообщение о невозможности отмены */}
                {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'in_progress') && 
                  order.executor?.id === currentUser?.id && !canCancelOrder(order) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 text-center">
                      Заказ нельзя отменить менее чем за 24 часа до начала
                    </p>
                    <p className="text-xs text-yellow-700 text-center mt-1">
                      Время до заказа: {(() => {
                        const orderDateTime = new Date(`${order.orderDate}T${order.orderTime}`)
                        const now = new Date()
                        const timeDiff = orderDateTime.getTime() - now.getTime()
                        const hoursUntilOrder = Math.ceil(timeDiff / (1000 * 60 * 60))
                        return hoursUntilOrder > 0 ? `${hoursUntilOrder} часов` : 'Заказ уже начался'
                      })()}
                    </p>
                  </div>
                )}

                {/* Кнопка для завершенных заказов */}
                {order.status === 'completed' && order.executor?.id === currentUser?.id && (
                  <>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800 font-medium">Заказ завершен</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1 text-center">
                        Заказ успешно выполнен
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => setShowReviewModal(true)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Оставить отзыв о клиенте
                    </Button>
                  </>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для отзыва */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Оставить отзыв о клиенте</h3>
            
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
                  placeholder="Расскажите о работе с клиентом..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
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
