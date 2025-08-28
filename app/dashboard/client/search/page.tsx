'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { Search, Star, MapPin, Clock, Filter, SortAsc, SortDesc } from 'lucide-react'

export default function SearchExecutors() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    'Электрика',
    'Сантехника',
    'Ремонт техники',
    'Косметология',
    'Ремонт помещений',
    'Уборка',
    'Курьерские услуги',
    'IT услуги',
    'Ремонт обуви',
    'Фотоуслуги'
  ]

  const ratingOptions = [
    { value: '4.5', label: '4.5+ звезд' },
    { value: '4.0', label: '4.0+ звезд' },
    { value: '3.5', label: '3.5+ звезд' }
  ]

  const priceRanges = [
    { value: '0-60', label: 'До 60 BYN' },
    { value: '60-120', label: '60-120 BYN' },
    { value: '120-200', label: '120-200 BYN' },
    { value: '200+', label: 'От 200 BYN' }
  ]

  // Моковые данные исполнителей для Беларуси
  const executors = [
    {
      id: 1,
      name: 'Электрик',
      category: 'Электрика',
      rating: 4.9,
      reviews: 127,
      price: 'от 120 BYN',
             avatar: 'ЭЛ',
      isOnline: true,
      experience: '8 лет',
      location: 'Минск, Центральный район',
      description: 'Профессиональный электрик с опытом работы в жилых и коммерческих помещениях. Выполняю все виды электромонтажных работ.',
      services: ['Ремонт проводки', 'Установка розеток', 'Монтаж освещения', 'Электробезопасность'],
      responseTime: '2.3 ч',
      completedOrders: 156
    },
    {
      id: 2,
      name: 'Косметолог',
      category: 'Косметология',
      rating: 4.8,
      reviews: 89,
      price: 'от 85 BYN',
             avatar: 'КО',
      isOnline: false,
      experience: '5 лет',
      location: 'Минск, Серебрянка',
      description: 'Сертифицированный косметолог. Предоставляю услуги по уходу за лицом, массаж, чистка.',
      services: ['Чистка лица', 'Массаж лица', 'Уходовые процедуры', 'Консультации'],
      responseTime: '1.8 ч',
      completedOrders: 94
    },
    {
      id: 3,
      name: 'Дмитрий Козлов',
      category: 'Сантехника',
      rating: 4.7,
      reviews: 156,
      price: 'от 150 BYN',
      avatar: 'ДК',
      isOnline: true,
      experience: '12 лет',
      location: 'Минск, Московский район',
      description: 'Опытный сантехник. Устанавливаю и ремонтирую сантехнику, трубы, смесители.',
      services: ['Установка сантехники', 'Ремонт труб', 'Замена смесителей', 'Прочистка засоров'],
      responseTime: '3.1 ч',
      completedOrders: 203
    },
    {
      id: 4,
      name: 'Ольга Васильева',
      category: 'Уборка',
      rating: 4.6,
      reviews: 67,
      price: 'от 60 BYN',
      avatar: 'ОВ',
      isOnline: true,
      experience: '3 года',
      location: 'Минск, Ленинский район',
      description: 'Профессиональная уборка квартир и офисов. Использую качественные моющие средства.',
      services: ['Уборка квартир', 'Уборка офисов', 'Генеральная уборка', 'Мытье окон'],
      responseTime: '4.2 ч',
      completedOrders: 78
    },
    {
      id: 5,
      name: 'Сергей Волков',
      category: 'IT услуги',
      rating: 4.9,
      reviews: 45,
      price: 'от 180 BYN',
      avatar: 'СВ',
      isOnline: false,
      experience: '10 лет',
      location: 'Минск, Заводской район',
      description: 'IT-специалист. Настройка компьютеров, удаление вирусов, установка программ.',
      services: ['Настройка ПК', 'Удаление вирусов', 'Установка ПО', 'Консультации'],
      responseTime: '5.0 ч',
      completedOrders: 112
    }
  ]

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleBookExecutor = (executor: any) => {
    // Сохраняем данные выбранного мастера в localStorage
    localStorage.setItem('selectedExecutor', JSON.stringify(executor))
    // Перенаправляем на страницу бронирования
    router.push('/dashboard/client/booking')
  }

  const handleViewProfile = (executor: any) => {
    // Сохраняем данные мастера для просмотра профиля
    localStorage.setItem('viewingExecutor', JSON.stringify(executor))
    // В будущем здесь будет переход на страницу профиля мастера
    // Пока что покажем информацию в alert
    alert(`Профиль мастера: ${executor.name}\nКатегория: ${executor.category}\nРейтинг: ${executor.rating}\nОпыт: ${executor.experience}\nЦена: ${executor.price}\n\nВ будущем здесь будет полная страница профиля мастера`)
  }

  const filteredExecutors = executors.filter(executor => {
    const matchesSearch = executor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         executor.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || executor.category === selectedCategory
    const matchesRating = !selectedRating || executor.rating >= parseFloat(selectedRating)
    
    return matchesSearch && matchesCategory && matchesRating
  })

  const sortedExecutors = [...filteredExecutors].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'rating':
        comparison = a.rating - b.rating
        break
      case 'price':
        const priceA = parseInt(a.price.match(/\d+/)?.[0] || '0')
        const priceB = parseInt(b.price.match(/\d+/)?.[0] || '0')
        comparison = priceA - priceB
        break
      case 'responseTime':
        comparison = parseFloat(a.responseTime) - parseFloat(b.responseTime)
        break
      case 'completedOrders':
        comparison = a.completedOrders - b.completedOrders
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return (
    <div className="min-h-screen bg-gray-50">
              <Header userRole="client" userName="Клиент" notificationsCount={2} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и поиск */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Найти мастера в Беларуси
          </h1>
          <p className="text-gray-600">
            Выберите подходящего исполнителя для ваших задач по всей РБ
          </p>
        </div>

        {/* Поиск и фильтры */}
        <div className="card mb-6">
          <div className="space-y-4">
            {/* Основной поиск */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Что нужно сделать? Или имя мастера..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Все категории</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <Button className="w-full">
                Найти
              </Button>
            </div>

            {/* Дополнительные фильтры */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Фильтры</span>
              </Button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm py-1"
                >
                  <option value="rating">По рейтингу</option>
                  <option value="price">По цене</option>
                  <option value="responseTime">По времени ответа</option>
                  <option value="completedOrders">По количеству заказов</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="p-2"
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Расширенные фильтры */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="input-field"
                >
                  <option value="">Любой рейтинг</option>
                  {ratingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="input-field"
                >
                  <option value="">Любая цена</option>
                  {priceRanges.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Button variant="outline" size="sm">
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Найдено исполнителей: {sortedExecutors.length}
            </h2>
            <p className="text-sm text-gray-500">
              Показано {sortedExecutors.length} из {executors.length}
            </p>
          </div>
        </div>

        {/* Список исполнителей */}
        <div className="space-y-6">
          {sortedExecutors.map(executor => (
            <div key={executor.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                {/* Аватар и основная информация */}
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-xl">{executor.avatar}</span>
                    </div>
                    {executor.isOnline && (
                      <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-400 ring-2 ring-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{executor.name}</h3>
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                        {executor.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{executor.rating}</span>
                        <span className="text-xs text-gray-500">({executor.reviews} отзывов)</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{executor.responseTime}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{executor.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{executor.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {executor.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {executor.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{executor.services.length - 3} еще
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Правая часть - цена и действия */}
                <div className="lg:text-right lg:min-w-[200px]">
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-primary-600">{executor.price}</p>
                    <p className="text-sm text-gray-500">Опыт: {executor.experience}</p>
                    <p className="text-sm text-gray-500">Выполнено заказов: {executor.completedOrders}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => handleBookExecutor(executor)}
                    >
                      Забронировать
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleViewProfile(executor)}
                    >
                      Посмотреть профиль
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Пагинация */}
        {sortedExecutors.length > 0 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Назад
              </Button>
              <Button size="sm" className="bg-primary-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <span className="px-3 py-2 text-gray-500">...</span>
              <Button variant="outline" size="sm">
                10
              </Button>
              <Button variant="outline" size="sm">
                Вперед
              </Button>
            </nav>
          </div>
        )}

        {/* Пустое состояние */}
        {sortedExecutors.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Мастера не найдены
            </h3>
            <p className="text-gray-500 mb-6">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
                setSelectedRating('')
                setPriceRange('')
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </main>
    </div>
  )
} 