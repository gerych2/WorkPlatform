'use client'

import React, { useState, useEffect } from 'react'
import { ProgressBar } from './ProgressBar'
import { AchievementList } from './AchievementList'
import { ReferralSystem } from './ReferralSystem'
import { Loader2, Trophy, Users, Zap, Star, CreditCard, Crown } from 'lucide-react'

interface GamificationData {
  user: {
    id: number
    name: string
    email: string
    role: string
  }
  level: {
    level: number
    title: string
    icon: string
    color: string
  }
  xp: {
    current: number
    total: number
    daily: number
    weekly: number
    monthly: number
  }
  achievements: {
    total: number
    recent: any[]
    byRarity: {
      common: number
      rare: number
      epic: number
      legendary: number
    }
  }
  nextLevel: {
    level: number
    title: string
    icon: string
    xpNeeded: number
    progress: number
  } | null
}

interface GamificationDashboardProps {
  userId: number
  className?: string
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [data, setData] = useState<GamificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'referrals' | 'subscription'>('overview')

  useEffect(() => {
    fetchGamificationData()
  }, [userId])

  const fetchGamificationData = async () => {
    try {
      const response = await fetch(`/api/gamification/stats?userId=${userId}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border border-secondary-200 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mr-3" />
          <span className="text-gray-600">Загрузка данных геймификации...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border border-secondary-200 ${className}`}>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-600 mb-4">Не удалось загрузить данные геймификации</p>
          <button
            onClick={fetchGamificationData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Добро пожаловать, {data.user.name}! 👋
            </h1>
            <p className="text-primary-100">
              Уровень {data.level.level} • {data.level.title} {data.level.icon}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data.xp.current}</div>
            <div className="text-primary-100">XP</div>
          </div>
        </div>
      </div>

      {/* Прогресс-бар */}
      {data.nextLevel && (
        <ProgressBar
          currentXp={data.xp.current}
          nextLevelXp={data.nextLevel.xpNeeded + data.xp.current}
          currentLevel={data.level.level}
          nextLevel={data.nextLevel.level}
          levelTitle={data.level.title}
          levelIcon={data.level.icon}
          levelColor={data.level.color}
        />
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-secondary-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Сегодня</p>
              <p className="text-2xl font-bold text-gray-900">{data.xp.daily}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-secondary-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">За неделю</p>
              <p className="text-2xl font-bold text-gray-900">{data.xp.weekly}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-secondary-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Достижения</p>
              <p className="text-2xl font-bold text-gray-900">{data.achievements.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-secondary-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              {data.user.role === 'executor' ? (
                <CreditCard className="h-6 w-6 text-orange-600" />
              ) : (
                <Users className="h-6 w-6 text-orange-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {data.user.role === 'executor' ? 'Подписка' : 'Рефералы'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.user.role === 'executor' ? 'Активна' : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Обзор', icon: '📊' },
              { key: 'achievements', label: 'Достижения', icon: '🏆' },
              { key: 'referrals', label: 'Рефералы', icon: '👥' },
              ...(data.user.role === 'executor' ? [{ key: 'subscription', label: 'Подписка', icon: '💳' }] : [])
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние достижения</h3>
                {data.achievements.recent.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.achievements.recent.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{achievement.title}</div>
                          <div className="text-sm text-gray-600">+{achievement.xpReward} XP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">У вас пока нет достижений</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика по редкости</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500">{data.achievements.byRarity.common}</div>
                    <div className="text-sm text-gray-600">⚪ Обычные</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{data.achievements.byRarity.rare}</div>
                    <div className="text-sm text-gray-600">🔵 Редкие</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{data.achievements.byRarity.epic}</div>
                    <div className="text-sm text-gray-600">🟣 Эпические</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{data.achievements.byRarity.legendary}</div>
                    <div className="text-sm text-gray-600">🟠 Легендарные</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <AchievementList userId={userId} />
          )}

          {activeTab === 'referrals' && (
            <ReferralSystem userId={userId} />
          )}

          {activeTab === 'subscription' && data.user.role === 'executor' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Подписка исполнителя</h3>
                <p className="text-gray-600 mb-6">
                  Оформите подписку, чтобы получить больше возможностей и заработать XP!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">Месячная</div>
                    <div className="text-4xl font-bold text-primary-600 mb-4">$29</div>
                    <div className="text-sm text-gray-600 mb-6">в месяц</div>
                    <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                      Оформить
                    </button>
                  </div>
                </div>

                <div className="border-2 border-primary-500 rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Рекомендуется
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">Годовая</div>
                    <div className="text-4xl font-bold text-primary-600 mb-4">$299</div>
                    <div className="text-sm text-gray-600 mb-6">в год (экономия 15%)</div>
                    <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                      Оформить
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">Пожизненная</div>
                    <div className="text-4xl font-bold text-primary-600 mb-4">$999</div>
                    <div className="text-sm text-gray-600 mb-6">одноразово</div>
                    <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                      Оформить
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">🎯 Бонусы за подписку:</h4>
                <ul className="space-y-2 text-blue-800">
                  <li>• +200 XP за первую подписку</li>
                  <li>• +100 XP за каждый месяц продления</li>
                  <li>• Приоритет в поиске (+30-70%)</li>
                  <li>• Эксклюзивные заказы</li>
                  <li>• Расширенная аналитика</li>
                  <li>• VIP поддержка</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
