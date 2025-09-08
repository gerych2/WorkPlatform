'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, Star, Trophy, Zap, Crown, Gift } from 'lucide-react'

interface AnimatedNotificationProps {
  type: 'level_up' | 'achievement' | 'xp_gain' | 'referral'
  title: string
  description: string
  icon?: string
  xpAmount?: number
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  type,
  title,
  description,
  icon,
  xpAmount,
  isVisible,
  onClose,
  duration = 4000
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // Задержка для анимации выхода
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    if (icon) return <span className="text-4xl">{icon}</span>
    
    switch (type) {
      case 'level_up':
        return <Crown className="h-8 w-8 text-yellow-500" />
      case 'achievement':
        return <Trophy className="h-8 w-8 text-purple-500" />
      case 'xp_gain':
        return <Zap className="h-8 w-8 text-blue-500" />
      case 'referral':
        return <Gift className="h-8 w-8 text-green-500" />
      default:
        return <Star className="h-8 w-8 text-gray-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'level_up':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'achievement':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'xp_gain':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      case 'referral':
        return 'bg-gradient-to-r from-green-500 to-emerald-500'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out ${
        isAnimating
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div
        className={`${getBackgroundColor()} text-white rounded-lg shadow-2xl p-4 min-w-80 max-w-96 relative overflow-hidden`}
      >
        {/* Анимированный фон */}
        <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
        
        {/* Контент */}
        <div className="relative z-10 flex items-start space-x-3">
          {/* Иконка с анимацией */}
          <div className="flex-shrink-0 animate-bounce">
            {getIcon()}
          </div>
          
          {/* Текст */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1">
              {title}
            </h3>
            <p className="text-white/90 text-sm mb-2">
              {description}
            </p>
            
            {/* XP анимация */}
            {xpAmount && (
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-yellow-300 font-bold text-lg animate-pulse">
                  +{xpAmount} XP
                </span>
              </div>
            )}
          </div>
          
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            <CheckCircle className="h-5 w-5" />
          </button>
        </div>
        
        {/* Прогресс-бар */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white/50 transition-all duration-100 ease-linear"
            style={{
              width: isAnimating ? '100%' : '0%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Компонент для множественных уведомлений
export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'level_up' | 'achievement' | 'xp_gain' | 'referral'
    title: string
    description: string
    icon?: string
    xpAmount?: number
  }>>([])

  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Экспортируем функцию для использования в других компонентах
  React.useEffect(() => {
    (window as any).addGamificationNotification = addNotification
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300"
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index
          }}
        >
          <AnimatedNotification
            {...notification}
            isVisible={true}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  )
}
