'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Copy, Share2, Users, Gift, Star, CreditCard, Crown } from 'lucide-react'

interface ReferralSystemProps {
  userId: number
  className?: string
}

export const ReferralSystem: React.FC<ReferralSystemProps> = ({
  userId,
  className = ''
}) => {
  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    referrals: [],
    rewards: [],
    isReferred: false
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [userId])

  const fetchReferralData = async () => {
    try {
      // Получаем статистику рефералов
      const statsResponse = await fetch(`/api/gamification/referral?userId=${userId}`)
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setReferralStats(statsData.data)
          setReferralCode(statsData.data.referralCode || '')
        }
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = async () => {
    const link = `${window.location.origin}/auth/register?ref=${referralCode}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferralLink = async () => {
    const link = `${window.location.origin}/auth/register?ref=${referralCode}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Присоединяйтесь к ProDoAgency!',
          text: 'Я использую ProDoAgency для поиска мастеров. Присоединяйтесь по моей ссылке!',
          url: link
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback для браузеров без поддержки Web Share API
      copyReferralLink()
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border border-secondary-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-secondary-200 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center space-x-2 mb-6">
        <Users className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Пригласите друзей</h2>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-primary-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">{referralStats.totalReferrals}</div>
          <div className="text-sm text-primary-700">Приглашено друзей</div>
        </div>
        <div className="text-center p-4 bg-secondary-50 rounded-lg">
          <div className="text-2xl font-bold text-secondary-600">{referralStats.totalEarnings} XP</div>
          <div className="text-sm text-secondary-700">Заработано XP</div>
        </div>
      </div>

      {/* Реферальный код */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ваш реферальный код
        </label>
        <div className="flex space-x-2">
          <Input
            value={referralCode}
            readOnly
            className="font-mono text-lg"
          />
          <Button
            onClick={copyReferralLink}
            variant="outline"
            className="px-4"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Скопировано!' : 'Копировать'}
          </Button>
        </div>
      </div>

      {/* Реферальная ссылка */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Реферальная ссылка
        </label>
        <div className="flex space-x-2">
          <Input
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${referralCode}`}
            readOnly
            className="text-sm"
          />
          <Button
            onClick={shareReferralLink}
            variant="outline"
            className="px-4"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Поделиться
          </Button>
        </div>
      </div>

      {/* Награды */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎁 Награды за приглашения</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Gift className="h-5 w-5 text-secondary-600" />
              <div>
                <div className="font-medium text-gray-900">Регистрация друга</div>
                <div className="text-sm text-gray-600">+100 XP + Приоритет в поиске</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-secondary-600">+100 XP</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Star className="h-5 w-5 text-secondary-600" />
              <div>
                <div className="font-medium text-gray-900">Первый поиск друга</div>
                <div className="text-sm text-gray-600">+50 XP + VIP статус</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-secondary-600">+50 XP</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary-600" />
              <div>
                <div className="font-medium text-gray-900">5 друзей</div>
                <div className="text-sm text-gray-600">+300 XP + Статус амбассадора</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-primary-600">+300 XP</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-primary-600" />
              <div>
                <div className="font-medium text-gray-900">Реферал-исполнитель подписался</div>
                <div className="text-sm text-gray-600">+300 XP + Неделя бесплатной подписки</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-primary-600">+300 XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Инструкции */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Как это работает:</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Поделитесь ссылкой с друзьями</li>
          <li>2. Друг регистрируется по вашей ссылке</li>
          <li>3. Вы получаете XP за его активность</li>
          <li>4. Друг получает бонусы за регистрацию</li>
          <li>5. Если друг-исполнитель подписывается - вы получаете еще больше XP!</li>
        </ol>
      </div>
    </div>
  )
}
