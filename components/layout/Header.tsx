import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, User, Menu, X } from 'lucide-react'
import { Buffer } from 'buffer'
import { NotificationCenter } from '../gamification/NotificationCenter'

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
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user && user.id && user.role) {
          setCurrentUser(user)
          setCurrentUserRole(user.role)
          setCurrentUserName(user.name)
          // Загружаем уведомления для пользователя
          fetchNotifications(user)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  // Периодическое обновление уведомлений
  useEffect(() => {
    if (!currentUser) return

    const interval = setInterval(() => {
      fetchNotifications(currentUser)
    }, 30000) // Обновляем каждые 30 секунд

    return () => clearInterval(interval)
  }, [currentUser])

  const fetchNotifications = async (user: any) => {
    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(user)).toString('base64')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const markNotificationsAsRead = async () => {
    if (!currentUser || notifications.length === 0) return

    const unreadNotifications = notifications.filter(n => !n.isRead)
    if (unreadNotifications.length === 0) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(currentUser)).toString('base64')}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          notificationIds: unreadNotifications.map(n => n.id),
          isRead: true
        })
      })

      if (response.ok) {
        // Обновляем локальное состояние
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true
          }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
    // Обновляем уведомления при открытии меню
    if (!isNotificationsOpen && currentUser) {
      fetchNotifications(currentUser)
    } else if (isNotificationsOpen) {
      // Помечаем уведомления как прочитанные при закрытии
      markNotificationsAsRead()
    }
  }
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen)

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.href = '/'
  }



  return (
    <header className="header-bg shadow-sm border-b border-primary-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип и навигация */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">ProDoAgency</span>
            </Link>
            
            {/* Десктопная навигация */}
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link 
                href={`/dashboard/${currentUserRole}`}
                className="text-white hover:text-secondary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Главная
              </Link>
              {currentUserRole === 'client' && (
                <>
                  <Link 
                    href="/dashboard/client/search" 
                    className="text-white hover:text-secondary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Найти мастера
                  </Link>
                  <Link 
                    href="/dashboard/client/orders" 
                    className="text-white hover:text-secondary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Мои заказы
                  </Link>
                </>
              )}
              {currentUserRole === 'executor' && (
                <>
                  <Link 
                    href="/dashboard/executor/calendar" 
                    className="text-white hover:text-secondary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Календарь
                  </Link>
                  <Link 
                    href="/dashboard/executor/orders" 
                    className="text-white hover:text-secondary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Заказы
                  </Link>
                  <Link 
                    href="/dashboard/executor/subscription" 
                    className="text-white hover:text-secondary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Подписка
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Правая часть - поиск, уведомления, профиль */}
          <div className="flex items-center space-x-4">


            {/* Уведомления */}
            <div className="relative">
              {currentUser ? (
                <NotificationCenter userId={currentUser.id} />
              ) : (
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-full text-white hover:text-secondary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-600 transition-colors duration-200"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
              )}

              {/* Выпадающее меню уведомлений */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-secondary-200">
                      <h3 className="text-sm font-medium text-gray-900">Уведомления</h3>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-secondary-50 border-b border-gray-100 last:border-b-0 ${
                              !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.createdAt).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
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
                className="flex items-center space-x-2 p-2 rounded-full text-white hover:text-secondary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-600 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-900" />
                </div>
                <span className="hidden md:block text-sm font-medium text-white">
                  {currentUserName}
                </span>
              </button>

              {/* Выпадающее меню профиля */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      href={currentUserRole === 'client' ? '/dashboard/client/profile' : '/dashboard/executor/profile'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-secondary-50"
                    >
                      Профиль
                    </Link>
                    <Link
                      href={currentUserRole === 'client' ? '/dashboard/client/settings' : '/dashboard/executor/settings'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-secondary-50"
                    >
                      Настройки
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-secondary-50"
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
              className="md:hidden p-2 rounded-md text-white hover:text-secondary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-600 transition-colors duration-200"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-primary-500">

              <Link
                href={`/dashboard/${currentUserRole}`}
                className="text-white hover:text-secondary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                Главная
              </Link>
              {currentUserRole === 'client' && (
                <>
                  <Link
                    href="/dashboard/client/search"
                    className="text-white hover:text-secondary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    Найти мастера
                  </Link>
                  <Link
                    href="/dashboard/client/orders"
                    className="text-white hover:text-secondary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    Мои заказы
                  </Link>
                </>
              )}
              {currentUserRole === 'executor' && (
                <>
                  <Link
                    href="/dashboard/executor/calendar"
                    className="text-white hover:text-secondary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    Календарь
                  </Link>
                  <Link
                    href="/dashboard/executor/orders"
                    className="text-white hover:text-secondary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    Заказы
                  </Link>
                  <Link
                    href="/dashboard/executor/subscription"
                    className="text-white hover:text-secondary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
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