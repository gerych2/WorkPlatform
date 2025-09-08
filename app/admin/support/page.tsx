'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Tag,
  Send,
  Eye,
  Archive
} from 'lucide-react'

interface SupportTicket {
  id: number
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: number
    name: string
    email: string
  }
  assignedTo: number | null
  messages: SupportMessage[]
}

interface SupportMessage {
  id: number
  message: string
  isFromAdmin: boolean
  createdAt: string
  user: {
    name: string
  }
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/support/tickets')
      const data = await response.json()
      if (data.success) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Ошибка загрузки тикетов:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()
      if (data.success) {
        fetchTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status })
        }
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
    }
  }

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    try {
      const response = await fetch('/api/admin/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: newMessage,
          isFromAdmin: true
        })
      })

      const data = await response.json()
      if (data.success) {
        setNewMessage('')
        fetchTickets()
        // Обновляем выбранный тикет
        const updatedTicket = tickets.find(t => t.id === selectedTicket.id)
        if (updatedTicket) {
          setSelectedTicket(updatedTicket)
        }
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Открыт'
      case 'in_progress': return 'В работе'
      case 'resolved': return 'Решен'
      case 'closed': return 'Закрыт'
      default: return status
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

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical': return 'Техническая поддержка'
      case 'billing': return 'Биллинг'
      case 'general': return 'Общие вопросы'
      case 'bug': return 'Сообщение об ошибке'
      case 'feature': return 'Предложение функции'
      default: return category
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка обращений...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Управление поддержкой</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Управление обращениями пользователей в службу поддержки
          </p>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск
              </label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по теме, имени или email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="open">Открыт</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Решен</option>
                <option value="closed">Закрыт</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все приоритеты</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="urgent">Срочный</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchTickets}
                className="w-full flex items-center justify-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Обновить
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Список обращений */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Обращения ({filteredTickets.length})
                </h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredTickets.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Нет обращений</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedTicket?.id === ticket.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{ticket.subject}</h4>
                            <p className="text-xs text-gray-600 mt-1">{ticket.user.name}</p>
                            <p className="text-xs text-gray-500">{ticket.user.email}</p>
                          </div>
                          <div className="ml-2 flex items-center">
                            {getStatusIcon(ticket.status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Детали выбранного обращения */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-600">{selectedTicket.user.name}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{selectedTicket.user.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedTicket.status)}
                      <span className="text-sm text-gray-600">
                        {getStatusText(selectedTicket.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {getCategoryText(selectedTicket.category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(selectedTicket.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Описание проблемы:</h4>
                  <p className="text-gray-700 mb-6">{selectedTicket.description}</p>

                  {/* Переписка */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Переписка</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedTicket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.isFromAdmin
                              ? 'bg-blue-50 ml-8'
                              : 'bg-gray-50 mr-8'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {message.isFromAdmin ? 'Администратор' : message.user.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{message.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Форма ответа */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="space-y-3">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Напишите ответ пользователю..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="flex items-center"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Отправить ответ
                          </Button>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                              variant="outline"
                              size="sm"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              В работу
                            </Button>
                            <Button
                              onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                              variant="outline"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Решить
                            </Button>
                            <Button
                              onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                              variant="outline"
                              size="sm"
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Закрыть
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Выберите обращение для просмотра деталей</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
