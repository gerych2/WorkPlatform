'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../components/ui/Button'
import { Clock, MapPin, Phone, User, CheckCircle, XCircle } from 'lucide-react'

interface Order {
  id: number
  clientName: string
  phone: string
  address: string
  serviceDescription: string
  orderDate: string
  orderTime: string
  totalPrice: number
  status: string
}

export default function ExecutorOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Загружаем заказы исполнителя
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      // Временно используем моковые данные
      const mockOrders: Order[] = [
        {
          id: 1,
          clientName: 'Клиент',
          phone: '+375 (29) 123-45-67',
          address: 'Минск, ул. Ленина, 15, кв. 5',
          serviceDescription: 'Установка розетки в кухне',
          orderDate: '2024-01-15',
          orderTime: '14:00',
          totalPrice: 25.00,
          status: 'pending'
        }
      ]
      
      setOrders(mockOrders)
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptOrder = (orderId: number) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'accepted' }
        : order
    ))
  }

  const handleRejectOrder = (orderId: number) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'rejected' }
        : order
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Ожидает</span>
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Принят</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Отклонен</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка заказов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
          <p className="text-gray-600 mt-2">Управляйте входящими заказами и их статусами</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ожидают</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Приняты</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'accepted').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Отклонены</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold">₽</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общий доход</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)} BYN
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список заказов */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Список заказов</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h3>
              <p className="text-gray-600">Когда появятся новые заказы, они отобразятся здесь</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {order.serviceDescription}
                          </h3>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{order.clientName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{order.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{order.address}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {order.orderDate} в {order.orderTime}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">
                            {order.totalPrice} BYN
                          </div>
                          <div className="mt-2">
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {order.status === 'pending' && (
                    <div className="mt-4 flex space-x-3">
                      <Button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Принять заказ
                      </Button>
                      <Button
                        onClick={() => handleRejectOrder(order.id)}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Отклонить
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
