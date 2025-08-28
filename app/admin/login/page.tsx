'use client'

import React, { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Список разрешенных администраторов (в реальном проекте это будет в БД)
  const allowedAdmins = [
    { email: 'admin@serviceplatform.by', password: 'admin123', name: 'Главный администратор' },
    { email: 'manager@serviceplatform.by', password: 'manager123', name: 'Менеджер платформы' }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Проверка учетных данных
    const admin = allowedAdmins.find(
      a => a.email === email && a.password === password
    )

    if (admin) {
      // В реальном проекте здесь будет JWT токен
      localStorage.setItem('adminAuth', JSON.stringify({
        email: admin.email,
        name: admin.name,
        role: 'admin',
        timestamp: Date.now()
      }))
      
      router.push('/admin')
    } else {
      setError('Неверный email или пароль')
    }

    setIsLoading(false)
  }

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (auth) {
      const authData = JSON.parse(auth)
      // Проверяем, не истек ли токен (24 часа)
      if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
        router.push('/admin')
        return
      } else {
        localStorage.removeItem('adminAuth')
      }
    }
  }

  // Проверяем аутентификацию при загрузке
  React.useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Админ-панель
          </h1>
          <p className="text-gray-600">
            Войдите в систему управления платформой
          </p>
        </div>

        {/* Форма входа */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email администратора
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@serviceplatform.by"
                required
                className="w-full"
              />
            </div>

            {/* Пароль */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
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
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Вход...' : 'Войти в админ-панель'}
            </Button>
          </form>


        </div>

        {/* Информация о безопасности */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ⚠️ Доступ только для уполномоченных сотрудников платформы
          </p>
        </div>
      </div>
    </div>
  )
} 