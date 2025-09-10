'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { safeBase64Encode } from '../../../../lib/utils'
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Violation {
  id: number
  type: string
  reason: string
  severity: number
  createdAt: string
  order: {
    id: number
    serviceDescription: string
    orderDate: string
  }
}

interface BlockStatus {
  isBlocked: boolean
  reason?: string
  blockEndDate?: string
}

export default function ExecutorViolations() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [violations, setViolations] = useState<Violation[]>([])
  const [blockStatus, setBlockStatus] = useState<BlockStatus>({ isBlocked: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('currentUser')
        if (userData) {
          const user = JSON.parse(userData)
          if (user && user.id && user.role === 'executor') {
            setCurrentUser(user)
            return user
          }
        }
        router.push('/auth/login')
        return null
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/login')
        return null
      }
    }

    checkAuth().then(user => {
      if (user) {
        loadViolations(user)
      }
    })
  }, [router])

  const loadViolations = async (user: any) => {
    try {
      const response = await fetch('/api/executor/violations', {
        headers: {
          'Authorization': `Bearer ${safeBase64Encode(JSON.stringify(user))}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setViolations(data.violations)
        setBlockStatus(data.blockStatus)
      } else {
        console.error('Failed to load violations')
      }
    } catch (error) {
      console.error('Error loading violations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityText = (severity: number) => {
    switch (severity) {
      case 1: return 'Предупреждение'
      case 2: return 'Блокировка на 3 дня'
      case 3: return 'Блокировка на 7 дней'
      case 4: return 'Блокировка на 30 дней'
      default: return 'Неизвестно'
    }
  }

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'bg-secondary-100 text-secondary-800'
      case 2: return 'bg-secondary-100 text-secondary-800'
      case 3: return 'bg-red-100 text-red-800'
      case 4: return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            История нарушений
          </h1>
          <p className="text-gray-600">
            Просмотр предупреждений и блокировок
          </p>
        </div>

        {/* Статус блокировки */}
        {blockStatus.isBlocked && (
          <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Аккаунт заблокирован
                </h3>
                <p className="text-red-700 mb-2">{blockStatus.reason}</p>
                {blockStatus.blockEndDate && (
                  <p className="text-red-600 text-sm">
                    Блокировка действует до: {formatDate(blockStatus.blockEndDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-secondary-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Всего нарушений</p>
                <p className="text-2xl font-bold text-gray-900">{violations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Последнее нарушение</p>
                <p className="text-sm font-bold text-gray-900">
                  {violations.length > 0 ? formatDate(violations[0].createdAt) : 'Нет'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-secondary-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Статус</p>
                <p className="text-sm font-bold text-gray-900">
                  {blockStatus.isBlocked ? 'Заблокирован' : 'Активен'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список нарушений */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-gray-900">История нарушений</h2>
          </div>

          {violations.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-secondary-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нарушений не найдено
              </h3>
              <p className="text-gray-600">
                У вас нет нарушений. Продолжайте качественно выполнять заказы!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-200">
              {violations.map((violation) => (
                <div key={violation.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(violation.severity)}`}>
                          {getSeverityText(violation.severity)}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          {formatDate(violation.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {violation.reason}
                      </h3>
                      
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">
                          <strong>Заказ:</strong> {violation.order.serviceDescription}
                        </p>
                        <p>
                          <strong>Дата заказа:</strong> {formatDate(violation.order.orderDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Информация о системе */}
        <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-3">
            Система контроля качества
          </h3>
          <div className="text-sm text-primary-800 space-y-2">
            <p>• <strong>1-е нарушение:</strong> Предупреждение</p>
            <p>• <strong>2-е нарушение:</strong> Блокировка на 3 дня</p>
            <p>• <strong>3-е нарушение:</strong> Блокировка на 7 дней</p>
            <p>• <strong>4-е и последующие:</strong> Блокировка на 30 дней</p>
            <p className="mt-3 text-primary-700">
              <strong>Важно:</strong> Вы можете отменить заказ в течение 12 часов после принятия без последствий.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

