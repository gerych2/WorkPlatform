'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  AlertCircle
} from 'lucide-react'

interface Order {
  id: number
  serviceDescription: string
  address: string
  totalPrice: number | null
  priceType: string
  urgency: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  orderDate: string
  orderTime: string
  notes?: string | null
  specialRequirements?: string | null
  category: {
    id: number
    name: string
  }
  client: {
    id: number
    name: string
    email: string
    phone: string
  }
  executor?: {
    id: number
    name: string
    email: string
    phone: string
  }
  createdAt: string
  updatedAt: string
  completedAt?: string
  rating?: number
  review?: string
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    status: 'pending',
    priority: 'medium',
    deadline: '',
    location: '',
    clientId: '',
    executorId: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      title: '',
      description: '',
      category: '',
      price: 0,
      status: 'pending',
      priority: 'medium',
      deadline: '',
      location: '',
      clientId: '',
      executorId: ''
    })
  }

  const handleEdit = (order: Order) => {
    setEditingId(order.id)
    setFormData({
      title: order.serviceDescription || '',
      description: order.address || '',
      category: order.category?.name || '',
      price: order.totalPrice || 0,
      status: order.status || 'pending',
      priority: order.urgency || 'medium',
      deadline: order.orderDate ? order.orderDate.split('T')[0] : '',
      location: order.address || '',
      clientId: order.client && order.client.id ? order.client.id.toString() : '',
      executorId: order.executor && order.executor.id ? order.executor.id.toString() : ''
    })
  }

  const handleSave = async () => {
    try {
      const url = editingId ? `/api/admin/orders/${editingId}` : '/api/admin/orders'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchOrders()
        resetForm()
      } else {
        alert('Ошибка при сохранении заказа')
      }
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Ошибка при сохранении заказа')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return

    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchOrders()
      } else {
        alert('Ошибка при удалении заказа')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Ошибка при удалении заказа')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({
      title: '',
      description: '',
      category: '',
      price: 0,
      status: 'pending',
      priority: 'medium',
      deadline: '',
      location: '',
      clientId: '',
      executorId: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'disputed': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'urgent': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'disputed': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || order.category?.name === categoryFilter
    const matchesPriority = priorityFilter === 'all' || order.urgency === priorityFilter
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управление заказами</h1>
          <p className="mt-2 text-gray-600">Управляйте заказами клиентов и исполнителей</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ожидают</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">В работе</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Завершены</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Отменены</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общая сумма</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.reduce((sum, o) => sum + (o.price || 0), 0).toLocaleString()} ₽
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск по названию..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Все статусы</option>
                  <option value="pending">Ожидают</option>
                  <option value="in_progress">В работе</option>
                  <option value="completed">Завершены</option>
                  <option value="cancelled">Отменены</option>
                  <option value="disputed">Спорные</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Все категории</option>
                  <option value="design">Дизайн</option>
                  <option value="development">Разработка</option>
                  <option value="marketing">Маркетинг</option>
                  <option value="writing">Копирайтинг</option>
                  <option value="translation">Переводы</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Приоритет</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Все приоритеты</option>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочный</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleCreate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить заказ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {(isCreating || editingId) && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? 'Редактировать заказ' : 'Создать новый заказ'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Название заказа"
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
                    <option value="">Выберите категорию</option>
                    <option value="design">Дизайн</option>
                    <option value="development">Разработка</option>
                    <option value="marketing">Маркетинг</option>
                    <option value="writing">Копирайтинг</option>
                    <option value="translation">Переводы</option>
                  </select>
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
                    placeholder="Описание заказа"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (₽)
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pending">Ожидает</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Завершен</option>
                    <option value="cancelled">Отменен</option>
                    <option value="disputed">Спорный</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Приоритет
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочный</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дедлайн
                  </label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Местоположение
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Москва, Россия"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID клиента
                  </label>
                  <Input
                    type="number"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID исполнителя
                  </label>
                  <Input
                    type="number"
                    value={formData.executorId}
                    onChange={(e) => setFormData({ ...formData, executorId: e.target.value })}
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
                <Button onClick={handleSave}>
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Все заказы</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заказ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Исполнитель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Приоритет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дедлайн
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.serviceDescription || 'Без описания'}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {order.address || 'Адрес не указан'}
                        </div>
                        <div className="flex items-center mt-1">
                          <Tag className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500 capitalize">
                            {order.category?.name || 'Не указана'}
                          </span>
                          {order.location && order.location.trim() !== '' && (
                            <span className="text-xs text-gray-500 ml-2">
                              📍 {order.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.client && order.client.name ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {order.client.name || 'Без имени'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.client.email || 'Без email'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Не указан</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.executor && order.executor.name ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {order.executor.name || 'Без имени'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.executor.email || 'Без email'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Не назначен</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status || 'Не указан'}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">Не указан</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.urgency ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.urgency)}`}>
                          <span className="capitalize">{order.urgency || 'Не указан'}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">Не указан</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.totalPrice ? `${order.totalPrice.toLocaleString()} ₽` : 'По договоренности'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
