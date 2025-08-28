'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Header } from '../../../components/layout/Header'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Search, Star, MapPin, Clock, Phone, User, Settings } from 'lucide-react'

export default function ClientDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = [
    'Электрика',
    'Сантехника', 
    'Ремонт техники',
    'Косметология',
    'Ремонт помещений',
    'Уборка',
    'Курьерские услуги',
    'IT услуги',
    'Ремонт обуви',
    'Фотоуслуги'
  ]

  // Моковые данные для демонстрации
  const recentOrders = [
    {
      id: 1,
      service: 'Ремонт электрики',
      executor: 'Электрик',
      status: 'completed',
      date: '15.12.2024',
      rating: 5,
      price: '120 BYN',
      address: 'ул. Ленина, д. 15, кв. 23, Минск'
    },
    {
      id: 2,
      service: 'Установка сантехники',
      executor: 'Дмитрий Козлов',
      status: 'in_progress',
      date: '20.12.2024',
      rating: null,
      price: '150 BYN',
      address: 'ул. Козлова, д. 8, кв. 5, Минск'
    },
    {
      id: 3,
      service: 'Косметология',
      executor: 'Косметолог',
      status: 'pending',
      date: '26.12.2024',
      rating: null,
      price: '85 BYN',
      address: 'пр. Независимости, д. 45, кв. 12, Минск'
    }
  ]

  const topExecutors = [
    {
      id: 1,
      name: 'Электрик',
      category: 'Электрика',
      rating: 4.9,
      reviews: 127,
      price: 'от 120 BYN',
              avatar: 'ЭЛ',
      isOnline: true,
      location: 'Минск, Центральный район'
    },
    {
      id: 2,
      name: 'Косметолог',
      category: 'Косметология',
      rating: 4.8,
      reviews: 89,
      price: 'от 85 BYN',
              avatar: 'КО',
      isOnline: false,
      location: 'Минск, Серебрянка'
    },
    {
      id: 3,
      name: 'Дмитрий Козлов',
      category: 'Сантехника',
      rating: 4.7,
      reviews: 156,
      price: 'от 150 BYN',
      avatar: 'ДК',
      isOnline: true,
      location: 'Минск, Московский район'
    },
    {
      id: 4,
      name: 'Ольга Васильева',
      category: 'Уборка',
      rating: 4.9,
      reviews: 203,
      price: 'от 60 BYN',
      avatar: 'ОВ',
      isOnline: true,
      location: 'Минск, Ленинский район'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершен'
      case 'in_progress':
        return 'В работе'
      case 'pending':
        return 'Ожидает'
      default:
        return 'Неизвестно'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="client" userName="Клиент" notificationsCount={2} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие и быстрые действия */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать! 👋
          </h1>
          <p className="text-gray-600">
            Найдите лучших мастеров для ваших задач
          </p>
        </div>

        {/* Поиск и фильтры */}
        <div className="card mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Поиск мастера
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Что нужно сделать?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Все категории</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <Button className="w-full">
                Найти мастера
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Последние заказы */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Последние заказы
              </h2>
              
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{order.service}</h3>
                          <p className="text-sm text-gray-600">Мастер: {order.executor}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          <div>{order.date}</div>
                          <div className="text-xs text-gray-400">{order.address}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary-600">{order.price}</div>
                          {order.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-700">{order.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">У вас пока нет заказов</p>
                  <Button className="mt-4" variant="outline">
                    Создать первый заказ
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Топ исполнители */}
          <div>
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Топ исполнители
              </h2>
              
              <div className="space-y-4">
                {topExecutors.map(executor => (
                  <div key={executor.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">{executor.avatar}</span>
                        </div>
                        {executor.isOnline && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{executor.name}</h3>
                        <p className="text-sm text-gray-600">{executor.category}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {executor.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-700">{executor.rating}</span>
                        <span className="text-xs text-gray-500">({executor.reviews})</span>
                      </div>
                      <span className="text-sm font-medium text-primary-600">{executor.price}</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        // Сохраняем данные выбранного мастера в localStorage
                        localStorage.setItem('selectedExecutor', JSON.stringify(executor))
                        // Перенаправляем на страницу бронирования
                        window.location.href = '/dashboard/client/booking'
                      }}
                    >
                      Забронировать
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/dashboard/client/search">
                  <Button variant="outline" className="w-full">
                    Посмотреть всех
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="mt-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Быстрые действия
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Link href="/dashboard/client/search">
                <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                  <Search className="h-6 w-6" />
                  <span>Найти мастера</span>
                </Button>
              </Link>
              
              <Link href="/dashboard/client/orders">
                <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                  <Clock className="h-6 w-6" />
                  <span>Мои заказы</span>
                </Button>
              </Link>
              
              <Link href="/dashboard/client/booking">
                <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                  <Phone className="h-6 w-6" />
                  <span>Забронировать услугу</span>
                </Button>
              </Link>

              <Link href="/dashboard/client/profile">
                <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                  <User className="h-6 w-6" />
                  <span>Профиль</span>
                </Button>
              </Link>

              <Link href="/dashboard/client/settings">
                <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                  <Settings className="h-6 w-6" />
                  <span>Настройки</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 