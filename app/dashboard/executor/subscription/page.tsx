'use client'

import React, { useState } from 'react'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Check, Crown, Star, Clock, AlertCircle, CreditCard, Calendar } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  duration: string
  price: number
  originalPrice?: number
  features: string[]
  isPopular?: boolean
  isCurrent?: boolean
}

interface PaymentHistory {
  id: string
  date: string
  plan: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: string
}

export default function ExecutorSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Текущая подписка
  const currentSubscription = {
    status: 'active',
    plan: 'Месячная подписка',
    startDate: '25.12.2024',
    endDate: '25.01.2025',
    price: '180 BYN',
    daysLeft: 3,
    isExpired: false
  }

  // Доступные тарифы для Беларуси
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'daily',
      name: 'Дневная подписка',
      duration: '1 день',
      price: 12,
      features: [
        'Полный доступ к платформе',
        'Получение заказов',
        'Управление расписанием',
        'Поддержка клиентов'
      ]
    },
    {
      id: 'weekly',
      name: 'Недельная подписка',
      duration: '7 дней',
      price: 60,
      originalPrice: 84,
      features: [
        'Все возможности дневной подписки',
        'Приоритет в поиске',
        'Расширенная статистика',
        'Экономия 29%'
      ]
    },
    {
      id: 'monthly',
      name: 'Месячная подписка',
      duration: '30 дней',
      price: 180,
      originalPrice: 360,
      features: [
        'Все возможности недельной подписки',
        'Премиум поддержка',
        'Аналитика и отчеты',
        'Экономия 50%',
        'Рекомендуемый тариф'
      ],
      isPopular: true,
      isCurrent: true
    },
    {
      id: 'quarterly',
      name: 'Квартальная подписка',
      duration: '90 дней',
      price: 480,
      originalPrice: 1080,
      features: [
        'Все возможности месячной подписки',
        'Максимальная экономия',
        'Приоритетная поддержка',
        'Экономия 55%',
        'Бонусные возможности'
      ]
    }
  ]

  // История платежей для Беларуси
  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      date: '25.12.2024',
      plan: 'Месячная подписка',
      amount: 180,
      status: 'completed',
      paymentMethod: 'Банковская карта'
    },
    {
      id: '2',
      date: '25.11.2024',
      plan: 'Месячная подписка',
      amount: 180,
      status: 'completed',
      paymentMethod: 'Банковская карта'
    },
    {
      id: '3',
      date: '25.10.2024',
      plan: 'Недельная подписка',
      amount: 60,
      status: 'completed',
      paymentMethod: 'Банковская карта'
    },
    {
      id: '4',
      date: '18.10.2024',
      plan: 'Дневная подписка',
      amount: 12,
      status: 'completed',
      paymentMethod: 'Банковская карта'
    }
  ]

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId)
    setShowPaymentModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Оплачено'
      case 'pending':
        return 'В обработке'
      case 'failed':
        return 'Ошибка'
      default:
        return 'Неизвестно'
    }
  }

  const getDaysLeftColor = (days: number) => {
    if (days <= 1) return 'text-red-600'
    if (days <= 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="executor" userName="Исполнитель" notificationsCount={3} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление подпиской
          </h1>
          <p className="text-gray-600">
            Выберите подходящий тариф и управляйте своим доступом к платформе в Беларуси
          </p>
        </div>

        {/* Текущая подписка */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Текущая подписка
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    currentSubscription.isExpired ? 'bg-red-400' : 'bg-green-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-900">
                    {currentSubscription.plan}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500">
                  {currentSubscription.startDate} - {currentSubscription.endDate}
                </div>
                
                <div className={`text-sm font-medium ${getDaysLeftColor(currentSubscription.daysLeft)}`}>
                  <Clock className="h-4 w-4 inline mr-1" />
                  Осталось {currentSubscription.daysLeft} {currentSubscription.daysLeft === 1 ? 'день' : 'дня'}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {currentSubscription.price}
              </div>
              <div className="text-sm text-gray-500">
                Стоимость подписки
              </div>
            </div>
          </div>
          
          {currentSubscription.daysLeft <= 3 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Ваша подписка заканчивается через {currentSubscription.daysLeft} {currentSubscription.daysLeft === 1 ? 'день' : 'дня'}. 
                  Продлите подписку, чтобы продолжить получать заказы.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Доступные тарифы */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Выберите тариф
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`card relative ${
                  plan.isPopular ? 'ring-2 ring-primary-500' : ''
                } ${plan.isCurrent ? 'bg-primary-50 border-primary-200' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Популярный
                    </span>
                  </div>
                )}
                
                {plan.isCurrent && (
                  <div className="absolute -top-3 right-3">
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Текущий
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {plan.duration}
                  </p>
                  
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-primary-600">
                      {plan.price}
                    </span>
                    <span className="text-gray-500"> BYN</span>
                    
                    {plan.originalPrice && (
                      <div className="text-sm text-gray-400 line-through">
                        {plan.originalPrice} BYN
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  className="w-full"
                  variant={plan.isCurrent ? 'outline' : 'primary'}
                  disabled={plan.isCurrent}
                  onClick={() => handlePlanSelection(plan.id)}
                >
                  {plan.isCurrent ? 'Текущий тариф' : 'Выбрать тариф'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* История платежей */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            История платежей
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Дата
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Тариф
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Сумма
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Статус
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Способ оплаты
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {payment.date}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {payment.plan}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {payment.amount} BYN
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {payment.paymentMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно оплаты */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Оплата подписки
              </h3>
              
              {selectedPlan && (
                <div className="mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Выбранный тариф:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {subscriptionPlans.find(p => p.id === selectedPlan)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">Стоимость:</span>
                      <span className="text-lg font-bold text-primary-600">
                        {subscriptionPlans.find(p => p.id === selectedPlan)?.price} ₽
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Номер карты
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="input-field"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Срок действия
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя владельца
                  </label>
                  <input
                    type="text"
                    placeholder="Имя клиента"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedPlan('')
                  }}
                >
                  Отмена
                </Button>
                
                <Button onClick={() => {
                  // Здесь будет логика обработки платежа
                  console.log('Обработка платежа для тарифа:', selectedPlan)
                  setShowPaymentModal(false)
                  setSelectedPlan('')
                }}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Оплатить
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 