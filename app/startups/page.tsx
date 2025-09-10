'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Rocket,
  Briefcase,
  Heart,
  Leaf,
  Stethoscope,
  GraduationCap,
  Code,
  ArrowRight,
  X
} from 'lucide-react'
import { FloatingInput } from '@/components/ui/FloatingInput'

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

export default function StartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
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
    fetchStartups()
  }, [])

  const fetchStartups = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/startups?${params.toString()}`)
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

  const handleApply = (startup: Startup) => {
    setSelectedStartup(startup)
    setShowApplicationModal(true)
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStartup) return

    try {
      const response = await fetch(`/api/startups/${selectedStartup.id}/apply`, {
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

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.creator.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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
                Стартапы
              </h1>
              <p className="mt-2 text-gray-600">
                Присоединяйтесь к инновационным проектам и создавайте будущее вместе
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию, описанию или автору..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Все категории</option>
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Все статусы</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Startups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStartups.map((startup) => {
            const CategoryIcon = categoryIcons[startup.category] || Code
            return (
              <div key={startup.id} className="group relative">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-gray-100/50 overflow-hidden">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4 group-hover:rotate-6 transition-transform duration-300">
                          <CategoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-primary-100 transition-colors duration-300">
                            {startup.title}
                          </h3>
                          <p className="text-white/80 text-sm font-medium">
                            {categoryLabels[startup.category]}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${statusColors[startup.status]}`}>
                        {statusLabels[startup.status]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {startup.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                        <Users className="h-4 w-4 mr-2 text-indigo-500" />
                        <span className="font-medium">{startup._count.volunteers} добровольцев</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                        <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                        <span className="font-medium">{new Date(startup.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-primary-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-bold">
                            {startup.creator.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Автор</p>
                          <p className="text-xs text-gray-500">{startup.creator.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                     <button
                       onClick={() => handleApply(startup)}
                       className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center group"
                     >
                       <Rocket className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                       Подать заявку
                     </button>
                      <a
                        href={`/startups/${startup.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm font-semibold border border-gray-200 hover:border-gray-300 flex items-center justify-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          Подробнее
                        </span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredStartups.length === 0 && (
          <div className="text-center py-12">
            <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Стартапы не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить фильтры или создать новый стартап</p>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedStartup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-modal">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            {/* Header */}
             <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Подать заявку на стартап
                  </h2>
                  <p className="text-white/80 text-lg">{selectedStartup.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowApplicationModal(false)
                    setSelectedStartup(null)
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
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput
                    id="name"
                    label="Ваше имя"
                    value={applicationForm.name}
                    onChange={(value) => setApplicationForm({ ...applicationForm, name: value })}
                    required
                    placeholder="Введите ваше полное имя"
                  />
                  
                  <FloatingInput
                    id="email"
                    type="email"
                    label="Email адрес"
                    value={applicationForm.email}
                    onChange={(value) => setApplicationForm({ ...applicationForm, email: value })}
                    required
                    placeholder="example@email.com"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput
                    id="phone"
                    type="tel"
                    label="Номер телефона"
                    value={applicationForm.phone}
                    onChange={(value) => setApplicationForm({ ...applicationForm, phone: value })}
                    required
                    placeholder="+375 (XX) XXX-XX-XX"
                  />
                  
                  <FloatingInput
                    id="telegram"
                    label="Telegram"
                    value={applicationForm.telegram}
                    onChange={(value) => setApplicationForm({ ...applicationForm, telegram: value })}
                    required
                    placeholder="@username"
                  />
                </div>
                
                <FloatingInput
                  id="experience"
                  label="Опыт работы"
                  value={applicationForm.experience}
                  onChange={(value) => setApplicationForm({ ...applicationForm, experience: value })}
                  required
                  placeholder="Расскажите о своем опыте работы..."
                  rows={3}
                />
                
                <FloatingInput
                  id="motivation"
                  label="Мотивация"
                  value={applicationForm.motivation}
                  onChange={(value) => setApplicationForm({ ...applicationForm, motivation: value })}
                  required
                  placeholder="Почему вы хотите присоединиться к этому стартапу?"
                  rows={3}
                />
                
                <FloatingInput
                  id="skills"
                  label="Навыки и компетенции"
                  value={applicationForm.skills}
                  onChange={(value) => setApplicationForm({ ...applicationForm, skills: value })}
                  required
                  placeholder="Какие навыки вы можете привнести в проект?"
                  rows={3}
                />
                
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationModal(false)
                      setSelectedStartup(null)
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
                    className="px-8 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                  >
                    Отмена
                  </button>
                   <button
                     type="submit"
                     className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center group"
                   >
                     <Rocket className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                     Подать заявку
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
