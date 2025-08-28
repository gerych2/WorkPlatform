'use client'

import React, { useState } from 'react'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Bell, Shield, Eye, Lock, Smartphone, Mail, Globe, Clock, User, MapPin } from 'lucide-react'

export default function ClientSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    newOrders: true,
    orderUpdates: true,
    promotions: false,
    reminders: true
  })

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showOrders: false,
    showReviews: true,
    showLocation: false
  })

  const [preferences, setPreferences] = useState({
    language: 'ru',
    timezone: 'Europe/Minsk',
    currency: 'BYN',
    autoReminders: true
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginNotifications: true,
    sessionTimeout: 30 // минуты
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSecurityChange = (key: string, value: any) => {
    setSecurity(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    localStorage.setItem('clientSettings', JSON.stringify({
      notifications,
      privacy,
      preferences,
      security
    }))
    alert('Настройки сохранены!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="client" userName="Клиент" notificationsCount={2} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Настройки
          </h1>
          <p className="text-gray-600">
            Управляйте настройками аккаунта и предпочтениями
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
                    <p className="text-sm text-gray-600">Получать SMS о статусе заказов</p>
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
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Напоминания</h4>
                    <p className="text-sm text-gray-600">Напоминания о предстоящих заказах</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.reminders}
                    onChange={(e) => handleNotificationChange('reminders', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">Акции и предложения</h4>
                    <p className="text-sm text-gray-600">Получать информацию об акциях</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.promotions}
                    onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Предпочтения */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Предпочтения
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Язык
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="input-field"
                  >
                    <option value="ru">Русский</option>
                    <option value="be">Беларуская</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Часовой пояс
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    className="input-field"
                  >
                    <option value="Europe/Minsk">Минск (UTC+3)</option>
                    <option value="Europe/London">Лондон (UTC+0)</option>
                    <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Валюта
                  </label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="input-field"
                  >
                    <option value="BYN">Белорусский рубль (BYN)</option>
                    <option value="USD">Доллар США (USD)</option>
                    <option value="EUR">Евро (EUR)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Автоматические напоминания</h4>
                    <p className="text-sm text-gray-600">Напоминания о заказах</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={preferences.autoReminders}
                      onChange={(e) => handlePreferenceChange('autoReminders', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
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
                  <p className="text-sm text-gray-600">Мастера могут видеть ваш профиль</p>
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
                  <h4 className="font-medium text-gray-900">Показывать местоположение</h4>
                  <p className="text-sm text-gray-600">Мастера видят ваш район</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={privacy.showLocation}
                    onChange={(e) => handlePrivacyChange('showLocation', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Показывать отзывы</h4>
                  <p className="text-sm text-gray-600">Ваши отзывы видны мастерам</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={privacy.showReviews}
                    onChange={(e) => handlePrivacyChange('showReviews', e.target.checked)}
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

              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Таймаут сессии (минуты)
                </label>
                <input
                  type="number"
                  value={security.sessionTimeout}
                  onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                  className="input-field"
                  min="15"
                  max="120"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Автоматический выход из аккаунта при неактивности
                </p>
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