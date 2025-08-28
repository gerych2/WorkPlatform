'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '../../../components/layout/Header'
import { Button } from '../../../components/ui/Button'
import { Calendar, Clock, DollarSign, Star, CheckCircle, AlertCircle, User, Settings } from 'lucide-react'

export default function ExecutorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [executorOrders, setExecutorOrders] = useState<any[]>([])

  // Загружаем заказы для текущего исполнителя
  useEffect(() => {
    loadExecutorOrders()
  }, [])

  const loadExecutorOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    // Фильтруем заказы для текущего исполнителя (пока что все заказы показываем для демо)
    setExecutorOrders(allOrders)
  }

  // Моковые данные для демонстрации
  const subscription = {
    status: 'active',
    plan: 'Месячная подписка',
    expiresAt: '25.01.2025',
    price: '180 BYN/мес'
  }

  const recentOrders = [
    {
      id: 1,
      client: 'Анна Петрова',
      service: 'Ремонт электрики',
      date: '22.12.2024',
      time: '14:00',
      status: 'pending',
      price: '180 BYN',
      address: 'ул. Ленина, д. 25, кв. 12, Минск'
    },
    {
      id: 2,
      client: 'Михаил Сидоров',
      service: 'Установка розеток',
      date: '23.12.2024',
      time: '10:00',
      status: 'confirmed',
      price: '90 BYN',
      address: 'пр. Независимости, д. 78, кв. 45, Минск'
    },
    {
      id: 3,
      client: 'Елена Козлова',
      service: 'Замена проводки',
      date: '24.12.2024',
      time: '16:00',
      status: 'pending',
      price: '480 BYN',
      address: 'ул. Богдановича, д. 34, кв. 8, Минск'
    }
  ]

  const earnings = {
    thisMonth: '2700 BYN',
    lastMonth: '2280 BYN',
    total: '7500 BYN'
  }

  const stats = {
    completedOrders: 45,
    averageRating: 4.8,
    totalReviews: 38,
    responseTime: '2.3 ч'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
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

  const handleOrderAction = (orderId: number, action: 'confirm' | 'reject') => {
    const allOrders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    const updatedOrders = allOrders.map((order: any) => {
      if (order.id === orderId) {
        return {
          ...order,
          status: action === 'confirm' ? 'confirmed' : 'cancelled'
        }
      }
      return order
    })
    
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders))
    loadExecutorOrders() // Перезагружаем заказы
    
    const actionText = action === 'confirm' ? 'подтвержден' : 'отклонен'
    alert(`Заказ ${actionText}!`)
  }

  const handleContactClient = (order: any) => {
    alert(`Контактная информация клиента:\nТелефон: ${order.phone}\nАдрес: ${order.address}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="executor" userName="Исполнитель" notificationsCount={3} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие и статус подписки */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Добро пожаловать! 👋
              </h1>
              <p className="text-gray-600">
                Управляйте заказами и расписанием
              </p>
            </div>
            
            {/* Статус подписки */}
            <div className="mt-4 md:mt-0">
              <div className="card p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    subscription.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{subscription.plan}</p>
                    <p className="text-xs text-gray-500">До {subscription.expiresAt}</p>
                  </div>
                  <span className="text-sm font-medium text-primary-600">{subscription.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Выполнено заказов</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Средний рейтинг</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Время ответа</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseTime}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Заработок за месяц</p>
                <p className="text-2xl font-bold text-gray-900">{earnings.thisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Последние заказы */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Последние заказы
                </h2>
                <Button variant="outline" size="sm">
                  Посмотреть все
                </Button>
              </div>
              
              {(executorOrders.length > 0 ? executorOrders : recentOrders).length > 0 ? (
                <div className="space-y-4">
                  {(executorOrders.length > 0 ? executorOrders : recentOrders).map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{order.service}</h3>
                          <p className="text-sm text-gray-600">Клиент: {order.client || order.name}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">{order.date}</span>
                            <span className="text-sm text-gray-500">{order.time}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{order.address}</p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusText(order.status)}</span>
                          </span>
                          <p className="text-lg font-semibold text-primary-600 mt-1">{order.price}</p>
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
                        {order.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleContactClient(order)}
                          >
                            Связаться с клиентом
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">У вас пока нет заказов</p>
                  <Button className="mt-4" variant="outline">
                    Настроить профиль
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Календарь и быстрые действия */}
          <div className="space-y-6">
            {/* Календарь */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Календарь
              </h2>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric' })}
                </p>
                
                <div className="space-y-2">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <p className="text-sm font-medium text-primary-900">14:00 - Ремонт электрики</p>
                    <p className="text-xs text-primary-700">Анна Петрова • 180 BYN</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">16:00 - Установка розеток</p>
                    <p className="text-xs text-gray-500">Михаил Сидоров • 90 BYN</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Открыть календарь
                </Button>
              </div>
            </div>

            {/* Заработок */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Заработок
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Этот месяц:</span>
                  <span className="text-sm font-medium text-gray-900">{earnings.thisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Прошлый месяц:</span>
                  <span className="text-sm font-medium text-gray-900">{earnings.lastMonth}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Всего:</span>
                  <span className="text-lg font-bold text-primary-600">{earnings.total}</span>
                </div>
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Быстрые действия
              </h2>
              
              <div className="space-y-3">
                <Link href="/dashboard/executor/calendar">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Управлять расписанием
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Посмотреть отзывы
                </Button>
                <Link href="/dashboard/executor/subscription">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Управлять подпиской
                  </Button>
                </Link>
                <Link href="/dashboard/executor/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Профиль
                  </Button>
                </Link>
                <Link href="/dashboard/executor/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 