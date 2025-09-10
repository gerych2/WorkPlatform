import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, User, Menu, X, Rocket } from 'lucide-react'
import { Buffer } from 'buffer'
import { NotificationCenter } from '../gamification/NotificationCenter'
import { NotificationPortal } from '../ui/NotificationPortal'
import { DropdownPortal } from '../ui/DropdownPortal'

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
          <header className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 shadow-2xl border-b border-white/20 backdrop-blur-sm">
            {/* Анимированный фон */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 via-primary-700/90 to-primary-800/90"></div>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Логотип и навигация */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                     <div className="w-12 h-12 bg-gradient-to-br from-white to-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                       <span className="text-primary-600 font-bold text-xl">P</span>
                     </div>
                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white group-hover:text-primary-100 transition-colors duration-300">ProDoAgency</span>
                <span className="text-xs text-white/70 font-medium">Ваш успех - наша цель</span>
              </div>
            </Link>
            
            {/* Десктопная навигация */}
            <nav className="hidden md:flex ml-12 space-x-2">
              <Link 
                href={`/dashboard/${currentUserRole}`}
                className="relative text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm group"
              >
                <span className="relative z-10">Главная</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link 
                href="/startups" 
                className="relative text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm group flex items-center"
              >
                <Rocket className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                <span className="relative z-10">Стартапы</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              {currentUserRole === 'client' && (
                <>
                  <Link 
                    href="/dashboard/client/search" 
                    className="relative text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm group"
                  >
                    <span className="relative z-10">Найти мастера</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link 
                    href="/dashboard/client/orders" 
                    className="relative text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm group"
                  >
                    <span className="relative z-10">Мои заказы</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </>
              )}
              {currentUserRole === 'executor' && (
                <>
                  <Link 
                    href="/dashboard/executor/calendar" 
                    className="relative text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm group"
                  >
                    <span className="relative z-10">Календарь</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link 
                    href="/dashboard/executor/orders" 
                    className="relative text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm group"
                  >
                    <span className="relative z-10">Заказы</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link 
                    href="/dashboard/executor/subscription" 
                    className="relative text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm group"
                  >
                    <span className="relative z-10">Подписка</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Правая часть - уведомления, профиль */}
          <div className="flex items-center space-x-3">
            {/* Уведомления */}
            <div className="relative">
              {currentUser ? (
                <NotificationCenter userId={currentUser.id} />
              ) : (
                <button
                  onClick={toggleNotifications}
                  className="relative p-3 rounded-2xl text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 group"
                >
                  <Bell className="h-6 w-6 group-hover:animate-pulse" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-xs font-bold text-white animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Выпадающее меню уведомлений */}
              {isNotificationsOpen && (
                <DropdownPortal position="top-right">
                  <div className="w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20 border border-white/30">
                  <div className="py-2">
                    <div className="px-6 py-3 border-b border-gray-100/50">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-primary-600" />
                        Уведомления
                      </h3>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-secondary-50 border-b border-gray-100 last:border-b-0 ${
                              !notification.isRead ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
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
                                <div className="ml-2 w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>
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
                </DropdownPortal>
              )}
            </div>

            {/* Профиль пользователя */}
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-3 p-2 rounded-2xl text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-white to-primary-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-sm font-semibold text-white block">
                    {currentUserName}
                  </span>
                  <span className="text-xs text-white/70 capitalize">
                    {currentUserRole === 'client' ? 'Клиент' : currentUserRole === 'executor' ? 'Исполнитель' : 'Администратор'}
                  </span>
                </div>
              </button>

              {/* Выпадающее меню профиля */}
              {isProfileOpen && (
                <DropdownPortal position="top-right">
                  <div className="w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/20 border border-white/30">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{currentUserName}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {currentUserRole === 'client' ? 'Клиент' : currentUserRole === 'executor' ? 'Исполнитель' : 'Администратор'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href={currentUserRole === 'client' ? '/dashboard/client/profile' : '/dashboard/executor/profile'}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200"
                      >
                        <User className="h-4 w-4 mr-3 text-primary-500" />
                        Профиль
                      </Link>
                      <Link
                        href={currentUserRole === 'client' ? '/dashboard/client/settings' : '/dashboard/executor/settings'}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Настройки
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Выйти
                      </button>
                    </div>
                  </div>
                  </div>
                </DropdownPortal>
              )}
            </div>

            {/* Мобильное меню */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-3 rounded-2xl text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
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
          <NotificationPortal>
            <div className="md:hidden fixed inset-0 top-20 bg-gradient-to-b from-primary-600/95 to-primary-800/95 backdrop-blur-xl z-maximum">
              <div className="px-4 pt-4 pb-6 space-y-2">

              <Link
                href={`/dashboard/${currentUserRole}`}
                className="text-white/90 hover:text-white block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
              >
                Главная
              </Link>
              <Link
                href="/startups"
                className="text-white/90 hover:text-white block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm flex items-center"
              >
                <Rocket className="h-5 w-5 mr-3" />
                Стартапы
              </Link>
              {currentUserRole === 'client' && (
                <>
                  <Link
                    href="/dashboard/client/search"
                    className="text-white/90 hover:text-white block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                  >
                    Найти мастера
                  </Link>
                  <Link
                    href="/dashboard/client/orders"
                    className="text-white/90 hover:text-white block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                  >
                    Мои заказы
                  </Link>
                </>
              )}
              {currentUserRole === 'executor' && (
                <>
                  <Link
                    href="/dashboard/executor/calendar"
                    className="text-white/90 hover:text-white block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                  >
                    Календарь
                  </Link>
                  <Link
                    href="/dashboard/executor/orders"
                    className="text-white/90 hover:text-white block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                  >
                    Заказы
                  </Link>
                  <Link
                    href="/dashboard/executor/subscription"
                    className="text-white/90 hover:text-white block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                  >
                    Подписка
                  </Link>
                </>
              )}
              </div>
            </div>
          </NotificationPortal>
        )}
      </div>
    </header>
  )
} 