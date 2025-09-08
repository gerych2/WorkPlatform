'use client'

import React, { useState, useEffect } from 'react'
import { AchievementCard } from './AchievementCard'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
  earnedAt?: string
  isNotified?: boolean
}

interface AchievementListProps {
  userId: number
  className?: string
}

export const AchievementList: React.FC<AchievementListProps> = ({
  userId,
  className = ''
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all')

  useEffect(() => {
    fetchAchievements()
  }, [userId])

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/gamification/achievements?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setAchievements(data.data)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = achievements.filter(achievement => 
    filter === 'all' || achievement.rarity === filter
  )

  const achievementsByRarity = {
    common: achievements.filter(a => a.rarity === 'common').length,
    rare: achievements.filter(a => a.rarity === 'rare').length,
    epic: achievements.filter(a => a.rarity === 'epic').length,
    legendary: achievements.filter(a => a.rarity === 'legendary').length
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border border-secondary-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-secondary-200 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">🏆 Достижения</h2>
        <div className="text-sm text-gray-600">
          {achievements.length} из {Object.values(achievementsByRarity).reduce((a, b) => a + b, 0)}
        </div>
      </div>

      {/* Статистика по редкости */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-500">{achievementsByRarity.common}</div>
          <div className="text-xs text-gray-600">⚪ Обычные</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{achievementsByRarity.rare}</div>
          <div className="text-xs text-gray-600">🔵 Редкие</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">{achievementsByRarity.epic}</div>
          <div className="text-xs text-gray-600">🟣 Эпические</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{achievementsByRarity.legendary}</div>
          <div className="text-xs text-gray-600">🟠 Легендарные</div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'Все', icon: '🎯' },
          { key: 'common', label: 'Обычные', icon: '⚪' },
          { key: 'rare', label: 'Редкие', icon: '🔵' },
          { key: 'epic', label: 'Эпические', icon: '🟣' },
          { key: 'legendary', label: 'Легендарные', icon: '🟠' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Список достижений */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              {...achievement}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-gray-600 mb-2">
            {filter === 'all' 
              ? 'У вас пока нет достижений' 
              : `Нет достижений редкости "${filter}"`
            }
          </p>
          <p className="text-sm text-gray-500">
            Выполняйте заказы и получайте награды!
          </p>
        </div>
      )}
    </div>
  )
}
