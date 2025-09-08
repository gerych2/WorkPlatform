import { PrismaClient } from '@prisma/client'
import { CLIENT_LEVELS, EXECUTOR_LEVELS, CLIENT_ACHIEVEMENTS, EXECUTOR_ACHIEVEMENTS, XP_REWARDS } from './constants'
import { NotificationService } from './notificationService'

const prisma = new PrismaClient()
const notificationService = new NotificationService()

export interface GamificationUser {
  id: number
  experiencePoints: number
  currentLevel: number
  totalXpEarned: number
  dailyXpEarned: number
  weeklyXpEarned: number
  monthlyXpEarned: number
  referralCount: number
  referralEarnings: number
  ordersCount?: number
  reviewsCount?: number
  rating?: number
  averageResponseTime?: number
  dailyLoginStreak?: number
  nightOrdersCount?: number
  weekendOrdersCount?: number
  consecutiveOrders?: number
  isEarlyUser?: boolean
  mentorCount?: number
  totalOrders?: number
  monthlyRating?: number
}

export interface XpReward {
  amount: number
  source: string
  description: string
  metadata?: any
}

export class GamificationService {
  // Получение текущего уровня пользователя
  async getUserLevel(userId: number): Promise<{ level: number; title: string; icon: string; color: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { experiencePoints: true, currentLevel: true, role: true }
    })

    if (!user) {
      throw new Error('Пользователь не найден')
    }

    // Выбираем уровни в зависимости от роли
    const levels = user.role === 'executor' ? EXECUTOR_LEVELS : CLIENT_LEVELS
    const levelConfig = levels.find(l => l.level === user.currentLevel) || levels[0]
    
    return {
      level: levelConfig.level,
      title: levelConfig.title,
      icon: levelConfig.icon,
      color: levelConfig.color
    }
  }

  // Добавление XP пользователю
  async addXp(userId: number, reward: XpReward): Promise<{ newLevel: boolean; levelUp?: any }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        experiencePoints: true,
        currentLevel: true,
        totalXpEarned: true,
        dailyXpEarned: true,
        weeklyXpEarned: true,
        monthlyXpEarned: true
      }
    })

    if (!user) {
      throw new Error('Пользователь не найден')
    }

    const newXp = user.experiencePoints + reward.amount
    const newTotalXp = user.totalXpEarned + reward.amount

    // Обновляем статистику
    const now = new Date()
    const isNewDay = !user.dailyXpEarned || this.isNewDay(now)
    const isNewWeek = !user.weeklyXpEarned || this.isNewWeek(now)
    const isNewMonth = !user.monthlyXpEarned || this.isNewMonth(now)

    const updateData: any = {
      experiencePoints: newXp,
      totalXpEarned: newTotalXp,
      lastXpEarned: now,
      dailyXpEarned: isNewDay ? reward.amount : user.dailyXpEarned + reward.amount,
      weeklyXpEarned: isNewWeek ? reward.amount : user.weeklyXpEarned + reward.amount,
      monthlyXpEarned: isNewMonth ? reward.amount : user.monthlyXpEarned + reward.amount
    }

    // Проверяем повышение уровня
    const newLevel = this.calculateLevel(newXp, (user as any).role)
    let levelUp = null

    if (newLevel > user.currentLevel) {
      updateData.currentLevel = newLevel
      const levels = (user as any).role === 'executor' ? EXECUTOR_LEVELS : CLIENT_LEVELS
      levelUp = {
        oldLevel: user.currentLevel,
        newLevel: newLevel,
        levelConfig: levels.find(l => l.level === newLevel)
      }

      // Отправляем уведомление о повышении уровня
      if (levelUp.levelConfig) {
        await notificationService.notifyLevelUp(
          userId,
          user.currentLevel,
          newLevel,
          levelUp.levelConfig
        )
      }
    } else {
      // Даже если уровень не повысился, обновляем currentLevel для синхронизации
      updateData.currentLevel = newLevel
    }

    // Сохраняем изменения
    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    // Записываем в историю XP
    await prisma.xpHistory.create({
      data: {
        userId: userId,
        xpAmount: reward.amount,
        source: reward.source,
        description: reward.description,
        metadata: reward.metadata
      }
    })

    // Проверяем достижения
    await this.checkAchievements(userId)

    return {
      newLevel: !!levelUp,
      levelUp
    }
  }

  // Проверка и выдача достижений
  async checkAchievements(userId: number): Promise<any[]> {
    const user = await this.getUserWithStats(userId)
    const newAchievements = []

    // Выбираем достижения в зависимости от роли
    const achievements = (user as any).role === 'executor' ? EXECUTOR_ACHIEVEMENTS : CLIENT_ACHIEVEMENTS

    for (const achievement of achievements) {
      // Проверяем, есть ли уже это достижение у пользователя
      const existingAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId: userId,
            achievementId: parseInt(achievement.id)
          }
        }
      })

      if (existingAchievement) continue

      // Проверяем условие достижения
      if (achievement.condition(user)) {
        // Выдаем достижение
        await prisma.userAchievement.create({
          data: {
            userId: userId,
            achievementId: parseInt(achievement.id),
            xpEarned: achievement.xpReward
          }
        })

        // Добавляем XP за достижение
        if (achievement.xpReward > 0) {
          await this.addXp(userId, {
            amount: achievement.xpReward,
            source: 'achievement',
            description: `Достижение: ${achievement.title}`,
            metadata: { achievementId: achievement.id }
          })
        }

        // Отправляем уведомление о достижении
        await notificationService.notifyAchievement(userId, achievement)

        newAchievements.push({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          xpReward: achievement.xpReward
        })
      }
    }

    return newAchievements
  }

  // Получение достижений пользователя
  async getUserAchievements(userId: number): Promise<any[]> {
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { earnedAt: 'desc' }
    })

    return achievements.map(ua => ({
      id: ua.achievement.id,
      title: ua.achievement.title,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      rarity: ua.achievement.rarity,
      xpReward: ua.xpEarned,
      earnedAt: ua.earnedAt,
      isNotified: ua.isNotified
    }))
  }

  // Получение истории XP
  async getXpHistory(userId: number, limit: number = 50): Promise<any[]> {
    const history = await prisma.xpHistory.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
      take: limit
    })

    return history.map(entry => ({
      id: entry.id,
      xpAmount: entry.xpAmount,
      source: entry.source,
      description: entry.description,
      metadata: entry.metadata,
      earnedAt: entry.earnedAt
    }))
  }

  // Получение статистики пользователя
  async getUserStats(userId: number): Promise<any> {
    const user = await this.getUserWithStats(userId)
    const level = await this.getUserLevel(userId)
    const achievements = await this.getUserAchievements(userId)
    const xpHistory = await this.getXpHistory(userId, 10)

    return {
      user: {
        id: user.id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role
      },
      level,
      xp: {
        current: user.experiencePoints,
        total: user.totalXpEarned,
        daily: user.dailyXpEarned,
        weekly: user.weeklyXpEarned,
        monthly: user.monthlyXpEarned
      },
      achievements: {
        total: achievements.length,
        recent: achievements.slice(0, 5),
        byRarity: this.groupAchievementsByRarity(achievements)
      },
      xpHistory: xpHistory.slice(0, 10),
      nextLevel: this.getNextLevelInfo(user.experiencePoints, (user as any).role)
    }
  }

  // Создание реферального кода
  async createReferralCode(userId: number): Promise<string> {
    const code = this.generateReferralCode()
    
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code }
    })

    return code
  }

  // Обработка реферала
  async processReferral(referralCode: string, newUserId: number): Promise<any> {
    const referrer = await prisma.user.findUnique({
      where: { referralCode }
    })

    if (!referrer) {
      throw new Error('Неверный реферальный код')
    }

    // Обновляем данные нового пользователя
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: referrer.id }
    })

    // Обновляем счетчик рефералов
    await prisma.user.update({
      where: { id: referrer.id },
      data: { referralCount: { increment: 1 } }
    })

    // Выдаем награды
    const referrerReward = await this.addXp(referrer.id, {
      amount: XP_REWARDS.REFERRAL_REGISTRATION,
      source: 'referral',
      description: 'Приглашение друга',
      metadata: { referredUserId: newUserId }
    })

    const newUserReward = await this.addXp(newUserId, {
      amount: 50,
      source: 'referral_bonus',
      description: 'Бонус за регистрацию по приглашению',
      metadata: { referrerId: referrer.id }
    })

    return {
      referrerReward,
      newUserReward,
      referrer: {
        id: referrer.id,
        name: referrer.name
      }
    }
  }

  // Вспомогательные методы
  calculateLevel(xp: number, role: string): number {
    const levels = role === 'executor' ? EXECUTOR_LEVELS : CLIENT_LEVELS
    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].xpRequired) {
        return levels[i].level
      }
    }
    return 1
  }

  getNextLevelInfo(currentXp: number, role: string): any {
    const levels = role === 'executor' ? EXECUTOR_LEVELS : CLIENT_LEVELS
    const currentLevel = this.calculateLevel(currentXp, role)
    const nextLevel = levels.find(l => l.level === currentLevel + 1)
    
    if (!nextLevel) {
      return null // Максимальный уровень
    }

    const xpNeeded = nextLevel.xpRequired - currentXp
    const progress = ((currentXp - levels[currentLevel - 1].xpRequired) / 
                     (nextLevel.xpRequired - levels[currentLevel - 1].xpRequired)) * 100

    return {
      level: nextLevel.level,
      title: nextLevel.title,
      icon: nextLevel.icon,
      xpNeeded,
      progress: Math.round(progress)
    }
  }

  private async getUserWithStats(userId: number): Promise<GamificationUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientOrders: true,
        executorOrders: true,
        clientReviews: true,
        executorReviews: true,
        achievements: {
          include: { achievement: true }
        }
      }
    })

    if (!user) {
      throw new Error('Пользователь не найден')
    }

    // Вычисляем статистику
    const ordersCount = user.role === 'client' ? user.clientOrders.length : user.executorOrders.length
    const reviewsCount = user.role === 'client' ? user.clientReviews.length : user.executorReviews.length
    
    // Вычисляем рейтинг
    let rating = 0
    if (user.role === 'executor' && user.executorReviews.length > 0) {
      const totalRating = user.executorReviews.reduce((sum, review) => sum + review.rating, 0)
      rating = totalRating / user.executorReviews.length
    }

    return {
      id: user.id,
      experiencePoints: user.experiencePoints,
      currentLevel: user.currentLevel,
      totalXpEarned: user.totalXpEarned,
      dailyXpEarned: user.dailyXpEarned,
      weeklyXpEarned: user.weeklyXpEarned,
      monthlyXpEarned: user.monthlyXpEarned,
      referralCount: user.referralCount,
      referralEarnings: Number(user.referralEarnings),
      ordersCount,
      reviewsCount,
      rating,
      averageResponseTime: 0, // TODO: вычислить из данных
      dailyLoginStreak: 0, // TODO: вычислить из данных
      nightOrdersCount: 0, // TODO: вычислить из данных
      weekendOrdersCount: 0, // TODO: вычислить из данных
      consecutiveOrders: 0, // TODO: вычислить из данных
      isEarlyUser: user.createdAt < new Date('2024-01-01'),
      mentorCount: 0, // TODO: вычислить из данных
      totalOrders: ordersCount,
      monthlyRating: rating // TODO: вычислить за месяц
    }
  }

  private groupAchievementsByRarity(achievements: any[]): any {
    const grouped = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    }

    achievements.forEach(achievement => {
      grouped[achievement.rarity as keyof typeof grouped]++
    })

    return grouped
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private isNewDay(now: Date): boolean {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return now >= today
  }

  private isNewWeek(now: Date): boolean {
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    return now >= startOfWeek
  }

  private isNewMonth(now: Date): boolean {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return now >= startOfMonth
  }
}

export const gamificationService = new GamificationService()
