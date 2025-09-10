'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  CheckCircle, 
  MessageSquare,
  Rocket,
  Briefcase,
  Heart,
  Leaf,
  Stethoscope,
  GraduationCap,
  Code,
  Eye
} from 'lucide-react'

interface Startup {
  id: number
  title: string
  description: string
  category: string
  status: string
  createdAt: string
  creator: {
    id: number
    name: string
    email: string
  }
  _count: {
    volunteers: number
    tasks: number
    updates: number
  }
}

const categoryIcons: { [key: string]: any } = {
  tech: Code,
  business: Briefcase,
  social: Heart,
  environmental: Leaf,
  health: Stethoscope,
  education: GraduationCap
}

const categoryLabels: { [key: string]: string } = {
  tech: 'Технологии',
  business: 'Бизнес',
  social: 'Социальные',
  environmental: 'Экология',
  health: 'Здоровье',
  education: 'Образование'
}

const statusLabels: { [key: string]: string } = {
  active: 'Активный',
  completed: 'Завершен',
  cancelled: 'Отменен',
  paused: 'Приостановлен'
}

const statusColors: { [key: string]: string } = {
  active: 'bg-secondary-100 text-secondary-800',
  completed: 'bg-primary-100 text-primary-800',
  cancelled: 'bg-red-100 text-red-800',
  paused: 'bg-secondary-100 text-secondary-800'
}

export default function AdminStartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tech',
    status: 'active'
  })

  useEffect(() => {
    fetchStartups()
  }, [])

  const fetchStartups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/startups')
      const data = await response.json()
      
      if (data.success) {
        setStartups(data.data.startups)
      }
    } catch (error) {
      console.error('Error fetching startups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStartup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/startups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          createdBy: 1 // ID админа (можно сделать динамическим)
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStartups([data.data, ...startups])
        setShowCreateModal(false)
        setFormData({ title: '', description: '', category: 'tech', status: 'active' })
        alert('Стартап создан успешно!')
      } else {
        alert('Ошибка создания стартапа: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating startup:', error)
      alert('Ошибка создания стартапа')
    }
  }

  const handleUpdateStartup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStartup) return

    try {
      const response = await fetch(`/api/startups/${editingStartup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStartups(startups.map(s => s.id === editingStartup.id ? data.data : s))
        setEditingStartup(null)
        setFormData({ title: '', description: '', category: 'tech', status: 'active' })
        alert('Стартап обновлен успешно!')
      } else {
        alert('Ошибка обновления стартапа: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating startup:', error)
      alert('Ошибка обновления стартапа')
    }
  }

  const handleDeleteStartup = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот стартап?')) return

    try {
      const response = await fetch(`/api/startups/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStartups(startups.filter(s => s.id !== id))
        alert('Стартап удален успешно!')
      } else {
        alert('Ошибка удаления стартапа: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting startup:', error)
      alert('Ошибка удаления стартапа')
    }
  }

  const handleEdit = (startup: Startup) => {
    setEditingStartup(startup)
    setFormData({
      title: startup.title,
      description: startup.description,
      category: startup.category,
      status: startup.status
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка стартапов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Rocket className="h-8 w-8 text-primary-600 mr-3" />
                Управление стартапами
              </h1>
              <p className="mt-2 text-gray-600">
                Создавайте и управляйте стартапами на платформе
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Создать стартап
            </button>
          </div>
        </div>

        {/* Startups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup) => {
            const CategoryIcon = categoryIcons[startup.category] || Code
            return (
              <div key={startup.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg mr-3">
                      <CategoryIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{startup.title}</h3>
                      <p className="text-sm text-gray-500">{categoryLabels[startup.category]}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[startup.status]}`}>
                    {statusLabels[startup.status]}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {startup.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{startup._count.volunteers}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>{startup._count.tasks}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{startup._count.updates}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(startup.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span>Автор: {startup.creator.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`/startups/${startup.id}`}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Просмотреть"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleEdit(startup)}
                      className="p-2 text-gray-400 hover:text-secondary-600 transition-colors"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStartup(startup.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {startups.length === 0 && (
          <div className="text-center py-12">
            <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Стартапы не найдены</h3>
            <p className="text-gray-500">Создайте первый стартап, чтобы начать работу</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingStartup) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-modal">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingStartup ? 'Редактировать стартап' : 'Создать стартап'}
            </h2>
            <form onSubmit={editingStartup ? handleUpdateStartup : handleCreateStartup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingStartup(null)
                    setFormData({ title: '', description: '', category: 'tech', status: 'active' })
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingStartup ? 'Обновить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
