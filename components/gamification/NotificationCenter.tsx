'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, Check, Trophy, Zap, Crown, Gift, CreditCard, MessageSquare, AlertCircle, Reply } from 'lucide-react'
import { DropdownPortal } from '../ui/DropdownPortal'

interface Notification {
  id: number
  title: string
  message: string
  type: 'level_up' | 'achievement' | 'xp_gain' | 'referral' | 'subscription' | 'support_ticket_created' | 'support_ticket_admin' | 'support_ticket_reply'
  isRead: boolean
  createdAt: string
  metadata?: any
}

interface NotificationCenterProps {
  userId: number
  className?: string
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  className = ''
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all?userId=${userId}`, {
        method: 'POST'
      })
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'level_up':
        return <Crown className="h-5 w-5 text-secondary-500" />
      case 'achievement':
        return <Trophy className="h-5 w-5 text-primary-500" />
      case 'xp_gain':
        return <Zap className="h-5 w-5 text-primary-500" />
      case 'referral':
        return <Gift className="h-5 w-5 text-secondary-500" />
      case 'subscription':
        return <CreditCard className="h-5 w-5 text-indigo-500" />
      case 'support_ticket_created':
        return <MessageSquare className="h-5 w-5 text-primary-500" />
      case 'support_ticket_admin':
        return <AlertCircle className="h-5 w-5 text-secondary-500" />
      case 'support_ticket_reply':
        return <Reply className="h-5 w-5 text-secondary-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'level_up':
        return 'bg-secondary-50 border-secondary-200'
      case 'achievement':
        return 'bg-primary-50 border-primary-200'
      case 'xp_gain':
        return 'bg-primary-50 border-primary-200'
      case 'referral':
        return 'bg-secondary-50 border-secondary-200'
      case 'subscription':
        return 'bg-indigo-50 border-indigo-200'
      case 'support_ticket_created':
        return 'bg-primary-50 border-primary-200'
      case 'support_ticket_admin':
        return 'bg-secondary-50 border-secondary-200'
      case 'support_ticket_reply':
        return 'bg-secondary-50 border-secondary-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Bell className="h-6 w-6" />
        </button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Кнопка уведомлений */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Панель уведомлений */}
      {isOpen && (
        <DropdownPortal position="top-right">
          <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Отметить все как прочитанные
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>У вас пока нет уведомлений</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Футер */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button className="w-full text-sm text-primary-600 hover:text-primary-800 transition-colors">
                Показать все уведомления
              </button>
            </div>
          )}
          </div>
        </DropdownPortal>
      )}
    </div>
  )
}
