'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Edit, Trash2, Save, X, Crown, Star } from 'lucide-react'

interface Level {
  id: number
  level: number
  title: string
  description: string
  icon: string
  xpRequired: number
  color: string
  isActive: boolean
}

interface LevelManagerProps {
  className?: string
}

export const LevelManager: React.FC<LevelManagerProps> = ({
  className = ''
}) => {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    level: 1,
    title: '',
    description: '',
    icon: '🌱',
    xpRequired: 0,
    color: '#6B7280'
  })

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/admin/levels')
      const data = await response.json()
      if (data.success) {
        setLevels(data.levels)
      }
    } catch (error) {
      console.error('Error fetching levels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      level: Math.max(...levels.map(l => l.level), 0) + 1,
      title: '',
      description: '',
      icon: '🌱',
      xpRequired: 0,
      color: '#6B7280'
    })
  }

  const handleEdit = (level: Level) => {
    setEditingId(level.id)
    setFormData({
      level: level.level,
      title: level.title,
      description: level.description,
      icon: level.icon,
      xpRequired: level.xpRequired,
      color: level.color
    })
  }

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/admin/levels/${editingId}` : '/api/admin/levels'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchLevels()
        resetForm()
      } else {
        alert('Ошибка при сохранении уровня')
      }
    } catch (error) {
      console.error('Error saving level:', error)
      alert('Ошибка при сохранении уровня')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот уровень?')) return

    try {
      const response = await fetch(`/api/admin/levels/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchLevels()
      } else {
        alert('Ошибка при удалении уровня')
      }
    } catch (error) {
      console.error('Error deleting level:', error)
      alert('Ошибка при удалении уровня')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({
      level: 1,
      title: '',
      description: '',
      icon: '🌱',
      xpRequired: 0,
      color: '#6B7280'
    })
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
        <h2 className="text-2xl font-bold text-gray-900">Управление уровнями</h2>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Добавить уровень</span>
        </Button>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingId) && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Редактировать уровень' : 'Создать новый уровень'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер уровня
              </label>
              <Input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Новичок"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Иконка
              </label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🌱"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Требуемый XP
              </label>
              <Input
                type="number"
                value={formData.xpRequired}
                onChange={(e) => setFormData({ ...formData, xpRequired: parseInt(e.target.value) || 0 })}
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цвет
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6B7280"
                />
              </div>
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
                placeholder="Описание уровня"
              />
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

      {/* Список уровней */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Все уровни</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {levels
            .sort((a, b) => a.level - b.level)
            .map((level) => (
            <div key={level.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: level.color + '20' }}
                  >
                    {level.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Уровень {level.level} • {level.title}
                    </h4>
                    <p className="text-gray-600">{level.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm font-semibold text-primary-600">
                        {level.xpRequired} XP
                      </span>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: level.color }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      level.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {level.isActive ? 'Активно' : 'Неактивно'}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(level)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(level.id)}
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
