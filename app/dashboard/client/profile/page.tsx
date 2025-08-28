'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera } from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  avatar: string
  registrationDate: string
  totalOrders: number
  completedOrders: number
  averageRating: number
}

export default function ClientProfile() {
  const [profile, setProfile] = useState<UserProfile>({
          firstName: 'Клиент',
      lastName: '',
      email: 'client@example.com',
    phone: '+375 (29) 123-45-67',
    address: 'Минск, ул. Ленина, д. 15, кв. 23',
    avatar: 'ИИ',
    registrationDate: '15.12.2024',
    totalOrders: 12,
    completedOrders: 8,
    averageRating: 4.8
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<UserProfile>(profile)

  useEffect(() => {
    // Загружаем профиль из localStorage
    const savedProfile = localStorage.getItem('clientProfile')
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(parsedProfile)
        setEditForm(parsedProfile)
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error)
      }
    }
  }, [])

  const handleEdit = () => {
    setEditForm(profile)
    setIsEditing(true)
  }

  const handleSave = () => {
    setProfile(editForm)
    localStorage.setItem('clientProfile', JSON.stringify(editForm))
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole="client" userName={`${profile.firstName} ${profile.lastName}`} notificationsCount={2} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Мой профиль
          </h1>
          <p className="text-gray-600">
            Управляйте личной информацией и настройками аккаунта
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - аватар и статистика */}
          <div className="lg:col-span-1">
            <div className="card">
              {/* Аватар */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-600 font-semibold text-4xl">{profile.avatar}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full p-2"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-sm text-gray-500">Клиент</p>
              </div>

              {/* Статистика */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{profile.totalOrders}</div>
                  <div className="text-sm text-gray-600">Всего заказов</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{profile.completedOrders}</div>
                  <div className="text-sm text-gray-600">Завершено</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{profile.averageRating}</div>
                  <div className="text-sm text-gray-600">Средний рейтинг</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Регистрация: {profile.registrationDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - форма редактирования */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Личная информация
                </h3>
                
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Имя и фамилия */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Введите имя"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {profile.firstName}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Введите фамилию"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {profile.lastName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Введите email"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {profile.email}
                    </div>
                  )}
                </div>

                {/* Телефон */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Телефон
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+375 (XX) XXX-XX-XX"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {profile.phone}
                    </div>
                  )}
                </div>

                {/* Адрес */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Адрес
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Введите адрес"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {profile.address}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Дополнительные настройки */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Настройки аккаунта
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email уведомления</h4>
                    <p className="text-sm text-gray-600">Получать уведомления о заказах</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS уведомления</h4>
                    <p className="text-sm text-gray-600">Получать SMS о статусе заказов</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 