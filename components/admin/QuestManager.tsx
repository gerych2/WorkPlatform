'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Edit, Trash2, Save, X, Target, Clock, Star } from 'lucide-react'

interface Quest {
  id: number
  title: string
  description: string
  icon: string
  xpReward: number
  category: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  isActive: boolean
  isRepeatable: boolean
  maxCompletions?: number
  requirements: string
  deadline?: string
}

interface QuestManagerProps {
  className?: string
}

export const QuestManager: React.FC<QuestManagerProps> = ({
  className = ''
}) => {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎯',
    xpReward: 0,
    category: 'daily',
    difficulty: 'easy' as const,
    isRepeatable: false,
    maxCompletions: 1,
    requirements: '',
    deadline: ''
  })

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      const response = await fetch('/api/admin/quests')
      const data = await response.json()
      if (data.success) {
        setQuests(data.quests)
      }
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      title: '',
      description: '',
      icon: '🎯',
      xpReward: 0,
      category: 'daily',
      difficulty: 'easy',
      isRepeatable: false,
      maxCompletions: 1,
      requirements: '',
      deadline: ''
    })
  }

  const handleEdit = (quest: Quest) => {
    setEditingId(quest.id)
    setFormData({
      title: quest.title,
      description: quest.description,
      icon: quest.icon,
      xpReward: quest.xpReward,
      category: quest.category,
      difficulty: quest.difficulty as any,
      isRepeatable: quest.isRepeatable,
      maxCompletions: quest.maxCompletions || 1,
      requirements: quest.requirements,
      deadline: quest.deadline || ''
    })
  }

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/admin/quests/${editingId}` : '/api/admin/quests'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchQuests()
        resetForm()
      } else {
        alert('Ошибка при сохранении задания')
      }
    } catch (error) {
      console.error('Error saving quest:', error)
      alert('Ошибка при сохранении задания')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это задание?')) return

    try {
      const response = await fetch(`/api/admin/quests/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchQuests()
      } else {
        alert('Ошибка при удалении задания')
      }
    } catch (error) {
      console.error('Error deleting quest:', error)
      alert('Ошибка при удалении задания')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({
      title: '',
      description: '',
      icon: '🎯',
      xpReward: 0,
      category: 'daily',
      difficulty: 'easy',
      isRepeatable: false,
      maxCompletions: 1,
      requirements: '',
      deadline: ''
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-secondary-500'
      case 'medium': return 'text-secondary-500'
      case 'hard': return 'text-secondary-500'
      case 'expert': return 'text-red-500'
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
        <h2 className="text-2xl font-bold text-gray-900">Управление заданиями</h2>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Добавить задание</span>
        </Button>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingId) && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Редактировать задание' : 'Создать новое задание'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Название задания"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Иконка
              </label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎯"
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
                placeholder="Описание задания"
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
                <option value="daily">Ежедневные</option>
                <option value="weekly">Еженедельные</option>
                <option value="monthly">Ежемесячные</option>
                <option value="special">Специальные</option>
                <option value="event">Событийные</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сложность
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="easy">Легкое</option>
                <option value="medium">Среднее</option>
                <option value="hard">Сложное</option>
                <option value="expert">Экспертное</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дедлайн
              </label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Требования
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Что нужно сделать для выполнения задания"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isRepeatable}
                  onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Повторяемое</span>
              </label>
              
              {formData.isRepeatable && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Макс. выполнений:</label>
                  <Input
                    type="number"
                    value={formData.maxCompletions}
                    onChange={(e) => setFormData({ ...formData, maxCompletions: parseInt(e.target.value) || 1 })}
                    className="w-20"
                    min="1"
                  />
                </div>
              )}
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

      {/* Список заданий */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Все задания</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {quests.map((quest) => (
            <div key={quest.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{quest.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {quest.title}
                    </h4>
                    <p className="text-gray-600">{quest.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-sm font-medium ${getDifficultyColor(quest.difficulty)}`}>
                        {quest.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        {quest.category}
                      </span>
                      <span className="text-sm font-semibold text-primary-600">
                        +{quest.xpReward} XP
                      </span>
                      {quest.isRepeatable && (
                        <span className="text-sm text-primary-600">
                          Повторяемое
                        </span>
                      )}
                    </div>
                    {quest.requirements && (
                      <p className="text-sm text-gray-500 mt-1">
                        Требования: {quest.requirements}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quest.isActive
                        ? 'bg-secondary-100 text-secondary-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {quest.isActive ? 'Активно' : 'Неактивно'}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(quest)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(quest.id)}
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
