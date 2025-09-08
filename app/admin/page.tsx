'use client'

import React, { useState, useEffect } from 'react'
import AdminGuard from '../../components/auth/AdminGuard'
import { Button } from '../../components/ui/Button'
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  BarChart3,
  Settings,
  UserCheck,
  FileText,
  Tag,
  CreditCard,
  LogOut,
  Trophy,
  Mail,
  MessageSquare
} from 'lucide-react'
import { GamificationDashboard } from '../../components/gamification/GamificationDashboard'
import { AchievementManager } from '../../components/admin/AchievementManager'
import { LevelManager } from '../../components/admin/LevelManager'
import { QuestManager } from '../../components/admin/QuestManager'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalUsers: number
  totalExecutors: number
  totalClients: number
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalRevenue: number
  monthlyRevenue: number
  pendingVerifications: number
  activeSubscriptions: number
  totalCategories: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalExecutors: 0,
    totalClients: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingVerifications: 0,
    activeSubscriptions: 0,
    totalCategories: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gamification' | 'achievements' | 'levels' | 'quests'>('dashboard')
  const router = useRouter()

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth) {
      setAdminInfo(JSON.parse(adminAuth))
    }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Исполнители',
      value: stats.totalExecutors,
      icon: Briefcase,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Клиенты',
      value: stats.totalClients,
      icon: UserCheck,
      color: 'purple',
      change: '+15%'
    },
    {
      title: 'Всего заказов',
      value: stats.totalOrders,
      icon: FileText,
      color: 'orange',
      change: '+23%'
    },
    {
      title: 'Активные заказы',
      value: stats.activeOrders,
      icon: Clock,
      color: 'yellow',
      change: '+5%'
    },
    {
      title: 'Завершенные заказы',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'green',
      change: '+18%'
    },
    {
      title: 'Общая выручка',
      value: `${stats.totalRevenue.toLocaleString()} ₽`,
      icon: DollarSign,
      color: 'emerald',
      change: '+25%'
    },
    {
      title: 'Выручка за месяц',
      value: `${stats.monthlyRevenue.toLocaleString()} ₽`,
      icon: TrendingUp,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Ожидают проверки',
      value: stats.pendingVerifications,
      icon: AlertCircle,
      color: 'red',
      change: '-3%'
    },
    {
      title: 'Активные подписки',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: 'indigo',
      change: '+7%'
    }
  ]

  const quickActions = [
    {
      title: 'Управление категориями',
      description: 'Добавить, редактировать категории услуг',
      icon: Tag,
      href: '/admin/categories',
      color: 'blue'
    },
    {
      title: 'Управление подписками',
      description: 'Просмотр и управление подписками',
      icon: CreditCard,
      href: '/admin/subscriptions',
      color: 'green'
    },
    {
      title: 'Управление пользователями',
      description: 'Просмотр и управление пользователями',
      icon: Users,
      href: '/admin/users',
      color: 'purple'
    },
    {
      title: 'Email рассылка',
      description: 'Отправка сообщений и рассылок',
      icon: Mail,
      href: '/admin/email',
      color: 'green'
    },
    {
      title: 'Служба поддержки',
      description: 'Управление обращениями пользователей',
      icon: MessageSquare,
      href: '/admin/support',
      color: 'purple'
    },
    {
      title: 'Управление заказами',
      description: 'Просмотр и управление заказами',
      icon: FileText,
      href: '/admin/orders',
      color: 'orange'
    },
  ]

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Загрузка данных...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Админ-панель</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Добро пожаловать, {adminInfo?.name}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Выйти</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                      <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.change}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Вкладки */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Дашборд
                </button>
                <button
                  onClick={() => setActiveTab('gamification')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'gamification'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Trophy className="inline h-4 w-4 mr-1" />
                  Аналитика геймификации
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'achievements'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🏆 Достижения
                </button>
                <button
                  onClick={() => setActiveTab('levels')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'levels'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ⭐ Уровни
                </button>
                <button
                  onClick={() => setActiveTab('quests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'quests'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🎯 Задания
                </button>
              </nav>
            </div>
          </div>

          {/* Контент вкладок */}
          {activeTab === 'dashboard' && (
            <>
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Быстрые действия</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={index}
                      onClick={() => router.push(action.href)}
                      className={`p-6 rounded-lg border-2 border-${action.color}-200 hover:border-${action.color}-400 hover:bg-${action.color}-50 transition-all duration-200 text-left group`}
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                        <Icon className={`h-6 w-6 text-${action.color}-600`} />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-gray-900">{action.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">{action.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
            </>
          )}

          {activeTab === 'gamification' && (
            <div className="space-y-6">
              <GamificationDashboard userId={adminInfo?.id || 1} />
            </div>
          )}

          {activeTab === 'achievements' && (
            <AchievementManager />
          )}

          {activeTab === 'levels' && (
            <LevelManager />
          )}

          {activeTab === 'quests' && (
            <QuestManager />
          )}
        </div>
      </div>
    </AdminGuard>
  )
}


