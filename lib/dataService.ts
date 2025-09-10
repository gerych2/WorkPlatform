// Сервис для управления данными платформы
// Сейчас использует localStorage, позже будет заменен на API

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'client' | 'executor' | 'admin'
  status: 'active' | 'blocked' | 'pending'
  registrationDate: string
  lastLogin: string
  location: string
  isVerified: boolean
  documents?: Document[]
  profile?: {
    description?: string
    experience?: string
    hourlyRate?: number
    categories?: string[]
    workingHours?: {
      [key: string]: { start: string; end: string; isWorking: boolean }
    }
  }
}

export interface Order {
  id: string
  clientId: string
  executorId: string
  clientName: string
  executorName: string
  service: string
  category: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  date: string
  time: string
  price: number
  address: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  isActive: boolean
  executorCount: number
  orderCount: number
  createdAt: string
}

export interface Document {
  id: string
  executorId: string
  executorName: string
  documentType: string
  fileName: string
  fileUrl?: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  adminId?: string
  reviewedAt?: string
}

export interface Subscription {
  id: string
  executorId: string
  plan: '1_day' | '7_days' | '30_days'
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  price: number
  paymentMethod?: string
  createdAt: string
}

export interface Review {
  id: string
  orderId: string
  clientId: string
  executorId: string
  clientName: string
  executorName: string
  rating: number
  comment: string
  createdAt: string
}

export interface TimeSlot {
  id: string
  executorId: string
  date: string
  time: string
  isAvailable: boolean
  orderId?: string
  createdAt: string
}

// Ключи для localStorage
const STORAGE_KEYS = {
  USERS: 'platform_users',
  ORDERS: 'platform_orders',
  CATEGORIES: 'platform_categories',
  DOCUMENTS: 'platform_documents',
  SUBSCRIPTIONS: 'platform_subscriptions',
  REVIEWS: 'platform_reviews',
  TIME_SLOTS: 'platform_time_slots',
  CURRENT_USER: 'current_user',
  ADMIN_AUTH: 'adminAuth'
}

// Генерация уникального ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Получение текущей даты в формате DD.MM.YYYY
const getCurrentDate = (): string => {
  const now = new Date()
  return now.toLocaleDateString('ru-RU')
}

// Получение текущего времени
const getCurrentTime = (): string => {
  const now = new Date()
  return now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

// Инициализация данных по умолчанию
const initializeDefaultData = () => {
  console.log('initializeDefaultData: начало инициализации')
  
  // Категории по умолчанию
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    console.log('Создание категорий по умолчанию')
    const defaultCategories: Category[] = [
      {
        id: 'cat_1',
        name: 'Электрика',
        description: 'Электромонтажные работы',
        icon: '⚡',
        isActive: true,
        executorCount: 0,
        orderCount: 0,
        createdAt: getCurrentDate()
      },
      {
        id: 'cat_2',
        name: 'Сантехника',
        description: 'Установка и ремонт сантехники',
        icon: '🔧',
        isActive: true,
        executorCount: 0,
        orderCount: 0,
        createdAt: getCurrentDate()
      },
      {
        id: 'cat_3',
        name: 'Косметология',
        description: 'Услуги косметолога',
        icon: '💄',
        isActive: true,
        executorCount: 0,
        orderCount: 0,
        createdAt: getCurrentDate()
      },
      {
        id: 'cat_4',
        name: 'Уборка',
        description: 'Клининговые услуги',
        icon: '🧹',
        isActive: true,
        executorCount: 0,
        orderCount: 0,
        createdAt: getCurrentDate()
      },
      {
        id: 'cat_5',
        name: 'Ремонт техники',
        description: 'Ремонт бытовой техники',
        icon: '🛠️',
        isActive: true,
        executorCount: 0,
        orderCount: 0,
        createdAt: getCurrentDate()
      }
    ]
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories))
  }

  // Пользователи по умолчанию
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    console.log('Создание пользователей по умолчанию')
    const defaultUsers: User[] = [
      {
        id: 'admin_1',
        name: 'Главный администратор',
        email: 'admin@serviceplatform.by',
        phone: '+375 (29) 000-00-00',
        role: 'admin',
        status: 'active',
        registrationDate: getCurrentDate(),
        lastLogin: getCurrentDate(),
        location: 'Минск',
        isVerified: true
      },
      {
        id: 'admin_2',
        name: 'Менеджер платформы',
        email: 'manager@serviceplatform.by',
        phone: '+375 (29) 000-00-01',
        role: 'admin',
        status: 'active',
        registrationDate: getCurrentDate(),
        lastLogin: getCurrentDate(),
        location: 'Минск',
        isVerified: true
      },
      {
        id: 'client_1',
        name: 'Иван Петров',
        email: 'client@example.com',
        phone: '+375 (29) 123-45-67',
        role: 'client',
        status: 'active',
        registrationDate: getCurrentDate(),
        lastLogin: getCurrentDate(),
        location: 'Минск',
        isVerified: true
      },
      {
        id: 'executor_1',
        name: 'Алексей Мастеров',
        email: 'executor@example.com',
        phone: '+375 (29) 987-65-43',
        role: 'executor',
        status: 'active',
        registrationDate: getCurrentDate(),
        lastLogin: getCurrentDate(),
        location: 'Минск',
        isVerified: true,
        profile: {
          description: 'Опытный электрик с 10-летним стажем',
          experience: '10 лет',
          hourlyRate: 25,
          categories: ['cat_1'], // ID категории "Электрика"
          workingHours: {
            'monday': { start: '09:00', end: '18:00', isWorking: true },
            'tuesday': { start: '09:00', end: '18:00', isWorking: true },
            'wednesday': { start: '09:00', end: '18:00', isWorking: true },
            'thursday': { start: '09:00', end: '18:00', isWorking: true },
            'friday': { start: '09:00', end: '18:00', isWorking: true },
            'saturday': { start: '10:00', end: '16:00', isWorking: true },
            'sunday': { start: '10:00', end: '16:00', isWorking: false }
          }
        }
      }
    ]
    const defaultCategories = [
      { id: 1, name: 'Дизайн', description: 'Графический дизайн, веб-дизайн', icon: '🎨', isActive: true, executorCount: 0, orderCount: 0, createdAt: new Date() },
      { id: 2, name: 'Разработка', description: 'Веб-разработка, мобильные приложения', icon: '💻', isActive: true, executorCount: 0, orderCount: 0, createdAt: new Date() },
      { id: 3, name: 'Маркетинг', description: 'SMM, контекстная реклама', icon: '📈', isActive: true, executorCount: 0, orderCount: 0, createdAt: new Date() }
    ]
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories))
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers))
    console.log('Данные по умолчанию сохранены в localStorage')
  }
}

// Инициализация при загрузке
if (typeof window !== 'undefined') {
  console.log('Инициализация dataService...')
  
  // Принудительно очищаем старые данные для тестирования
  // localStorage.clear()
  
  initializeDefaultData()
  console.log('dataService инициализирован')
  
  // Проверяем, что данные созданы
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
  const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]')
  console.log('Создано пользователей:', users.length)
  console.log('Создано категорий:', categories.length)
  console.log('Пользователи:', users.map((u: any) => ({ email: u.email, role: u.role })))
  
  // Если данных нет, создаем их принудительно
  if (users.length === 0) {
    console.log('Данных нет, создаем принудительно...')
    initializeDefaultData()
  }
}

// Сервис пользователей
export const userService = {
  // Регистрация нового пользователя
  register: (userData: Omit<User, 'id' | 'registrationDate' | 'lastLogin' | 'status' | 'isVerified'>): User => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const newUser: User = {
      ...userData,
      id: generateId(),
      registrationDate: getCurrentDate(),
      lastLogin: getCurrentDate(),
      status: userData.role === 'executor' ? 'pending' : 'active',
      isVerified: userData.role === 'client'
    }
    
    users.push(newUser)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    
    // Обновляем счетчики категорий
    if (userData.role === 'executor' && userData.profile?.categories) {
      userData.profile.categories.forEach(categoryId => {
        categoryService.incrementExecutorCount(categoryId)
      })
    }
    
    return newUser
  },

  // Авторизация пользователя
  login: (email: string, password: string): User | null => {
    console.log('userService.login вызван с email:', email)
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    console.log('Всего пользователей в системе:', users.length)
    console.log('Поиск пользователя с email:', email)
    
    const user = users.find((u: User) => u.email === email)
    console.log('Найденный пользователь:', user)
    
    if (user) {
      // В реальном проекте здесь будет проверка пароля
      user.lastLogin = getCurrentDate()
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      console.log('Пользователь обновлен, возвращаем:', user)
      return user
    }
    
    console.log('Пользователь не найден')
    return null
  },

  // Получение пользователя по ID
  getById: (id: string): User | null => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    return users.find((u: User) => u.id === id) || null
  },

  // Получение всех пользователей
  getAll: (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
  },

  // Обновление пользователя
  update: (id: string, updates: Partial<User>): User | null => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const userIndex = users.findIndex((u: User) => u.id === id)
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates, updatedAt: getCurrentDate() }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      return users[userIndex]
    }
    
    return null
  },

  // Блокировка/разблокировка пользователя
  toggleStatus: (id: string, status: 'active' | 'blocked'): User | null => {
    return userService.update(id, { status })
  },

  // Верификация исполнителя
  verifyExecutor: (id: string): User | null => {
    return userService.update(id, { isVerified: true, status: 'active' })
  }
}

// Сервис заказов
export const orderService = {
  // Создание нового заказа
  create: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]')
    const newOrder: Order = {
      ...orderData,
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    }
    
    orders.push(newOrder)
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
    
    // Обновляем счетчики категорий
    categoryService.incrementOrderCount(orderData.category)
    
    return newOrder
  },

  // Получение заказов пользователя
  getByUserId: (userId: string, role: 'client' | 'executor'): Order[] => {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]')
    if (role === 'client') {
      return orders.filter((o: Order) => o.clientId === userId)
    } else {
      return orders.filter((o: Order) => o.executorId === userId)
    }
  },

  // Получение всех заказов
  getAll: (): Order[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]')
  },

  // Обновление статуса заказа
  updateStatus: (id: string, status: Order['status']): Order | null => {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]')
    const orderIndex = orders.findIndex((o: Order) => o.id === id)
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status
      orders[orderIndex].updatedAt = getCurrentDate()
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
      return orders[orderIndex]
    }
    
    return null
  },

  // Удаление заказа
  delete: (id: string): boolean => {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]')
    const filteredOrders = orders.filter((o: Order) => o.id !== id)
    
    if (filteredOrders.length !== orders.length) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredOrders))
      return true
    }
    
    return false
  }
}

// Сервис категорий
export const categoryService = {
  // Получение всех категорий
  getAll: (): Category[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]')
  },

  // Создание новой категории
  create: (categoryData: Omit<Category, 'id' | 'createdAt' | 'executorCount' | 'orderCount'>): Category => {
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]')
    const newCategory: Category = {
      ...categoryData,
      id: generateId(),
      createdAt: getCurrentDate(),
      executorCount: 0,
      orderCount: 0
    }
    
    categories.push(newCategory)
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    
    return newCategory
  },

  // Обновление категории
  update: (id: string, updates: Partial<Category>): Category | null => {
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]')
    const categoryIndex = categories.findIndex((c: Category) => c.id === id)
    
    if (categoryIndex !== -1) {
      categories[categoryIndex] = { ...categories[categoryIndex], ...updates }
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
      return categories[categoryIndex]
    }
    
    return null
  },

  // Увеличение счетчика исполнителей
  incrementExecutorCount: (categoryId: string): void => {
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]')
    const category = categories.find((c: Category) => c.id === categoryId)
    
    if (category) {
      category.executorCount++
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    }
  },

  // Увеличение счетчика заказов
  incrementOrderCount: (categoryId: string): void => {
    const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]')
    const category = categories.find((c: Category) => c.id === categoryId)
    
    if (category) {
      category.orderCount++
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    }
  }
}

// Сервис документов
export const documentService = {
  // Загрузка документа
  upload: (documentData: Omit<Document, 'id' | 'uploadDate' | 'status'>): Document => {
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]')
    const newDocument: Document = {
      ...documentData,
      id: generateId(),
      uploadDate: getCurrentDate(),
      status: 'pending'
    }
    
    documents.push(newDocument)
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
    
    return newDocument
  },

  // Получение документов исполнителя
  getByExecutorId: (executorId: string): Document[] => {
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]')
    return documents.filter((d: Document) => d.executorId === executorId)
  },

  // Получение всех документов
  getAll: (): Document[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]')
  },

  // Обновление статуса документа
  updateStatus: (id: string, status: Document['status'], adminId: string, notes?: string): Document | null => {
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]')
    const documentIndex = documents.findIndex((d: Document) => d.id === id)
    
    if (documentIndex !== -1) {
      documents[documentIndex].status = status
      documents[documentIndex].adminId = adminId
      documents[documentIndex].reviewedAt = getCurrentDate()
      if (notes) documents[documentIndex].notes = notes
      
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
      
      // Если документ одобрен, верифицируем исполнителя
      if (status === 'approved') {
        const document = documents[documentIndex]
        userService.verifyExecutor(document.executorId)
      }
      
      return documents[documentIndex]
    }
    
    return null
  }
}

// Сервис подписок
export const subscriptionService = {
  // Создание подписки
  create: (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>): Subscription => {
    const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS) || '[]')
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: generateId(),
      createdAt: getCurrentDate()
    }
    
    subscriptions.push(newSubscription)
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions))
    
    return newSubscription
  },

  // Получение активной подписки исполнителя
  getActiveByExecutorId: (executorId: string): Subscription | null => {
    const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS) || '[]')
    const now = new Date()
    
    return subscriptions.find((s: Subscription) => 
      s.executorId === executorId && 
      s.status === 'active' && 
      new Date(s.endDate) > now
    ) || null
  },

  // Проверка активности подписки
  isActive: (executorId: string): boolean => {
    return subscriptionService.getActiveByExecutorId(executorId) !== null
  }
}

// Сервис временных слотов
export const timeSlotService = {
  // Создание временного слота
  create: (slotData: Omit<TimeSlot, 'id' | 'createdAt'>): TimeSlot => {
    const slots = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_SLOTS) || '[]')
    const newSlot: TimeSlot = {
      ...slotData,
      id: generateId(),
      createdAt: getCurrentDate()
    }
    
    slots.push(newSlot)
    localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(slots))
    
    return newSlot
  },

  // Получение слотов исполнителя на определенную дату
  getByExecutorAndDate: (executorId: string, date: string): TimeSlot[] => {
    const slots = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_SLOTS) || '[]')
    return slots.filter((s: TimeSlot) => 
      s.executorId === executorId && s.date === date
    )
  },

  // Обновление слота
  update: (id: string, updates: Partial<TimeSlot>): TimeSlot | null => {
    const slots = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_SLOTS) || '[]')
    const slotIndex = slots.findIndex((s: TimeSlot) => s.id === id)
    
    if (slotIndex !== -1) {
      slots[slotIndex] = { ...slots[slotIndex], ...updates }
      localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(slots))
      return slots[slotIndex]
    }
    
    return null
  },

  // Удаление слота
  delete: (id: string): boolean => {
    const slots = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_SLOTS) || '[]')
    const filteredSlots = slots.filter((s: TimeSlot) => s.id !== id)
    
    if (filteredSlots.length !== slots.length) {
      localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(filteredSlots))
      return true
    }
    
    return false
  }
}

// Сервис отзывов
export const reviewService = {
  // Создание отзыва
  create: (reviewData: Omit<Review, 'id' | 'createdAt'>): Review => {
    const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]')
    const newReview: Review = {
      ...reviewData,
      id: generateId(),
      createdAt: getCurrentDate()
    }
    
    reviews.push(newReview)
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
    
    return newReview
  },

  // Получение отзывов исполнителя
  getByExecutorId: (executorId: string): Review[] => {
    const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]')
    return reviews.filter((r: Review) => r.executorId === executorId)
  },

  // Получение всех отзывов
  getAll: (): Review[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]')
  }
}

// Сервис аутентификации
export const authService = {
  // Сохранение текущего пользователя
  setCurrentUser: (user: User): void => {
    console.log('authService.setCurrentUser вызван с пользователем:', user)
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    console.log('Пользователь сохранен в localStorage')
  },

  // Получение текущего пользователя
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    console.log('authService.getCurrentUser, данные из localStorage:', userData)
    const user = userData ? JSON.parse(userData) : null
    console.log('Возвращаемый пользователь:', user)
    return user
  },

  // Выход пользователя
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },

  // Проверка аутентификации
  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null
  }
}

// Сервис администратора
export const adminService = {
  // Проверка прав администратора
  isAdmin: (): boolean => {
    const currentUser = authService.getCurrentUser()
    return currentUser?.role === 'admin' && currentUser?.status === 'active'
  },

  // Получение статистики
  getStats: () => {
    const users = userService.getAll()
    const orders = orderService.getAll()
    const documents = documentService.getAll()
    const categories = categoryService.getAll()
    
    return {
      totalUsers: users.length,
      totalExecutors: users.filter(u => u.role === 'executor').length,
      totalClients: users.filter(u => u.role === 'client').length,
      totalOrders: orders.length,
      pendingVerifications: documents.filter(d => d.status === 'pending').length,
      activeCategories: categories.filter(c => c.isActive).length,
      totalRevenue: orders.reduce((sum, order) => sum + order.price, 0)
    }
  }
}

// Экспорт всех сервисов
export default {
  userService,
  orderService,
  categoryService,
  documentService,
  subscriptionService,
  timeSlotService,
  reviewService,
  authService,
  adminService
} 