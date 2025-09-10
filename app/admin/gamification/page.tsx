'use client'

import React, { useState, useEffect } from 'react'
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Award, 
  Zap, 
  Crown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Star,
  Gift
} from 'lucide-react'

interface GamificationStats {
  totalUsers: number
  activeUsers: number
  totalXpEarned: number
  totalAchievements: number
  levelDistribution: Array<{ level: number; count: number; title: string }>
  achievementStats: Array<{ id: string; title: string; earned: number; total: number }>
  xpHistory: Array<{ date: string; xp: number }>
  referralStats: {
    totalReferrals: number
    successfulReferrals: number
    referralRate: number
  }
  subscriptionStats: {
    totalSubscriptions: number
    monthlyRevenue: number
    conversionRate: number
  }
}

export default function AdminGamificationPage() {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'achievements' | 'referrals' | 'subscriptions'>('overview')

  useEffect(() => {
    fetchGamificationStats()
  }, [])

  const fetchGamificationStats = async () => {
    try {
      // Здесь будет реальный API вызов
      // Пока используем моковые данные
      const mockStats: GamificationStats = {
        totalUsers: 1250,
        activeUsers: 890,
        totalXpEarned: 45670,
        totalAchievements: 2340,
        levelDistribution: [
          { level: 1, count: 450, title: 'Новичок' },
          { level: 2, count: 320, title: 'Активный' },
          { level: 3, count: 280, title: 'Профи' },
          { level: 4, count: 150, title: 'Мастер' },
          { level: 5, count: 50, title: 'Эксперт' }
        ],
        achievementStats: [
          { id: '1', title: 'Первый поиск', earned: 890, total: 1250 },
          { id: '2', title: 'Критик', earned: 450, total: 1250 },
          { id: '3', title: 'Первая подписка', earned: 320, total: 1250 },
          { id: '4', title: 'Друг платформы', earned: 180, total: 1250 }
        ],
        xpHistory: [
          { date: '2024-01-01', xp: 1200 },
          { date: '2024-01-02', xp: 1500 },
          { date: '2024-01-03', xp: 1800 },
          { date: '2024-01-04', xp: 2100 },
          { date: '2024-01-05', xp: 2400 }
        ],
        referralStats: {
          totalReferrals: 450,
          successfulReferrals: 320,
          referralRate: 71.1
        },
        subscriptionStats: {
          totalSubscriptions: 320,
          monthlyRevenue: 9280,
          conversionRate: 25.6
        }
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching gamification stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки</h1>
            <p className="text-gray-600">Не удалось загрузить статистику геймификации</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Аналитика геймификации
          </h1>
          <p className="text-gray-600">
            Отслеживайте эффективность системы геймификации и вовлеченность пользователей
          </p>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <Activity className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активных пользователей</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего XP заработано</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalXpEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <Trophy className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Достижений получено</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAchievements.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Обзор', icon: '📊' },
                { key: 'users', label: 'Пользователи', icon: '👥' },
                { key: 'achievements', label: 'Достижения', icon: '🏆' },
                { key: 'referrals', label: 'Рефералы', icon: '🎁' },
                { key: 'subscriptions', label: 'Подписки', icon: '💳' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Распределение по уровням */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение по уровням</h3>
                  <div className="space-y-3">
                    {stats.levelDistribution.map((level) => (
                      <div key={level.level} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">
                            Уровень {level.level} • {level.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(level.count / stats.totalUsers) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {level.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Статистика достижений */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярные достижения</h3>
                  <div className="space-y-3">
                    {stats.achievementStats.map((achievement) => (
                      <div key={achievement.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {achievement.title}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-secondary-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(achievement.earned / achievement.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {achievement.earned}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Активность пользователей</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {stats.activeUsers} из {stats.totalUsers} пользователей активны
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Средний XP на пользователя</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {Math.round(stats.totalXpEarned / stats.totalUsers)}
                      </div>
                      <p className="text-sm text-gray-600">XP в среднем</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-primary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-primary-900">Всего достижений</p>
                        <p className="text-2xl font-bold text-primary-600">{stats.totalAchievements}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-secondary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-secondary-900">Среднее на пользователя</p>
                        <p className="text-2xl font-bold text-secondary-600">
                          {Math.round(stats.totalAchievements / stats.totalUsers)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-primary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-primary-900">Процент получения</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {((stats.totalAchievements / stats.totalUsers) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Gift className="h-8 w-8 text-secondary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-secondary-900">Всего рефералов</p>
                        <p className="text-2xl font-bold text-secondary-600">{stats.referralStats.totalReferrals}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-primary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-primary-900">Успешных рефералов</p>
                        <p className="text-2xl font-bold text-primary-600">{stats.referralStats.successfulReferrals}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-primary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-primary-900">Конверсия рефералов</p>
                        <p className="text-2xl font-bold text-primary-600">{stats.referralStats.referralRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Crown className="h-8 w-8 text-secondary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-secondary-900">Всего подписок</p>
                        <p className="text-2xl font-bold text-secondary-600">{stats.subscriptionStats.totalSubscriptions}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-primary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-primary-900">Месячная выручка</p>
                        <p className="text-2xl font-bold text-primary-600">${stats.subscriptionStats.monthlyRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-primary-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-primary-900">Конверсия в подписку</p>
                        <p className="text-2xl font-bold text-primary-600">{stats.subscriptionStats.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


