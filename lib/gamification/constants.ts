// Константы для системы геймификации

export interface LevelConfig {
  level: number
  title: string
  description: string
  icon: string
  xpRequired: number
  benefits: string[]
  color: string
}

export interface AchievementConfig {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  category: 'orders' | 'reviews' | 'referrals' | 'activity' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  condition: (user: any) => boolean
}

// Конфигурация уровней для клиентов
export const CLIENT_LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: "Новичок",
    description: "Добро пожаловать в ProDoAgency!",
    icon: "🌱",
    xpRequired: 0,
    benefits: [
      "Базовые функции",
      "Поиск мастеров",
      "Создание заказов"
    ],
    color: "#6B7280"
  },
  {
    level: 2,
    title: "Активный клиент",
    description: "Вы активно используете платформу",
    icon: "⚡",
    xpRequired: 100,
    benefits: [
      "Приоритет в поиске (+20%)",
      "Быстрая поддержка",
      "Уведомления о новых мастерах",
      "Доступ к статистике"
    ],
    color: "#3B82F6"
  },
  {
    level: 3,
    title: "Постоянный клиент",
    description: "Вы стали постоянным пользователем",
    icon: "⭐",
    xpRequired: 300,
    benefits: [
      "VIP поддержка",
      "Эксклюзивные предложения",
      "Приоритет в поиске (+40%)",
      "Ранний доступ к новым функциям",
      "Расширенная аналитика"
    ],
    color: "#10B981"
  },
  {
    level: 4,
    title: "VIP клиент",
    description: "Вы VIP клиент платформы",
    icon: "👑",
    xpRequired: 600,
    benefits: [
      "Персональный менеджер",
      "Эксклюзивные мастера",
      "Приоритет в поиске (+60%)",
      "Бета-тестирование функций",
      "Приоритетная поддержка"
    ],
    color: "#8B5CF6"
  },
  {
    level: 5,
    title: "Амбассадор",
    description: "Вы амбассадор платформы!",
    icon: "🏆",
    xpRequired: 1000,
    benefits: [
      "Все привилегии",
      "Участие в программе развития",
      "Эксклюзивные акции",
      "Статус бета-тестера",
      "Влияние на развитие платформы"
    ],
    color: "#F59E0B"
  }
]

// Конфигурация уровней для исполнителей
export const EXECUTOR_LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: "Новичок",
    description: "Добро пожаловать в ProDoAgency!",
    icon: "🌱",
    xpRequired: 0,
    benefits: [
      "Базовые функции",
      "Создание профиля",
      "Просмотр заказов"
    ],
    color: "#6B7280"
  },
  {
    level: 2,
    title: "Активный мастер",
    description: "Вы активно работаете на платформе",
    icon: "⚡",
    xpRequired: 200,
    benefits: [
      "Приоритет в поиске (+30%)",
      "Быстрая верификация",
      "Уведомления о новых заказах",
      "Базовая аналитика"
    ],
    color: "#3B82F6"
  },
  {
    level: 3,
    title: "Профессионал",
    description: "Вы стали профессионалом",
    icon: "⭐",
    xpRequired: 500,
    benefits: [
      "VIP поддержка",
      "Эксклюзивные заказы",
      "Приоритет в поиске (+50%)",
      "Расширенная аналитика",
      "Приоритетные уведомления"
    ],
    color: "#10B981"
  },
  {
    level: 4,
    title: "Мастер",
    description: "Вы мастер своего дела",
    icon: "👑",
    xpRequired: 1000,
    benefits: [
      "Персональный менеджер",
      "Премиум заказы",
      "Приоритет в поиске (+70%)",
      "Полная аналитика",
      "Эксклюзивные возможности"
    ],
    color: "#8B5CF6"
  },
  {
    level: 5,
    title: "Эксперт",
    description: "Вы эксперт платформы!",
    icon: "🏆",
    xpRequired: 2000,
    benefits: [
      "Все привилегии",
      "Участие в программе развития",
      "Эксклюзивные возможности",
      "Статус партнера",
      "Влияние на развитие платформы"
    ],
    color: "#F59E0B"
  }
]

// Универсальные уровни (для обратной совместимости)
export const LEVELS = CLIENT_LEVELS

// Достижения для клиентов
export const CLIENT_ACHIEVEMENTS: AchievementConfig[] = [
  // Мотивация к активности
  {
    id: '1',
    title: 'Первый поиск',
    description: 'Найдите своего первого мастера',
    icon: '🔍',
    xpReward: 50,
    category: 'activity',
    rarity: 'common',
    condition: (user) => user.searchCount >= 1
  },
  {
    id: '2',
    title: 'Критик',
    description: 'Оставьте 10 отзывов',
    icon: '⭐',
    xpReward: 100,
    category: 'reviews',
    rarity: 'common',
    condition: (user) => user.reviewsCount >= 10
  },
  {
    id: '3',
    title: 'Исследователь',
    description: 'Просмотрите 50 профилей мастеров',
    icon: '🔍',
    xpReward: 150,
    category: 'activity',
    rarity: 'rare',
    condition: (user) => user.profilesViewed >= 50
  },
  {
    id: '4',
    title: 'Верный клиент',
    description: 'Используйте платформу 3 месяца',
    icon: '💎',
    xpReward: 200,
    category: 'activity',
    rarity: 'rare',
    condition: (user) => user.monthsActive >= 3
  },
  {
    id: '5',
    title: 'Друг платформы',
    description: 'Пригласите 5 друзей',
    icon: '👥',
    xpReward: 300,
    category: 'referrals',
    rarity: 'rare',
    condition: (user) => user.referralCount >= 5
  },
  {
    id: '6',
    title: 'Амбассадор',
    description: 'Пригласите 20 друзей',
    icon: '🎖️',
    xpReward: 1000,
    category: 'referrals',
    rarity: 'legendary',
    condition: (user) => user.referralCount >= 20
  }
]

// Достижения для исполнителей
export const EXECUTOR_ACHIEVEMENTS: AchievementConfig[] = [
  // Мотивация к подписке
  {
    id: '1',
    title: 'Первая подписка',
    description: 'Оформите первую подписку',
    icon: '💳',
    xpReward: 200,
    category: 'activity',
    rarity: 'common',
    condition: (user) => user.hasActiveSubscription
  },
  {
    id: '2',
    title: 'Качественная работа',
    description: 'Получите 20 отзывов на 5 звезд',
    icon: '🌟',
    xpReward: 300,
    category: 'reviews',
    rarity: 'rare',
    condition: (user) => user.fiveStarReviews >= 20
  },
  {
    id: '3',
    title: 'Активный мастер',
    description: 'Выполните 30 заказов за месяц',
    icon: '⚡',
    xpReward: 400,
    category: 'orders',
    rarity: 'rare',
    condition: (user) => user.monthlyOrders >= 30
  },
  {
    id: '4',
    title: 'Скоростной демон',
    description: 'Отвечайте на заказы за 5 минут',
    icon: '🚀',
    xpReward: 150,
    category: 'orders',
    rarity: 'common',
    condition: (user) => user.averageResponseTime <= 5
  },
  {
    id: '5',
    title: 'Магнит коллег',
    description: 'Пригласите 3 исполнителей',
    icon: '🧲',
    xpReward: 500,
    category: 'referrals',
    rarity: 'rare',
    condition: (user) => user.referralCount >= 3
  },
  {
    id: '6',
    title: 'Верный мастер',
    description: 'Работайте на платформе 6 месяцев',
    icon: '💎',
    xpReward: 1000,
    category: 'activity',
    rarity: 'epic',
    condition: (user) => user.monthsActive >= 6
  },
  {
    id: '7',
    title: 'Неуязвимый',
    description: 'Завершите 100 заказов подряд без отмен',
    icon: '🛡️',
    xpReward: 1500,
    category: 'orders',
    rarity: 'legendary',
    condition: (user) => user.consecutiveOrders >= 100
  }
]

// Универсальные достижения (для обратной совместимости)
export const ACHIEVEMENTS = CLIENT_ACHIEVEMENTS

// XP за различные действия
export const XP_REWARDS = {
  // Клиенты - активность
  DAILY_LOGIN: 2,
  SEARCH_MASTER: 5,
  VIEW_PROFILE: 1,
  LEAVE_REVIEW: 10,
  SHARE_SOCIAL: 3,
  UPDATE_PROFILE: 5,
  
  // Клиенты - рефералы
  REFERRAL_REGISTRATION: 100,
  REFERRAL_FIRST_SEARCH: 50,
  REFERRAL_5_SEARCHES: 100,
  REFERRAL_20_SEARCHES: 200,
  
  // Исполнители - подписки (ГЛАВНАЯ МОТИВАЦИЯ!)
  FIRST_SUBSCRIPTION: 200,
  MONTHLY_SUBSCRIPTION: 100,
  YEARLY_SUBSCRIPTION: 500,
  SUBSCRIPTION_RENEWAL: 150,
  
  // Исполнители - качество
  GET_5_STAR_REVIEW: 25,
  GET_4_STAR_REVIEW: 15,
  GET_3_STAR_REVIEW: 5,
  COMPLETE_ORDER: 15,
  RESPOND_5_MIN: 8,
  RESPOND_1_MIN: 15,
  
  // Исполнители - активность
  EXECUTOR_DAILY_LOGIN: 2,
  EXECUTOR_UPDATE_PROFILE: 5,
  UPLOAD_PHOTO: 3,
  COMPLETE_FAST: 5,
  
  // Рефералы исполнителей
  REFERRAL_EXECUTOR_REGISTRATION: 200,
  REFERRAL_EXECUTOR_SUBSCRIPTION: 300,
  REFERRAL_EXECUTOR_5_ORDERS: 100,
  
  // Достижения
  ACHIEVEMENT_COMMON: 0,
  ACHIEVEMENT_RARE: 25,
  ACHIEVEMENT_EPIC: 50,
  ACHIEVEMENT_LEGENDARY: 100
}

// Цвета для редкости достижений
export const RARITY_COLORS = {
  common: '#6B7280',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B'
}

// Иконки для редкости
export const RARITY_ICONS = {
  common: '⚪',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟠'
}
