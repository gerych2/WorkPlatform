'use client'

import React from 'react'
import { RARITY_COLORS, RARITY_ICONS } from '../../lib/gamification/constants'

interface AchievementCardProps {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
  earnedAt?: string
  isNotified?: boolean
  className?: string
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  id,
  title,
  description,
  icon,
  rarity,
  xpReward,
  earnedAt,
  isNotified = false,
  className = ''
}) => {
  const rarityColor = RARITY_COLORS[rarity]
  const rarityIcon = RARITY_ICONS[rarity]

  return (
    <div className={`relative bg-white rounded-lg p-4 shadow-sm border-2 transition-all duration-200 hover:shadow-md ${className}`}
         style={{ borderColor: rarityColor + '40' }}>
      
      {/* Индикатор редкости */}
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
           style={{ backgroundColor: rarityColor }}>
        {rarityIcon}
      </div>

      {/* Анимация для новых достижений */}
      {!isNotified && earnedAt && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-secondary-400 rounded-full animate-ping" />
      )}

      <div className="flex items-start space-x-3">
        {/* Иконка достижения */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
               style={{ backgroundColor: rarityColor + '20' }}>
            {icon}
          </div>
        </div>

        {/* Содержимое */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          
          {/* Награда XP */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Награда:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
              +{xpReward} XP
            </span>
          </div>

          {/* Дата получения */}
          {earnedAt && (
            <div className="mt-2 text-xs text-gray-500">
              Получено: {new Date(earnedAt).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      </div>

      {/* Эффект свечения для легендарных достижений */}
      {rarity === 'legendary' && (
        <div className="absolute inset-0 rounded-lg opacity-20 animate-pulse"
             style={{ 
               background: `radial-gradient(circle at center, ${rarityColor} 0%, transparent 70%)` 
             }} />
      )}
    </div>
  )
}


