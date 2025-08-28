'use client'

import React, { useState } from 'react'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Bell, Shield, Eye, Lock, Smartphone, Mail, Globe, Clock, DollarSign, Calendar } from 'lucide-react'

export default function ExecutorSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    newOrders: true,
    orderUpdates: true,
    promotions: false
  })

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showOrders: false,
    showReviews: true,
    showSchedule: true
  })

  const [business, setBusiness] = useState({
    autoAccept: false,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    maxOrdersPerDay: 5,
    minAdvanceNotice: 2 // часы
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginNotifications: true
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  const handleBusinessChange = (key: string, value: any) => {
    setBusiness(prev => ({ ...prev, [key]: value }))
  }

  const handleSecurityChange = (key: string, value: boolean) => {
    setSecurity(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    localStorage.setItem('executorSettings', JSON.stringify({
      notifications,
      privacy,
      business,
      security
    }))
    alert('Настройки сохранены!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="executor" userName="Исполнитель" notificationsCount={3} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Настройки
          </h1>
          <p className="text-gray-600">
            Управляйте настройками аккаунта и бизнес-процессами
          </p>
        </div>

        <div className="space-y-6">
          {/* Уведомления */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Уведомления
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Email уведомления</h4>
                    <p className="text-sm text-gray-600">Получать уведомления на email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">SMS уведомления</h4>
                    <p className="text-sm text-gray-600">Получать SMS о новых заказах</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.sms}
                    onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Push уведомления</h4>
                    <p className="text-sm text-gray-600">Получать уведомления в браузере</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Новые заказы</h4>
                    <p className="text-sm text-gray-600">Уведомления о новых заказах</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.newOrders}
                    onChange={(e) => handleNotificationChange('newOrders', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Обновления заказов</h4>
                    <p className="text-sm text-gray-600">Уведомления об изменении статуса</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.orderUpdates}
                    onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Бизнес-настройки */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Бизнес-настройки
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Автоматическое принятие заказов</h4>
                    <p className="text-sm text-gray-600">Автоматически принимать заказы в рабочее время</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={business.autoAccept}
                    onChange={(e) => handleBusinessChange('autoAccept', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Начало рабочего дня
                  </label>
                  <input
                    type="time"
                    value={business.workingHours.start}
                    onChange={(e) => handleBusinessChange('workingHours', { ...business.workingHours, start: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Конец рабочего дня
                  </label>
                  <input
                    type="time"
                    value={business.workingHours.end}
                    onChange={(e) => handleBusinessChange('workingHours', { ...business.workingHours, end: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимум заказов в день
                  </label>
                  <input
                    type="number"
                    value={business.maxOrdersPerDay}
                    onChange={(e) => handleBusinessChange('maxOrdersPerDay', parseInt(e.target.value))}
                    className="input-field"
                    min="1"
                    max="20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Минимальное время предупреждения (часы)
                  </label>
                  <input
                    type="number"
                    value={business.minAdvanceNotice}
                    onChange={(e) => handleBusinessChange('minAdvanceNotice', parseInt(e.target.value))}
                    className="input-field"
                    min="1"
                    max="24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Приватность */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Приватность
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Показывать профиль</h4>
                  <p className="text-sm text-gray-600">Клиенты могут видеть ваш профиль</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={privacy.showProfile}
                    onChange={(e) => handlePrivacyChange('showProfile', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Показывать расписание</h4>
                  <p className="text-sm text-gray-600">Клиенты видят ваши свободные слоты</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={privacy.showSchedule}
                    onChange={(e) => handlePrivacyChange('showSchedule', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Безопасность */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Безопасность
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Двухфакторная аутентификация</h4>
                    <p className="text-sm text-gray-600">Дополнительная защита аккаунта</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={security.twoFactor}
                    onChange={(e) => handleSecurityChange('twoFactor', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Уведомления о входе</h4>
                    <p className="text-sm text-gray-600">Получать уведомления о новых входах</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={security.loginNotifications}
                    onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Кнопка сохранения */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="px-8">
              Сохранить настройки
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 