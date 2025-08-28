import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, User, Menu, X, Search } from 'lucide-react'

interface HeaderProps {
  userRole?: 'client' | 'executor' | 'admin'
  userName?: string
  notificationsCount?: number
}

export const Header: React.FC<HeaderProps> = ({ 
  userRole = 'client', 
  userName = 'Пользователь',
  notificationsCount = 0 
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserRole, setCurrentUserRole] = useState(userRole)
  const [currentUserName, setCurrentUserName] = useState(userName)

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const userData = localStorage.getItem('current_user')
    if (userData) {
      const user = JSON.parse(userData)
      setCurrentUser(user)
      setCurrentUserRole(user.role)
      setCurrentUserName(user.name)
    }
  }, [])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen)
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип и навигация */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Service Platform</span>
            </Link>
            
            {/* Десктопная навигация */}
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link 
                href={`/dashboard/${currentUserRole}`}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Главная
              </Link>
              {currentUserRole === 'client' && (
                <>
                  <Link 
                    href="/dashboard/client/search" 
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Найти мастера
                  </Link>
                  <Link 
                    href="/dashboard/client/orders" 
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Мои заказы
                  </Link>
                </>
              )}
              {currentUserRole === 'executor' && (
                <>
                  <Link 
                    href="/dashboard/executor/calendar" 
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Календарь
                  </Link>
                  <Link 
                    href="/dashboard/executor/orders" 
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Заказы
                  </Link>
                  <Link 
                    href="/dashboard/executor/subscription" 
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Подписка
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Правая часть - поиск, уведомления, профиль */}
          <div className="flex items-center space-x-4">
            {/* Поиск */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск услуг..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Уведомления */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Bell className="h-6 w-6" />
                {notificationsCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </button>

              {/* Выпадающее меню уведомлений */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Уведомления</h3>
                    </div>
                    {notificationsCount > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-gray-50">
                          <p className="text-sm text-gray-900">У вас новый заказ от клиента</p>
                          <p className="text-xs text-gray-500 mt-1">2 минуты назад</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50">
                          <p className="text-sm text-gray-900">Исполнитель подтвердил ваш заказ</p>
                          <p className="text-xs text-gray-500 mt-1">1 час назад</p>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Нет новых уведомлений
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Профиль пользователя */}
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-2 p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {currentUserName}
                </span>
              </button>

              {/* Выпадающее меню профиля */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      href={currentUserRole === 'client' ? '/dashboard/client/profile' : '/dashboard/executor/profile'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Профиль
                    </Link>
                    <Link
                      href={currentUserRole === 'client' ? '/dashboard/client/settings' : '/dashboard/executor/settings'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Настройки
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        localStorage.removeItem('current_user')
                        window.location.href = '/'
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Мобильное меню */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href={`/dashboard/${currentUserRole}`}
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Главная
              </Link>
              {currentUserRole === 'client' && (
                <>
                  <Link
                    href="/dashboard/client/search"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Найти мастера
                  </Link>
                  <Link
                    href="/dashboard/client/orders"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Мои заказы
                  </Link>
                </>
              )}
              {currentUserRole === 'executor' && (
                <>
                  <Link
                    href="/dashboard/executor/calendar"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Календарь
                  </Link>
                  <Link
                    href="/dashboard/executor/orders"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Заказы
                  </Link>
                  <Link
                    href="/dashboard/executor/subscription"
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Подписка
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 