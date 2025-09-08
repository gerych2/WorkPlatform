import { PrismaClient } from '@prisma/client'
import { emailService } from '../email/emailService'

const prisma = new PrismaClient()

export interface NotificationData {
  userId: number
  type: 'level_up' | 'achievement' | 'xp_gain' | 'referral' | 'subscription' | 'support_ticket_created' | 'support_ticket_admin' | 'support_ticket_reply'
  title: string
  message: string
  icon?: string
  xpAmount?: number
  metadata?: any
}

export class NotificationService {
  // Создание уведомления
  async createNotification(data: NotificationData): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          // metadata: data.metadata || {},
          isRead: false
        }
      })

      // Отправляем email уведомление
      await this.sendEmailNotification(data)
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  // Отправка email уведомления
  private async sendEmailNotification(data: NotificationData): Promise<void> {
    try {
      // Получаем email пользователя
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true }
      })

      if (!user?.email) return

      // Отправляем email в зависимости от типа уведомления
      switch (data.type) {
        case 'level_up':
          if (data.metadata?.levelConfig) {
            await emailService.sendLevelUpNotification(user.email, data.metadata.levelConfig)
          }
          break
        // Добавим другие типы уведомлений по мере необходимости
      }
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  // Создание уведомления о повышении уровня
  async notifyLevelUp(userId: number, oldLevel: number, newLevel: number, levelConfig: any): Promise<void> {
    await this.createNotification({
      userId,
      type: 'level_up',
      title: '🎉 Поздравляем с повышением уровня!',
      message: `Вы достигли уровня ${newLevel} - ${levelConfig.title}! ${levelConfig.icon}`,
      icon: levelConfig.icon,
      metadata: {
        oldLevel,
        newLevel,
        levelConfig
      }
    })
  }

  // Создание уведомления о получении достижения
  async notifyAchievement(userId: number, achievement: any): Promise<void> {
    await this.createNotification({
      userId,
      type: 'achievement',
      title: '🏆 Новое достижение!',
      message: `Вы получили достижение "${achievement.title}"! ${achievement.icon}`,
      icon: achievement.icon,
      xpAmount: achievement.xpReward,
      metadata: {
        achievementId: achievement.id,
        achievement
      }
    })
  }

  // Создание уведомления о получении XP
  async notifyXpGain(userId: number, xpAmount: number, source: string, description: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'xp_gain',
      title: '⚡ Получен XP!',
      message: `+${xpAmount} XP за ${description}`,
      xpAmount,
      metadata: {
        source,
        description
      }
    })
  }

  // Создание уведомления о реферале
  async notifyReferral(userId: number, referralType: 'new_referral' | 'referral_activity', data: any): Promise<void> {
    if (referralType === 'new_referral') {
      await this.createNotification({
        userId,
        type: 'referral',
        title: '👥 Новый реферал!',
        message: `Ваш друг ${data.referredName} зарегистрировался по вашей ссылке!`,
        icon: '🎁',
        xpAmount: data.xpReward,
        metadata: data
      })
    } else if (referralType === 'referral_activity') {
      await this.createNotification({
        userId,
        type: 'referral',
        title: '🎯 Реферал активен!',
        message: `Ваш реферал ${data.referredName} ${data.activity}!`,
        icon: '⭐',
        xpAmount: data.xpReward,
        metadata: data
      })
    }
  }

  // Создание уведомления о подписке
  async notifySubscription(userId: number, subscriptionType: 'new' | 'renewal', data: any): Promise<void> {
    if (subscriptionType === 'new') {
      await this.createNotification({
        userId,
        type: 'subscription',
        title: '💳 Подписка активирована!',
        message: `Ваша подписка "${data.planName}" успешно активирована!`,
        icon: '👑',
        xpAmount: data.xpReward,
        metadata: data
      })
    } else if (subscriptionType === 'renewal') {
      await this.createNotification({
        userId,
        type: 'subscription',
        title: '🔄 Подписка продлена!',
        message: `Ваша подписка "${data.planName}" продлена на ${data.period}!`,
        icon: '💎',
        xpAmount: data.xpReward,
        metadata: data
      })
    }
  }

  // Получение уведомлений пользователя
  async getUserNotifications(userId: number, limit: number = 20): Promise<any[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
      return notifications
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  // Отметить уведомление как прочитанное
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Отметить все уведомления как прочитанные
  async markAllAsRead(userId: number): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Получение количества непрочитанных уведомлений
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: { userId, isRead: false }
      })
      return count
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Удаление старых уведомлений (старше 30 дней)
  async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          isRead: true
        }
      })
    } catch (error) {
      console.error('Error cleaning up old notifications:', error)
    }
  }
}
