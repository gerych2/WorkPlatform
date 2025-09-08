'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  Loader2,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import SupportSystem from '../../../../components/support/SupportSystem'

export default function ExecutorSettings() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')

  // Настройки уведомлений
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    newOrders: true,
    promotions: false,
    securityAlerts: true
  })

  // Настройки рабочего времени
  const [workingHours, setWorkingHours] = useState({
    monday: { start: '09:00', end: '18:00', isWorking: true },
    tuesday: { start: '09:00', end: '18:00', isWorking: true },
    wednesday: { start: '09:00', end: '18:00', isWorking: true },
    thursday: { start: '09:00', end: '18:00', isWorking: true },
    friday: { start: '09:00', end: '18:00', isWorking: true },
    saturday: { start: '10:00', end: '16:00', isWorking: true },
    sunday: { start: '10:00', end: '16:00', isWorking: false }
  })

  // Настройки конфиденциальности
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showPhone: true,
    showEmail: false,
    allowMessages: true,
    showLocation: true
  })

  // Смена пароля
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Проверяем аутентификацию
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user && user.id && user.role === 'executor') {
            setCurrentUser(user)
            setIsAuthenticated(true)
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
        loadSettings()
      }
    })
  }, [router])

  const loadSettings = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API для загрузки настроек
      // Пока используем значения по умолчанию
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setIsLoading(false)
    }
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }))
  }

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handlePrivacyChange = (field: string, value: string | boolean) => {
    setPrivacy(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Текущий пароль обязателен'
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Новый пароль обязателен'
    }
    if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Пароль должен содержать минимум 6 символов'
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      // В реальном приложении здесь был бы запрос к API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Настройки уведомлений сохранены!')
    } catch (error) {
      console.error('Error saving notifications:', error)
      alert('Ошибка при сохранении настроек')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveWorkingHours = async () => {
    setIsSaving(true)
    try {
      // В реальном приложении здесь был бы запрос к API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Рабочее время сохранено!')
    } catch (error) {
      console.error('Error saving working hours:', error)
      alert('Ошибка при сохранении настроек')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePrivacy = async () => {
    setIsSaving(true)
    try {
      // В реальном приложении здесь был бы запрос к API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Настройки конфиденциальности сохранены!')
    } catch (error) {
      console.error('Error saving privacy:', error)
      alert('Ошибка при сохранении настроек')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return

    setIsSaving(true)
    try {
      // В реальном приложении здесь был бы запрос к API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Пароль успешно изменен!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Ошибка при смене пароля')
    } finally {
      setIsSaving(false)
    }
  }

  const getDayName = (day: string) => {
    const dayNames: { [key: string]: string } = {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье'
    }
    return dayNames[day] || day
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Проверка аутентификации...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка настроек...</p>
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
            Настройки
          </h1>
          <p className="text-gray-600">
            Управляйте настройками своего аккаунта и рабочего времени
          </p>
        </div>

        {/* Вкладки */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                Уведомления
              </button>
              <button
                onClick={() => setActiveTab('working-hours')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'working-hours'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                Рабочее время
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'privacy'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="h-4 w-4 inline mr-2" />
                Конфиденциальность
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Безопасность
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'support'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Поддержка
              </button>
            </nav>
          </div>
        </div>

        {/* Контент вкладок */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-primary-600" />
              Уведомления
            </h2>
            <Button
              onClick={handleSaveNotifications}
              disabled={isSaving}
              className="flex items-center"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-secondary-100">
              <div>
                <p className="font-medium text-gray-900">Email уведомления</p>
                <p className="text-sm text-gray-600">Получать уведомления на email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-secondary-100">
              <div>
                <p className="font-medium text-gray-900">Новые заказы</p>
                <p className="text-sm text-gray-600">Уведомления о новых заказах в ваших категориях</p>
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

            <div className="flex items-center justify-between py-3 border-b border-secondary-100">
              <div>
                <p className="font-medium text-gray-900">Обновления заказов</p>
                <p className="text-sm text-gray-600">Уведомления о статусе заказов</p>
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

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Безопасность</p>
                <p className="text-sm text-gray-600">Уведомления о безопасности аккаунта</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.securityAlerts}
                  onChange={(e) => handleNotificationChange('securityAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
        )}

        {/* Рабочее время */}
        {activeTab === 'working-hours' && (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Рабочее время
            </h2>
            <Button
              onClick={handleSaveWorkingHours}
              disabled={isSaving}
              className="flex items-center"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours.isWorking}
                      onChange={(e) => handleWorkingHoursChange(day, 'isWorking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium text-gray-900 w-24">{getDayName(day)}</span>
                </div>
                
                {hours.isWorking && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                      className="px-3 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                      className="px-3 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Настройки конфиденциальности */}
        {activeTab === 'privacy' && (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary-600" />
              Конфиденциальность
            </h2>
            <Button
              onClick={handleSavePrivacy}
              disabled={isSaving}
              className="flex items-center"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-secondary-100">
              <div>
                <p className="font-medium text-gray-900">Видимость профиля</p>
                <p className="text-sm text-gray-600">Кто может видеть ваш профиль</p>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              >
                <option value="public">Публичный</option>
                <option value="private">Приватный</option>
                <option value="subscribers">Только подписчики</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-secondary-100">
              <div>
                <p className="font-medium text-gray-900">Показывать телефон</p>
                <p className="text-sm text-gray-600">Отображать номер телефона в профиле</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-secondary-100">
              <div>
                <p className="font-medium text-gray-900">Показывать местоположение</p>
                <p className="text-sm text-gray-600">Отображать город в профиле</p>
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

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Разрешить сообщения</p>
                <p className="text-sm text-gray-600">Позволить клиентам писать вам</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.allowMessages}
                  onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
        )}

        {/* Смена пароля */}
        {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-primary-600" />
            Смена пароля
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Текущий пароль
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className={passwordErrors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Новый пароль
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className={passwordErrors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подтвердите новый пароль
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className={passwordErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                onClick={handleChangePassword}
                disabled={isSaving}
                className="flex items-center"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Изменение...' : 'Изменить пароль'}
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Служба поддержки */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8">
            <SupportSystem userId={currentUser?.id || 1} />
          </div>
        )}
      </div>
    </div>
  )
}