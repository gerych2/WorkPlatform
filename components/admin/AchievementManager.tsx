'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Edit, Trash2, Save, X, Trophy, Star } from 'lucide-react'

interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  xpReward: number
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isActive: boolean
}

interface AchievementManagerProps {
  className?: string
}

export const AchievementManager: React.FC<AchievementManagerProps> = ({
  className = ''
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🏆',
    xpReward: 0,
    category: 'activity',
    rarity: 'common' as const
  })

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/admin/achievements')
      const data = await response.json()
      if (data.success) {
        setAchievements(data.achievements)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      title: '',
      description: '',
      icon: '🏆',
      xpReward: 0,
      category: 'activity',
      rarity: 'common'
    })
  }

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id)
    setFormData({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward,
      category: achievement.category,
      rarity: achievement.rarity as any
    })
  }

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/admin/achievements/${editingId}` : '/api/admin/achievements'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchAchievements()
        resetForm()
      } else {
        alert('Ошибка при сохранении достижения')
      }
    } catch (error) {
      console.error('Error saving achievement:', error)
      alert('Ошибка при сохранении достижения')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это достижение?')) return

    try {
      const response = await fetch(`/api/admin/achievements/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAchievements()
      } else {
        alert('Ошибка при удалении достижения')
      }
    } catch (error) {
      console.error('Error deleting achievement:', error)
      alert('Ошибка при удалении достижения')
    }
  }

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/achievements/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        await fetchAchievements()
      }
    } catch (error) {
      console.error('Error toggling achievement:', error)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({
      title: '',
      description: '',
      icon: '🏆',
      xpReward: 0,
      category: 'activity',
      rarity: 'common'
    })
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500'
      case 'rare': return 'text-primary-500'
      case 'epic': return 'text-primary-500'
      case 'legendary': return 'text-secondary-500'
      default: return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Управление достижениями</h2>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Добавить достижение</span>
        </Button>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingId) && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Редактировать достижение' : 'Создать новое достижение'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Название достижения"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Иконка
              </label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🏆"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Описание достижения"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Награда XP
              </label>
              <Input
                type="number"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="activity">Активность</option>
                <option value="orders">Заказы</option>
                <option value="reviews">Отзывы</option>
                <option value="referrals">Рефералы</option>
                <option value="subscription">Подписки</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Редкость
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="common">Обычное</option>
                <option value="rare">Редкое</option>
                <option value="epic">Эпическое</option>
                <option value="legendary">Легендарное</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={resetForm}>
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      )}

      {/* Список достижений */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Все достижения</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {achievement.title}
                    </h4>
                    <p className="text-gray-600">{achievement.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-sm font-medium ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                      <span className="text-sm text-gray-500">
                        {achievement.category}
                      </span>
                      <span className="text-sm font-semibold text-primary-600">
                        +{achievement.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(achievement.id, achievement.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      achievement.isActive
                        ? 'bg-secondary-100 text-secondary-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {achievement.isActive ? 'Активно' : 'Неактивно'}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(achievement.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
