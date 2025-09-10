'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  MessageSquare,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Rocket,
  Briefcase,
  Heart,
  Leaf,
  Stethoscope,
  GraduationCap,
  Code
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
    role: string
  }
  volunteers: Array<{
    id: number
    role: string
    user: {
      id: number
      name: string
      email: string
      role: string
    }
  }>
  tasks: Array<{
    id: number
    title: string
    description: string
    status: string
    priority: string
    dueDate: string | null
    assignee: {
      id: number
      name: string
      email: string
    } | null
  }>
  updates: Array<{
    id: number
    title: string
    content: string
    createdAt: string
    author: {
      id: number
      name: string
      email: string
    }
  }>
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
  paused: 'bg-yellow-100 text-yellow-800'
}

const priorityColors: { [key: string]: string } = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const taskStatusColors: { [key: string]: string } = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-primary-100 text-primary-800',
  completed: 'bg-secondary-100 text-secondary-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function StartupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    telegram: '',
    experience: '',
    motivation: '',
    skills: ''
  })

  useEffect(() => {
    fetchStartup()
  }, [params.id])

  const fetchStartup = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/startups/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setStartup(data.data)
      }
    } catch (error) {
      console.error('Error fetching startup:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    setShowApplicationModal(true)
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startup) return

    try {
      const response = await fetch(`/api/startups/${startup.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(data.message)
        setShowApplicationModal(false)
        setApplicationForm({
          name: '',
          email: '',
          phone: '',
          telegram: '',
          experience: '',
          motivation: '',
          skills: ''
        })
      } else {
        alert('Ошибка подачи заявки: ' + data.error)
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Ошибка подачи заявки')
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка стартапа...</p>
        </div>
      </div>
    )
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Стартап не найден</h2>
          <button
            onClick={() => router.push('/startups')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    )
  }

  const CategoryIcon = categoryIcons[startup.category] || Code

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/startups')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад к списку
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg mr-4">
                  <CategoryIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{startup.title}</h1>
                  <p className="text-gray-600">{categoryLabels[startup.category]}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[startup.status]}`}>
                  {statusLabels[startup.status]}
                </span>
               <button
                 onClick={handleApply}
                 className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center group"
               >
                 <UserPlus className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                 Подать заявку
               </button>
              </div>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed">{startup.description}</p>
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{startup._count.volunteers} добровольцев</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Создан {new Date(startup.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <span>Автор: {startup.creator.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Обзор', icon: Rocket },
                { id: 'volunteers', label: 'Добровольцы', icon: Users },
                { id: 'updates', label: 'Обновления', icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-primary-600">Добровольцы</p>
                        <p className="text-2xl font-bold text-primary-900">{startup._count.volunteers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-secondary-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-secondary-600">Задачи</p>
                        <p className="text-2xl font-bold text-secondary-900">{startup._count.tasks}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <MessageSquare className="h-8 w-8 text-primary-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-primary-600">Обновления</p>
                        <p className="text-2xl font-bold text-primary-900">{startup._count.updates}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Volunteers Tab */}
            {activeTab === 'volunteers' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Добровольцы</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {startup.volunteers.map((volunteer) => (
                    <div key={volunteer.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-medium">
                            {volunteer.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{volunteer.user.name}</p>
                          <p className="text-sm text-gray-500">{volunteer.user.email}</p>
                          <p className="text-xs text-gray-400 capitalize">{volunteer.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {startup.volunteers.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>Добровольцев пока нет</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Updates Tab */}
            {activeTab === 'updates' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Обновления</h3>
                
                <div className="space-y-4">
                  {startup.updates.map((update) => (
                    <div key={update.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{update.title}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(update.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{update.content}</p>
                      <p className="text-sm text-gray-500 mt-2">Автор: {update.author.name}</p>
                    </div>
                  ))}
                  
                  {startup.updates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>Обновлений пока нет</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && startup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-modal">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Подать заявку на стартап: {startup.title}
            </h2>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    value={applicationForm.name}
                    onChange={(e) => setApplicationForm({ ...applicationForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={applicationForm.phone}
                    onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram *
                  </label>
                  <input
                    type="text"
                    value={applicationForm.telegram}
                    onChange={(e) => setApplicationForm({ ...applicationForm, telegram: e.target.value })}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Опыт работы *
                </label>
                <textarea
                  value={applicationForm.experience}
                  onChange={(e) => setApplicationForm({ ...applicationForm, experience: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Расскажите о своем опыте работы..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Мотивация *
                </label>
                <textarea
                  value={applicationForm.motivation}
                  onChange={(e) => setApplicationForm({ ...applicationForm, motivation: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Почему вы хотите присоединиться к этому стартапу?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Навыки и компетенции *
                </label>
                <textarea
                  value={applicationForm.skills}
                  onChange={(e) => setApplicationForm({ ...applicationForm, skills: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Какие навыки вы можете привнести в проект?"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationModal(false)
                    setApplicationForm({
                      name: '',
                      email: '',
                      phone: '',
                      telegram: '',
                      experience: '',
                      motivation: '',
                      skills: ''
                    })
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                       <button
                         type="submit"
                         className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                       >
                         Подать заявку
                       </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
