'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

           const handleLogout = () => {
           localStorage.removeItem('currentUser')
           localStorage.removeItem('adminAuth')
           setCurrentUser(null)
           console.log('Выход выполнен')
           // Принудительно перезагружаем страницу для полной очистки
           window.location.reload()
         }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Попытка входа с email:', email)
      
      // Очищаем старые данные перед новым входом
      localStorage.removeItem('currentUser')
      localStorage.removeItem('adminAuth')
      
      // Аутентификация через API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Ошибка входа')
        return
      }

      const result = await response.json()
      const user = result.user
      
      console.log('Результат аутентификации:', user)
      
      if (user) {
        console.log('Пользователь найден, роль:', user.role)
        
        // Добавляем время последнего входа
        const userWithLoginTime = {
          ...user,
          lastLogin: new Date().toISOString()
        }
        
        // Сохраняем пользователя в localStorage
        localStorage.setItem('currentUser', JSON.stringify(userWithLoginTime))
        console.log('Пользователь сохранен в localStorage')
        
        // Обновляем текущего пользователя в состоянии
        setCurrentUser(userWithLoginTime)
        console.log('Текущий пользователь обновлен:', userWithLoginTime)
        
        // Очищаем форму
        setEmail('')
        setPassword('')
        
        // Показываем обновленного пользователя на 2 секунды, затем редиректим
        setTimeout(() => {
          if (user.role === 'client') {
            console.log('Перенаправление на кабинет клиента')
            router.push('/dashboard/client')
          } else if (user.role === 'executor') {
            console.log('Перенаправление на кабинет исполнителя')
            router.push('/dashboard/executor')
          } else if (user.role === 'admin') {
            console.log('Перенаправление на админ панель')
            router.push('/dashboard/admin')
          }
        }, 2000)
      } else {
        console.log('Пользователь не найден')
        setError('Неверный email или пароль')
      }
    } catch (error) {
      console.error('Ошибка входа:', error)
      setError('Произошла ошибка при входе. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  // Проверяем, есть ли активная сессия
  useEffect(() => {
    console.log('Страница входа загружена')
    
    const userStr = localStorage.getItem('currentUser')
    const adminStr = localStorage.getItem('adminAuth')
    
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
      console.log('Найдена сессия пользователя:', user)
    } else if (adminStr) {
      const admin = JSON.parse(adminStr)
      setCurrentUser(admin)
      console.log('Найдена сессия администратора:', admin)
    } else {
      console.log('Активной сессии нет')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-secondary-100 to-secondary-200 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">
            Вход в ProDoAgency
          </h1>
          <p className="text-gray-600 text-lg">
            Войдите в свой аккаунт для доступа к платформе
          </p>
        </div>

        {/* Информация о текущем пользователе */}
        {currentUser && (
          <div className="mb-6 p-6 bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-300 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-900">
                    {currentUser.name || currentUser.email}
                  </h3>
                  <p className="text-sm text-primary-700 font-medium">
                    Роль: {currentUser.role === 'client' ? 'Клиент' : currentUser.role === 'executor' ? 'Исполнитель' : 'Администратор'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 transition-colors"
              >
                Выйти
              </Button>
            </div>
          </div>
        )}

        {/* Форма входа */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-secondary-200">
          {!currentUser ? (
            <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email адрес
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                                     placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-xs font-bold">@</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                Пароль
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите ваш пароль"
                  autoComplete="off"
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 no-password-icon"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-secondary-50 rounded-r-xl transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  )}
                </button>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">🔒</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Кнопка входа */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Вход...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Войти в систему</span>
                </div>
              )}
            </Button>
          </form>
                    ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Вы уже авторизованы!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Используйте кнопку "Выйти" выше, чтобы войти под другим пользователем
              </p>
              <div className="p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-300 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 bg-primary-600 rounded-full animate-pulse"></div>
                  <p className="text-primary-700 font-medium">
                    ⏰ Через 2 секунды вы будете перенаправлены в ваш кабинет
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ссылка на регистрацию */}
        <div className="mt-8 text-center">
          <div className="p-4 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200">
            <p className="text-gray-600 text-lg">
              Нет аккаунта?{' '}
              <a 
                href="/auth/register" 
                className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-4 hover:decoration-primary-400 transition-all duration-200"
              >
                Зарегистрироваться
              </a>
            </p>
          </div>
        </div>
        
        {/* Кнопка выхода */}
        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              localStorage.removeItem('currentUser')
              localStorage.removeItem('adminAuth')
              window.location.reload()
            }}
            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            🚪 Выйти из системы
          </button>
        </div>
      </div>
    </div>
  )
}