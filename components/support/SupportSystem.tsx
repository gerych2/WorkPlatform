'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  User,
  Calendar,
  Tag,
  AlertTriangle
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

interface SupportSystemProps {
  userId: number
}

export default function SupportSystem({ userId }: SupportSystemProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  // Форма нового тикета
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/support/tickets?userId=${userId}`)
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

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTicket,
          userId
        })
      })

      const data = await response.json()
      if (data.success) {
        setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium' })
        setShowNewTicket(false)
        fetchTickets()
      }
    } catch (error) {
      console.error('Ошибка создания тикета:', error)
    }
  }

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    try {
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          userId,
          message: newMessage
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Служба поддержки</h2>
        </div>
        <Button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Новое обращение
        </Button>
      </div>

      {/* Форма нового тикета */}
      {showNewTicket && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Создать новое обращение</h3>
          <form onSubmit={createTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тема обращения
              </label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Кратко опишите проблему"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">Общие вопросы</option>
                  <option value="technical">Техническая поддержка</option>
                  <option value="billing">Биллинг</option>
                  <option value="bug">Сообщение об ошибке</option>
                  <option value="feature">Предложение функции</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Приоритет
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочный</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание проблемы
              </label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Подробно опишите вашу проблему или вопрос"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewTicket(false)}
              >
                Отмена
              </Button>
              <Button type="submit">
                Создать обращение
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Список тикетов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Список обращений */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Ваши обращения</h3>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>У вас пока нет обращений в службу поддержки</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      {getStatusIcon(ticket.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getCategoryText(ticket.category)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Детали выбранного тикета */}
        <div className="space-y-4">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusIcon(selectedTicket.status)}
                    <span className="text-sm text-gray-600">
                      {getStatusText(selectedTicket.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>

              {/* Сообщения */}
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
                            {message.isFromAdmin ? 'Поддержка' : message.user.name}
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
                      placeholder="Напишите ваш ответ..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Отправить
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Выберите обращение для просмотра деталей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
