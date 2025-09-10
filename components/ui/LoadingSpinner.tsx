import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Загрузка...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Анимированный спиннер с градиентом */}
      <div className="relative">
        {/* Внешнее кольцо */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}></div>
        
        {/* Внутреннее кольцо с градиентом */}
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-primary-500 border-r-secondary-500 animate-spin`}></div>
        
        {/* Центральная точка */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse"></div>
      </div>
      
      {/* Текст загрузки */}
      {text && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 font-medium animate-pulse">{text}</p>
          {/* Анимированные точки */}
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Компонент для полноэкранной загрузки
export const FullScreenLoader: React.FC<{ text?: string }> = ({ text = 'Загрузка...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
        
        {/* Дополнительные анимированные элементы */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-secondary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-primary-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          <div className="text-white/60 text-sm">
            Пожалуйста, подождите...
          </div>
        </div>
      </div>
    </div>
  )
}

// Компонент для загрузки кнопок
export const ButtonLoader: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6'
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full border-2 border-white/30 border-t-white animate-spin`}></div>
  )
}

