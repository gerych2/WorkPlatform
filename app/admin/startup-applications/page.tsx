'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  User,
  Trash2,
  Filter
} from 'lucide-react'

interface Application {
  id: number
  name: string
  email: string
  phone: string | null
  telegram: string | null
  experience: string | null
  motivation: string | null
  skills: string | null
  status: string
  notes: string | null
  createdAt: string
  startup: {
    id: number
    title: string
    category: string
  }
}

const statusLabels: { [key: string]: string } = {
  pending: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена'
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-secondary-100 text-secondary-800',
  approved: 'bg-secondary-100 text-secondary-800',
  rejected: 'bg-red-100 text-red-800'
}

export default function AdminStartupApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [statusFilter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      const response = await fetch(`/api/admin/startup-applications?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setApplications(data.data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/startup-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus, notes: notes } : app
        ))
        setShowDetailsModal(false)
        setNotes('')
        alert(`Заявка ${statusLabels[newStatus].toLowerCase()}. Уведомление отправлено на email пользователя.`)
      } else {
        alert('Ошибка обновления статуса: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Ошибка обновления статуса')
    }
  }

  const handleDelete = async (applicationId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return

    try {
      const response = await fetch(`/api/admin/startup-applications/${applicationId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setApplications(applications.filter(app => app.id !== applicationId))
        alert('Заявка удалена')
      } else {
        alert('Ошибка удаления: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Ошибка удаления заявки')
    }
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setNotes(application.notes || '')
    setShowDetailsModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка заявок...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 text-primary-600 mr-3" />
            Заявки на стартапы
          </h1>
          <p className="mt-2 text-gray-600">
            Управление заявками пользователей на участие в стартапах
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Все заявки</option>
              <option value="pending">На рассмотрении</option>
              <option value="approved">Одобренные</option>
              <option value="rejected">Отклоненные</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Заявки ({applications.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                        {statusLabels[application.status]}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p className="flex items-center mb-1">
                        <Mail className="h-4 w-4 mr-2" />
                        {application.email}
                      </p>
                      {application.phone && (
                        <p className="flex items-center mb-1">
                          <Phone className="h-4 w-4 mr-2" />
                          {application.phone}
                        </p>
                      )}
                      {application.telegram && (
                        <p className="flex items-center mb-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {application.telegram}
                        </p>
                      )}
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      <p><strong>Стартап:</strong> {application.startup.title}</p>
                      <p><strong>Мотивация:</strong> {application.motivation?.substring(0, 100)}...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Подробнее"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(application.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {applications.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Заявок нет</h3>
              <p className="text-gray-500">Пока нет заявок на участие в стартапах</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-modal">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Заявка от {selectedApplication.name}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя
                  </label>
                  <p className="text-gray-900">{selectedApplication.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{selectedApplication.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <p className="text-gray-900">{selectedApplication.phone || 'Не указан'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telegram
                  </label>
                  <p className="text-gray-900">{selectedApplication.telegram || 'Не указан'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Стартап
                </label>
                <p className="text-gray-900">{selectedApplication.startup.title}</p>
              </div>
              
              {selectedApplication.experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Опыт работы
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.experience}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Мотивация
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.motivation}</p>
              </div>
              
              {selectedApplication.skills && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Навыки и компетенции
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.skills}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заметки
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Добавьте заметки..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Закрыть
              </button>
              
              {selectedApplication.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'approved')}
                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Одобрить
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Отклонить
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
