'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'

export default function DebugPage() {
  const [localStorageData, setLocalStorageData] = useState<any>({})
  const [currentUser, setCurrentUser] = useState<any>(null)

  const refreshData = () => {
    const data: any = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '')
        } catch {
          data[key] = localStorage.getItem(key)
        }
      }
    }
    setLocalStorageData(data)
    
    const userData = localStorage.getItem('current_user')
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData))
      } catch {
        setCurrentUser(null)
      }
    } else {
      setCurrentUser(null)
    }
  }

  const clearAllData = () => {
    localStorage.clear()
    refreshData()
  }

  const createTestData = () => {
    // Создаем тестовые данные
    const testUsers = [
      {
        id: '1',
        name: 'Тестовый клиент',
        email: 'client@example.com',
        phone: '+375 (29) 123-45-67',
        role: 'client',
        status: 'active',
        registrationDate: '01.01.2024',
        lastLogin: '01.01.2024',
        location: 'Минск',
        isVerified: true
      },
      {
        id: '2',
        name: 'Тестовый исполнитель',
        email: 'executor@example.com',
        phone: '+375 (29) 987-65-43',
        role: 'executor',
        status: 'active',
        registrationDate: '01.01.2024',
        lastLogin: '01.01.2024',
        location: 'Минск',
        isVerified: true,
        legalStatus: 'ИП'
      }
    ]
    
    localStorage.setItem('platform_users', JSON.stringify(testUsers))
    refreshData()
  }

  useEffect(() => {
    refreshData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Страница отладки</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Текущий пользователь */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">👤 Текущий пользователь</h2>
            {currentUser ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {currentUser.id}</p>
                <p><strong>Имя:</strong> {currentUser.name}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Роль:</strong> {currentUser.role}</p>
                <p><strong>Статус:</strong> {currentUser.status}</p>
                <p><strong>Местоположение:</strong> {currentUser.location}</p>
              </div>
            ) : (
              <p className="text-gray-500">Пользователь не авторизован</p>
            )}
          </div>

          {/* Действия */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Действия</h2>
            <div className="space-y-3">
              <Button onClick={refreshData} className="w-full">
                Обновить данные
              </Button>
              <Button onClick={createTestData} variant="outline" className="w-full">
                Создать тестовые данные
              </Button>
              <Button onClick={clearAllData} variant="outline" className="w-full">
                Очистить все данные
              </Button>
            </div>
          </div>
        </div>

        {/* Все данные localStorage */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💾 Все данные localStorage</h2>
          <div className="space-y-4">
            {Object.entries(localStorageData).map(([key, value]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{key}</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Ссылки для тестирования */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🧪 Тестирование</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/auth/login" className="block">
              <Button variant="outline" className="w-full">
                Страница входа
              </Button>
            </a>
            <a href="/dashboard/client" className="block">
              <Button variant="outline" className="w-full">
                Кабинет клиента
              </Button>
            </a>
            <a href="/dashboard/executor" className="block">
              <Button variant="outline" className="w-full">
                Кабинет исполнителя
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 