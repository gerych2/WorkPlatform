import { PrismaClient } from '@prisma/client'
import { XP_REWARDS } from './constants'
import { GamificationService } from './gamificationService'

const prisma = new PrismaClient()

export interface ReferralReward {
  id: number
  referrerId: number
  referredId: number
  rewardType: 'xp' | 'bonus' | 'achievement'
  rewardAmount: number
  xpAmount: number
  description: string
  isPaid: boolean
  paidAt?: Date
  createdAt: Date
}

export class ReferralService {
  // Создание реферального кода
  async createReferralCode(userId: number): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, role: true }
    })

    if (!user) {
      throw new Error('Пользователь не найден')
    }

    // Если код уже есть, возвращаем его
    if (user.referralCode) {
      return user.referralCode
    }

    // Генерируем уникальный код
    const code = this.generateReferralCode(user.role)
    
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code }
    })

    return code
  }

  // Использование реферального кода
  async useReferralCode(userId: number, referralCode: string): Promise<{ success: boolean; message: string; rewards?: any }> {
    // Находим пользователя, который пригласил
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true, role: true, referralCount: true }
    })

    if (!referrer) {
      return { success: false, message: 'Неверный реферальный код' }
    }

    if (referrer.id === userId) {
      return { success: false, message: 'Нельзя использовать свой реферальный код' }
    }

    // Проверяем, не использовал ли уже этот пользователь реферальный код
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true, role: true }
    })

    if (user?.referredBy) {
      return { success: false, message: 'Вы уже использовали реферальный код' }
    }

    // Обновляем пользователя
    await prisma.user.update({
      where: { id: userId },
      data: { referredBy: referrer.id }
    })

    // Увеличиваем счетчик рефералов
    await prisma.user.update({
      where: { id: referrer.id },
      data: { referralCount: referrer.referralCount + 1 }
    })

    // Создаем награды
    const rewards = await this.createReferralRewards(referrer.id, userId, referrer.role, user?.role || 'client')

    // Проверяем уровни после начисления XP
    try {
      const gamificationService = new GamificationService()
      
      // Проверяем уровень пригласившего
      const referrerLevel = gamificationService.calculateLevel(
        (await prisma.user.findUnique({ where: { id: referrer.id }, select: { experiencePoints: true } }))?.experiencePoints || 0,
        referrer.role
      )
      const referrerCurrentLevel = (await prisma.user.findUnique({ where: { id: referrer.id }, select: { currentLevel: true } }))?.currentLevel || 1
      if (referrerLevel > referrerCurrentLevel) {
        await prisma.user.update({
          where: { id: referrer.id },
          data: { currentLevel: referrerLevel }
        })
      }
      
      // Проверяем уровень приглашенного
      const referredLevel = gamificationService.calculateLevel(
        (await prisma.user.findUnique({ where: { id: userId }, select: { experiencePoints: true } }))?.experiencePoints || 0,
        user?.role || 'client'
      )
      const referredCurrentLevel = (await prisma.user.findUnique({ where: { id: userId }, select: { currentLevel: true } }))?.currentLevel || 1
      if (referredLevel > referredCurrentLevel) {
        await prisma.user.update({
          where: { id: userId },
          data: { currentLevel: referredLevel }
        })
      }
    } catch (error) {
      console.error('Ошибка при проверке уровней:', error)
    }

    return {
      success: true,
      message: 'Реферальный код успешно применен!',
      rewards
    }
  }

  // Создание наград за реферал
  private async createReferralRewards(referrerId: number, referredId: number, referrerRole: string, referredRole: string): Promise<any> {
    const rewards = []
    const gamificationService = new GamificationService()

    // Награды для пригласившего
    if (referrerRole === 'client') {
      // Клиент пригласил клиента
      const referrerXp = XP_REWARDS.REFERRAL_REGISTRATION
      
      // Используем GamificationService для начисления XP (автоматически обновит уровень)
      await gamificationService.addXp(referrerId, {
        amount: referrerXp,
        source: 'referral',
        description: 'Приглашение друга',
        metadata: { referredUserId: referredId }
      })

      rewards.push({
        type: 'referrer',
        xp: referrerXp,
        bonus: 'Приоритет в поиске на месяц'
      })
    } else if (referrerRole === 'executor') {
      // Исполнитель пригласил исполнителя
      const referrerXp = XP_REWARDS.REFERRAL_EXECUTOR_REGISTRATION
      
      // Используем GamificationService для начисления XP (автоматически обновит уровень)
      await gamificationService.addXp(referrerId, {
        amount: referrerXp,
        source: 'referral',
        description: 'Приглашение коллеги',
        metadata: { referredUserId: referredId }
      })

      rewards.push({
        type: 'referrer',
        xp: referrerXp,
        bonus: 'Неделя бесплатной подписки'
      })
    }

    // Награды для приглашенного
    if (referredRole === 'client') {
      const referredXp = XP_REWARDS.REFERRAL_REGISTRATION / 2
      
      // Используем GamificationService для начисления XP (автоматически обновит уровень)
      await gamificationService.addXp(referredId, {
        amount: referredXp,
        source: 'referral',
        description: 'Регистрация по приглашению',
        metadata: { referrerUserId: referrerId }
      })

      rewards.push({
        type: 'referred',
        xp: referredXp,
        bonus: 'VIP статус на месяц'
      })
    } else if (referredRole === 'executor') {
      const referredXp = XP_REWARDS.REFERRAL_EXECUTOR_REGISTRATION / 2
      
      // Используем GamificationService для начисления XP (автоматически обновит уровень)
      await gamificationService.addXp(referredId, {
        amount: referredXp,
        source: 'referral',
        description: 'Регистрация по приглашению',
        metadata: { referrerUserId: referrerId }
      })

      rewards.push({
        type: 'referred',
        xp: referredXp,
        bonus: 'Месяц бесплатной подписки'
      })
    }

    // Достижения уже проверяются в GamificationService.addXp()

    return rewards
  }

  // Награда за первую подписку реферала (для исполнителей)
  async rewardReferralSubscription(referredId: number): Promise<void> {
    const gamificationService = new GamificationService()
    
    const user = await prisma.user.findUnique({
      where: { id: referredId },
      select: { referredBy: true, role: true }
    })

    if (!user?.referredBy) return

    const referrer = await prisma.user.findUnique({
      where: { id: user.referredBy },
      select: { role: true }
    })

    if (!referrer) return

    // Награждаем пригласившего за подписку реферала
    if (referrer.role === 'executor' && user.role === 'executor') {
      const xpReward = XP_REWARDS.REFERRAL_EXECUTOR_SUBSCRIPTION
      
      // Используем GamificationService для начисления XP (автоматически обновит уровень)
      await gamificationService.addXp(user.referredBy, {
        amount: xpReward,
        source: 'referral',
        description: 'Реферал оформил подписку',
        metadata: { referredUserId: referredId }
      })

      // Создаем запись о награде
      await prisma.referralReward.create({
        data: {
          referrerId: user.referredBy,
          referredId: referredId,
          rewardType: 'xp',
          rewardAmount: 0,
          xpAmount: xpReward,
          description: 'Реферал оформил подписку',
          isPaid: true,
          paidAt: new Date()
        }
      })
    }
  }

  // Получение статистики рефералов
  async getReferralStats(userId: number): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referralCount: true,
        referralEarnings: true,
        referredBy: true
      }
    })

    if (!user) {
      throw new Error('Пользователь не найден')
    }

    // Получаем список рефералов
    const referrals = await prisma.user.findMany({
      where: { referredBy: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        experiencePoints: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Получаем награды
    const rewards = await prisma.referralReward.findMany({
      where: { referrerId: userId },
      select: {
        id: true,
        rewardType: true,
        rewardAmount: true,
        xpAmount: true,
        description: true,
        isPaid: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      referralCode: user.referralCode,
      totalReferrals: user.referralCount,
      totalEarnings: user.referralEarnings,
      referrals: referrals,
      rewards: rewards,
      isReferred: !!user.referredBy
    }
  }

  // Генерация реферального кода
  private generateReferralCode(role: string): string {
    const prefix = role === 'executor' ? 'EXE' : 'CLI'
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}${random}`
  }
}
