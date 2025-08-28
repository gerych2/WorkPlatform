'use client'

import React, { useState, useEffect } from 'react'
import AdminGuard from '../../components/auth/AdminGuard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Users, 
  FileText, 
  ShoppingCart, 
  Tag, 
  BarChart3, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Star
} from 'lucide-react'
import { 
  userService, 
  orderService, 
  categoryService, 
  documentService, 
  adminService 
} from '../../lib/dataService'
import type { User, Order, Category, Document } from '../../lib/dataService'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Данные из сервиса
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState(adminService.getStats())

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setUsers(userService.getAll())
    setOrders(orderService.getAll())
    setCategories(categoryService.getAll())
    setDocuments(documentService.getAll())
    setStats(adminService.getStats())
  }

  // Вспомогательные функции
  const getRoleText = (role: string) => {
    switch (role) {
      case 'client': return 'Клиент'
      case 'executor': return 'Исполнитель'
      case 'admin': return 'Администратор'
      default: return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен'
      case 'pending': return 'Ожидает'
      case 'blocked': return 'Заблокирован'
      default: return status
    }
  }

  const getLegalStatusText = (status: string) => {
    switch (status) {
      case 'ИП': return 'Индивидуальный предприниматель'
      case 'Юр. лицо': return 'Юридическое лицо'
      case 'Самозанятый': return 'Самозанятый'
      default: return status
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен'
      case 'in_progress': return 'В работе'
      case 'pending': return 'Ожидает'
      case 'cancelled': return 'Отменен'
      default: return status
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Одобрен'
      case 'pending': return 'Ожидает проверки'
      case 'rejected': return 'Отклонен'
      default: return status
    }
  }

  // Обработчики
  const handleUserAction = (action: string, user: User) => {
    console.log(`${action} пользователя:`, user)
    
    switch (action) {
      case 'block':
        if (user.status === 'active') {
          userService.toggleStatus(user.id, 'blocked')
        } else {
          userService.toggleStatus(user.id, 'active')
        }
        loadData()
        break
      case 'verify':
        if (user.role === 'executor') {
          userService.verifyExecutor(user.id)
          loadData()
        }
        break
    }
  }

  const handleDocumentAction = (action: string, document: Document) => {
    console.log(`${action} документа:`, document)
    
    const currentUser = userService.getById('admin') // В реальном проекте получаем текущего админа
    if (!currentUser) return
    
    switch (action) {
      case 'approve':
        documentService.updateStatus(document.id, 'approved', currentUser.id, 'Документ одобрен')
        loadData()
        break
      case 'reject':
        documentService.updateStatus(document.id, 'rejected', currentUser.id, 'Документ отклонен')
        loadData()
        break
    }
  }

  const handleOrderAction = (action: string, order: Order) => {
    console.log(`${action} заказа:`, order)
    
    switch (action) {
      case 'delete':
        if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
          orderService.delete(order.id)
          loadData()
        }
        break
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Панель администратора
            </h1>
            <p className="text-gray-600">
              Управление платформой, пользователями, заказами и категориями
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Исполнителей</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExecutors}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ожидают проверки</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Tag className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активных категорий</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCategories}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Клиентов</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Навигация по вкладкам */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', name: 'Обзор', icon: BarChart3 },
                { id: 'users', name: 'Пользователи', icon: Users },
                { id: 'documents', name: 'Документы', icon: FileText },
                { id: 'orders', name: 'Заказы', icon: ShoppingCart },
                { id: 'categories', name: 'Категории', icon: Tag }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Содержимое вкладок */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Последние пользователи */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Последние пользователи</h2>
                <div className="space-y-3">
                  {users.slice(0, 3).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{getRoleText(user.role)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Последние заказы */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Последние заказы</h2>
                <div className="space-y-3">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.service}</p>
                        <p className="text-sm text-gray-600">{order.clientName} → {order.executorName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusText(order.status)}
                        </span>
                        <p className="text-sm font-medium text-primary-600 mt-1">{order.price} BYN</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Управление пользователями</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Поиск пользователей..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">Все статусы</option>
                    <option value="active">Активные</option>
                    <option value="pending">Ожидают</option>
                    <option value="blocked">Заблокированные</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredUsers.map(user => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusText(user.status)}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{getRoleText(user.role)}</p>
                        {user.legalStatus && (
                          <p className="text-xs text-gray-400 mt-1">{getLegalStatusText(user.legalStatus)}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction('edit', user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction('block', user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        {user.role === 'executor' && !user.isVerified && (
                          <Button
                            size="sm"
                            onClick={() => handleUserAction('verify', user)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Верифицировать
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Проверка документов</h2>
              <div className="space-y-4">
                {documents.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{doc.executorName}</h3>
                          <p className="text-sm text-gray-600">{doc.documentType}</p>
                          <p className="text-sm text-gray-500">{doc.fileName}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}>
                          {getDocumentStatusText(doc.status)}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{getLegalStatusText(doc.legalStatus)}</p>
                        <p className="text-xs text-gray-400 mt-1">{doc.uploadDate}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(doc)
                            setShowDocumentModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleDocumentAction('approve', doc)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Одобрить
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDocumentAction('reject', doc)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Отклонить
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Управление заказами</h2>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{order.service}</h3>
                        <p className="text-sm text-gray-600">{order.clientName} → {order.executorName}</p>
                        <p className="text-sm text-gray-500">{order.address}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusText(order.status)}
                        </span>
                        <p className="text-sm font-medium text-primary-600 mt-1">{order.price} BYN</p>
                        <p className="text-xs text-gray-400 mt-1">{order.date} {order.time}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrderAction('view', order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrderAction('edit', order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrderAction('delete', order)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Управление категориями</h2>
                <Button>
                  <Tag className="h-4 w-4 mr-2" />
                  Добавить категорию
                </Button>
              </div>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          <p className="text-sm text-gray-500">
                            {category.executorCount} исполнителей • {category.orderCount} заказов
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrderAction('edit', {} as Order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOrderAction('delete', {} as Order)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Модальное окно просмотра документа */}
        {showDocumentModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Детали документа
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Исполнитель
                  </label>
                  <p className="text-sm text-gray-900">{selectedDocument.executorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Правовой статус
                  </label>
                  <p className="text-sm text-gray-900">{getLegalStatusText(selectedDocument.legalStatus)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип документа
                  </label>
                  <p className="text-sm text-gray-900">{selectedDocument.documentType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Файл
                  </label>
                  <p className="text-sm text-gray-900">{selectedDocument.fileName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата загрузки
                  </label>
                  <p className="text-sm text-gray-900">{selectedDocument.uploadDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(selectedDocument.status)}`}>
                    {getDocumentStatusText(selectedDocument.status)}
                  </span>
                </div>
                {selectedDocument.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Заметки
                    </label>
                    <p className="text-sm text-gray-900">{selectedDocument.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDocumentModal(false)}
                >
                  Закрыть
                </Button>
                {selectedDocument.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleDocumentAction('approve', selectedDocument)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Одобрить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDocumentAction('reject', selectedDocument)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Отклонить
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно просмотра пользователя */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Детали пользователя
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Роль
                  </label>
                  <p className="text-sm text-gray-900">{getRoleText(selectedUser.role)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {getStatusText(selectedUser.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Регистрация
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.registrationDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Последний вход
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.lastLogin}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Местоположение
                  </label>
                  <p className="text-sm text-gray-900">{selectedUser.location}</p>
                </div>
                
                {selectedUser.legalStatus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Правовой статус
                    </label>
                    <p className="text-sm text-gray-900">{getLegalStatusText(selectedUser.legalStatus)}</p>
                  </div>
                )}
                
                {selectedUser.profile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Профиль
                    </label>
                    <div className="space-y-2">
                      {selectedUser.profile.description && (
                        <p className="text-sm text-gray-900">
                          <strong>Описание:</strong> {selectedUser.profile.description}
                        </p>
                      )}
                      {selectedUser.profile.experience && (
                        <p className="text-sm text-gray-900">
                          <strong>Опыт:</strong> {selectedUser.profile.experience}
                        </p>
                      )}
                      {selectedUser.profile.hourlyRate && (
                        <p className="text-sm text-gray-900">
                          <strong>Ставка:</strong> {selectedUser.profile.hourlyRate} BYN/час
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowUserModal(false)}
                  >
                    Закрыть
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleUserAction('edit', selectedUser)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
} 