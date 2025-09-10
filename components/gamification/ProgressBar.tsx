'use client'

import React, { useState, useEffect } from 'react'
import { RARITY_COLORS } from '../../lib/gamification/constants'

interface ProgressBarProps {
  currentXp: number
  nextLevelXp: number
  currentLevel: number
  nextLevel: number
  levelTitle: string
  levelIcon: string
  levelColor: string
  className?: string
  animated?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentXp,
  nextLevelXp,
  currentLevel,
  nextLevel,
  levelTitle,
  levelIcon,
  levelColor,
  className = '',
  animated = true
}) => {
  const [displayXp, setDisplayXp] = useState(currentXp)
  const [isLevelingUp, setIsLevelingUp] = useState(false)
  
  // Вычисляем прогресс
  const previousLevelXp = currentLevel === 1 ? 0 : (currentLevel - 1) * 200 // Примерная формула
  const progress = ((currentXp - previousLevelXp) / (nextLevelXp - previousLevelXp)) * 100
  const xpNeeded = nextLevelXp - currentXp

  // Анимация XP
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayXp(currentXp)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayXp(currentXp)
    }
  }, [currentXp, animated])

  // Анимация повышения уровня
  useEffect(() => {
    if (currentLevel > 1) {
      setIsLevelingUp(true)
      const timer = setTimeout(() => setIsLevelingUp(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [currentLevel])

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-secondary-200 transition-all duration-500 ${className} ${
      isLevelingUp ? 'ring-4 ring-secondary-400 ring-opacity-50' : ''
    }`}>
      {/* Заголовок уровня */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`text-3xl transition-transform duration-500 ${
            isLevelingUp ? 'animate-bounce scale-110' : ''
          }`}>
            {levelIcon}
          </span>
          <div>
            <h3 className={`text-xl font-semibold text-gray-900 transition-all duration-500 ${
              isLevelingUp ? 'text-secondary-600' : ''
            }`}>
              {levelTitle}
            </h3>
            <p className="text-sm text-gray-600">Уровень {currentLevel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">До следующего уровня</p>
          <p className={`font-semibold text-lg transition-all duration-500 ${
            isLevelingUp ? 'text-secondary-600 scale-110' : ''
          }`} style={{ color: levelColor }}>
            {xpNeeded} XP
          </p>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-mono">{displayXp} XP</span>
          <span className="font-mono">{nextLevelXp} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ease-out relative ${
              isLevelingUp ? 'animate-pulse' : ''
            }`}
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: isLevelingUp 
                ? 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)'
                : `linear-gradient(90deg, ${levelColor} 0%, ${levelColor}CC 100%)`
            }}
          >
            {/* Блестящий эффект */}
            {isLevelingUp && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
            )}
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm font-medium" style={{ color: levelColor }}>
            {Math.round(progress)}% завершено
          </span>
        </div>
      </div>

      {/* Статистика XP */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{displayXp}</p>
          <p className="text-xs text-gray-600">Текущий XP</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{nextLevelXp - currentXp}</p>
          <p className="text-xs text-gray-600">Осталось</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{nextLevel}</p>
          <p className="text-xs text-gray-600">Следующий</p>
        </div>
      </div>

      {/* Анимация повышения уровня */}
      {isLevelingUp && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-secondary-400 text-secondary-900 px-4 py-2 rounded-full font-bold text-lg animate-bounce">
            🎉 ПОВЫШЕНИЕ УРОВНЯ! 🎉
          </div>
        </div>
      )}
    </div>
  )
}
