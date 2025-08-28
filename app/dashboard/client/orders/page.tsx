'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Clock, CheckCircle, XCircle, AlertCircle, Star, MessageCircle, Phone } from 'lucide-react'

export default function ClientOrders() {
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [userOrders, setUserOrders] = useState<any[]>([])

  // Загружаем заказы пользователя при монтировании компонента
  useEffect(() => {
    const savedOrders = localStorage.getItem('userOrders')
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders)
        setUserOrders(parsedOrders)
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error)
      }
    }
  }, [])

  const statuses = [
    { value: '', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает подтверждения', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Подтвержден', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'В работе', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Завершен', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Отменен', color: 'bg-red-100 text-red-800' }
  ]

  const periods = [
    { value: '', label: 'Все время' },
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' },
    { value: 'quarter', label: 'За квартал' },
    { value: 'year', label: 'За год' }
  ]

  // Моковые данные заказов
  const orders = [
    {
      id: 1,
      service: 'Ремонт электрики',
              executor: 'Электрик',
      status: 'completed',
      date: '15.12.2024',
      time: '14:00',
      price: '3000 ₽',
      rating: 5,
      review: 'Отличная работа! Мастер пришел вовремя, все сделал качественно и быстро.',
      executorPhone: '+7 (999) 123-45-67',
      address: 'ул. Тверская, д. 15, кв. 23',
      description: 'Нужно починить розетку в спальне и заменить выключатель в коридоре'
    },
    {
      id: 2,
      service: 'Установка сантехники',
              executor: 'Сантехник',
      status: 'in_progress',
      date: '20.12.2024',
      time: '10:00',
      price: '4500 ₽',
      rating: null,
      review: null,
      executorPhone: '+7 (999) 234-56-78',
      address: 'ул. Арбат, д. 8, кв. 45',
      description: 'Установить новую раковину в ванной комнате'
    },
    {
      id: 3,
      service: 'Уборка квартиры',
      executor: 'Елена Смирнова',
      status: 'confirmed',
      date: '22.12.2024',
      time: '16:00',
      price: '1200 ₽',
      rating: null,
      review: null,
      executorPhone: '+7 (999) 345-67-89',
      address: 'ул. Покровка, д. 12, кв. 67',
      description: 'Генеральная уборка двухкомнатной квартиры'
    },
    {
      id: 4,
      service: 'Ремонт компьютера',
      executor: 'Сергей Волков',
      status: 'cancelled',
      date: '18.12.2024',
      time: '12:00',
      price: '2000 ₽',
      rating: null,
      review: null,
      executorPhone: '+7 (999) 456-78-90',
      address: 'ул. Маросейка, д. 5, кв. 12',
      description: 'Удалить вирусы и настроить систему'
    },
    {
      id: 5,
      service: 'Парикмахерские услуги',
      executor: 'Анна Козлова',
      status: 'completed',
      date: '10.12.2024',
      time: '15:00',
      price: '1800 ₽',
      rating: 4,
      review: 'Хорошая стрижка, мастер внимательная. Рекомендую!',
      executorPhone: '+7 (999) 567-89-01',
      address: 'ул. Мясницкая, д. 20, кв. 34',
      description: 'Стрижка и укладка волос'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status)
    return statusObj?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const statusObj = statuses.find(s => s.value === status)
    return statusObj?.label || 'Неизвестно'
  }

  // Используем реальные заказы пользователя или fallback на моковые данные
  const ordersToDisplay = userOrders.length > 0 ? userOrders : orders
  
  const filteredOrders = ordersToDisplay.filter(order => {
    const matchesStatus = !selectedStatus || order.status === selectedStatus
    // Здесь можно добавить фильтрацию по периоду
    return matchesStatus
  })

  const getTotalSpent = () => {
    return filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + parseInt(order.price), 0)
  }

  const getCompletedOrders = () => {
    return filteredOrders.filter(order => order.status === 'completed').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="client" userName="Клиент" notificationsCount={2} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и статистика */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Мои заказы
          </h1>
          <p className="text-gray-600">
            История всех ваших заказов и взаимодействий с мастерами
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Завершено</p>
                <p className="text-2xl font-bold text-gray-900">{getCompletedOrders()}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Потрачено</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalSpent()} ₽</p>
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline" size="sm">
              Экспорт заказов
            </Button>
          </div>
        </div>

        {/* Список заказов */}
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Основная информация */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {order.service}
                      </h3>
                      <p className="text-gray-600">Мастер: {order.executor}</p>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </span>
                      <p className="text-lg font-semibold text-primary-600 mt-1">{order.price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Дата и время</p>
                      <p className="text-gray-900">{order.date} в {order.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Адрес</p>
                      <p className="text-gray-900">{order.address}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Описание заказа</p>
                    <p className="text-gray-900">{order.description}</p>
                  </div>

                  {/* Рейтинг и отзыв */}
                  {order.rating && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{order.rating}/5</span>
                        </div>
                      </div>
                      {order.review && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{order.review}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Действия */}
                <div className="lg:text-right lg:min-w-[200px]">
                  <div className="space-y-3">
                    {/* Кнопки действий в зависимости от статуса */}
                    {order.status === 'pending' && (
                      <>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Написать мастеру
                        </Button>
                        <Button variant="outline" className="w-full">
                          Отменить заказ
                        </Button>
                      </>
                    )}

                    {order.status === 'confirmed' && (
                      <>
                        <Button className="w-full">
                          <Phone className="h-4 w-4 mr-2" />
                          Позвонить мастеру
                        </Button>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Написать сообщение
                        </Button>
                      </>
                    )}

                    {order.status === 'in_progress' && (
                      <>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Связаться с мастером
                        </Button>
                        <Button variant="outline" className="w-full">
                          Отследить прогресс
                        </Button>
                      </>
                    )}

                    {order.status === 'completed' && !order.rating && (
                      <Button className="w-full">
                        <Star className="h-4 w-4 mr-2" />
                        Оставить отзыв
                      </Button>
                    )}

                    {order.status === 'completed' && (
                      <Button variant="outline" className="w-full">
                        Повторить заказ
                      </Button>
                    )}

                    {/* Контактная информация */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Контакт мастера:</p>
                      <p className="text-sm text-gray-900">{order.executorPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Пустое состояние */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Заказы не найдены
            </h3>
            <p className="text-gray-500 mb-6">
              Попробуйте изменить фильтры или создайте новый заказ
            </p>
            <Button>
              Найти мастера
            </Button>
          </div>
        )}
      </main>
    </div>
  )
} 