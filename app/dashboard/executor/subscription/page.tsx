'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { 
  Crown, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Calendar,
  DollarSign,
  Zap,
  Star
} from 'lucide-react'

interface Subscription {
  id: number
  planType: string
  startDate: string
  endDate: string
  status: string
  amount: number
  paymentMethod?: string
}

export default function ExecutorSubscription() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const subscriptionPlans = [
    {
      id: 'daily',
      name: 'Дневная подписка',
      price: 5,
      duration: '1 день',
      features: [
        'Доступ к заказам в ваших категориях',
        'Возможность принимать заказы',
        'Уведомления о новых заказах',
        'Поддержка клиентов'
      ],
      popular: false
    },
    {
      id: 'weekly',
      name: 'Недельная подписка',
      price: 25,
      duration: '7 дней',
      features: [
        'Все преимущества дневной подписки',
        'Приоритет в поиске',
        'Расширенная статистика',
        'Быстрая поддержка'
      ],
      popular: true
    },
    {
      id: 'monthly',
      name: 'Месячная подписка',
      price: 80,
      duration: '30 дней',
      features: [
        'Все преимущества недельной подписки',
        'VIP статус',
        'Персональный менеджер',
        'Скидки на комиссию'
      ],
      popular: false
    }
  ]

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
        fetchSubscriptions(user)
      }
    })
  }, [router])

  const fetchSubscriptions = async (user: any) => {
    try {
      const response = await fetch(`/api/subscriptions?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubscription = async (planType: string) => {
    if (!currentUser) return

    setIsCreating(true)

    try {
      const plan = subscriptionPlans.find(p => p.id === planType)
      if (!plan) return

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(currentUser)).toString('base64')}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          planType,
          amount: plan.price,
          paymentMethod: 'demo' // В реальном приложении здесь будет реальный способ оплаты
        })
      })

      if (response.ok) {
        alert('Подписка успешно оформлена!')
        fetchSubscriptions(currentUser)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Ошибка при оформлении подписки')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Произошла ошибка при оформлении подписки')
    } finally {
      setIsCreating(false)
    }
  }

  const getActiveSubscription = () => {
    return subscriptions.find(sub => 
      sub.status === 'active' && new Date(sub.endDate) > new Date()
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-secondary-600 bg-secondary-100'
      case 'expired': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна'
      case 'expired': return 'Истекла'
      case 'cancelled': return 'Отменена'
      default: return status
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

  const activeSubscription = getActiveSubscription()

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gradient-to-r from-primary-500 to-secondary-600 rounded-2xl p-8 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10 flex items-center">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl mr-6">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Управление подпиской
                  </h1>
                  <p className="text-white/80 text-lg">
                    Оформите подписку для доступа к заказам и развития вашего бизнеса
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Текущая подписка */}
        {activeSubscription && (
          <div className="mb-8 group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl group-hover:rotate-6 transition-transform duration-300">
                    <Crown className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                      Активная подписка
                    </h3>
                    <p className="text-gray-600">
                      {activeSubscription.planType} план • Действует до {new Date(activeSubscription.endDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-primary-600 font-bold text-2xl">
                    {activeSubscription.amount} BYN
                  </span>
                  <p className="text-secondary-600 text-sm">
                    {getStatusText(activeSubscription.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* История подписок */}
        {subscriptions.length > 0 && (
          <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              История подписок
            </h2>
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {subscription.planType} план
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(subscription.startDate).toLocaleDateString('ru-RU')} - {new Date(subscription.endDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">
                      {subscription.amount} BYN
                    </span>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                        {getStatusText(subscription.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Планы подписок */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Выберите план подписки
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-0.5 rounded-2xl blur transition duration-1000 group-hover:duration-200 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-25' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-20'
                }`}></div>
                
                <div className={`relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 ${
                  plan.popular 
                    ? 'ring-2 ring-primary-200' 
                    : ''
                }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Популярный
                    </span>
                  </div>
                )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center space-x-1 mb-2">
                      <span className="text-4xl font-bold text-primary-600">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 text-lg">BYN</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      за {plan.duration}
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="p-1 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-primary-600" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleCreateSubscription(plan.id)}
                    disabled={isCreating || !!activeSubscription}
                    className={`w-full group-hover:scale-105 transition-all duration-200 ${
                      plan.popular 
                        ? 'bg-primary-600 hover:bg-primary-700' 
                        : 'bg-secondary-600 hover:bg-secondary-700'
                    }`}
                  >
                  {isCreating ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Оформление...
                    </div>
                  ) : activeSubscription ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Подписка активна
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Crown className="h-4 w-4 mr-2" />
                      Оформить подписку
                    </div>
                  )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Преимущества подписки */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Преимущества подписки
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Доступ к заказам
              </h3>
              <p className="text-gray-600 text-sm">
                Просматривайте и принимайте заказы в ваших категориях
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Приоритет в поиске
              </h3>
              <p className="text-gray-600 text-sm">
                Ваш профиль отображается выше в результатах поиска
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Больше заказов
              </h3>
              <p className="text-gray-600 text-sm">
                Увеличьте свой доход благодаря большему количеству клиентов
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Поддержка
              </h3>
              <p className="text-gray-600 text-sm">
                Получите приоритетную поддержку от нашей команды
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 