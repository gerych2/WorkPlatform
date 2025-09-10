'use client'

import React, { useState, useEffect } from 'react'
import AdminGuard from '../../../components/auth/AdminGuard'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Save,
  X,
  Tag,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCategories()
        setFormData({ name: '', description: '' })
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim()) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCategories()
        setEditingId(null)
        setFormData({ name: '', description: '' })
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', description: '' })
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Загрузка категорий...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push('/admin')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Назад</span>
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">Управление категориями</h1>
              </div>
              <Button
                onClick={() => setIsCreating(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Добавить категорию</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Create Form */}
          {isCreating && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Добавить новую категорию</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название категории *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Например: Ремонт техники"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Краткое описание категории"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Создать</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Отмена</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Категории ({categories.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Категории не найдены</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="p-6">
                    {editingId === category.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Название категории *
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Название категории"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Описание
                          </label>
                          <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Описание категории"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleUpdate(category.id)}
                            className="flex items-center space-x-2"
                          >
                            <Save className="h-4 w-4" />
                            <span>Сохранить</span>
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="flex items-center space-x-2"
                          >
                            <X className="h-4 w-4" />
                            <span>Отмена</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                          {category.description && (
                            <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                          )}
                          <p className="mt-2 text-xs text-gray-500">
                            Создано: {new Date(category.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => startEdit(category)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Изменить</span>
                          </Button>
                          <Button
                            onClick={() => handleDelete(category.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Удалить</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}




