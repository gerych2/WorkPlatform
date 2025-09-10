import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  status: string
  location?: string
  isVerified: boolean
  createdAt: Date
}

export interface Category {
  id: number
  name: string
  description?: string
  icon?: string
  isActive: boolean
  executorCount: number
  orderCount: number
}

export interface ExecutorProfile {
  id: number
  userId: number
  description?: string
  experience?: string
  hourlyRate?: number
  categories: number[]
  workingHours?: any
  responseTime?: string
  completedOrders: number
  rating: number
  reviewsCount: number
}

export interface Order {
  id: number
  clientId: number
  executorId: number
  categoryId: number
  serviceDescription: string
  address: string
  phone: string
  clientName: string
  notes?: string
  orderDate: Date
  orderTime: Date
  totalPrice: number
  status: string
  createdAt: Date
}

export interface Subscription {
  id: number
  userId: number
  planType: string
  startDate: Date
  endDate: Date
  status: string
  amount: number
  paymentMethod?: string
}

export interface Review {
  id: number
  orderId: number
  clientId: number
  executorId: number
  rating: number
  comment?: string
  createdAt: Date
}

export interface Notification {
  id: number
  userId: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
}

export interface Complaint {
  id: number
  complainantId: number
  accusedId: number
  orderId?: number
  reason: string
  description?: string
  status: string
  adminNotes?: string
  resolvedBy?: number
  resolvedAt?: Date
  createdAt: Date
}

export interface ExecutorDocument {
  id: number
  userId: number
  documentType: string
  filePath?: string
  fileName?: string
  verificationStatus: string
  verifiedBy?: number
  verifiedAt?: Date
  notes?: string
  createdAt: Date
}

// Аутентификация пользователей
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user && user.passwordHash === password) { // Временно для тестирования
      return user as any as any
    }
    return null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Регистрация пользователя
export async function registerUser(userData: {
  name: string
  email: string
  phone?: string
  password: string
  role: string
  location?: string
}): Promise<User | null> {
  try {
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        passwordHash: userData.password, // Временно без хеширования
        role: userData.role as any,
        status: userData.role === 'admin' ? 'active' : 'pending',
        location: userData.location,
        isVerified: userData.role === 'admin',
      }
    })

    return user as any
  } catch (error) {
    console.error('Registration error:', error)
    return null
  }
}

// Получение всех категорий
export async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({
      where: { isActive: true }
    }) as any
  } catch (error) {
    console.error('Get categories error:', error)
    return []
  }
}

// Получение исполнителей по категории
export async function getExecutorsByCategory(categoryId: number): Promise<any[]> {
  try {
    const profiles = await prisma.executorProfile.findMany({
      where: {
        categories: { has: categoryId }
      },
      include: {
        user: true
      }
    })

    return profiles as any
  } catch (error) {
    console.error('Get executors error:', error)
    return []
  }
}

// Создание заказа
export async function createOrder(orderData: {
  clientId: number
  executorId: number
  categoryId: number
  serviceDescription: string
  address: string
  phone: string
  clientName: string
  notes?: string
  orderDate: Date
  orderTime: Date
  totalPrice: number
}): Promise<Order | null> {
  try {
    const order = await prisma.order.create({
      data: {
        ...orderData,
        orderTime: orderData.orderTime.toTimeString().slice(0, 5)
      }
    })

    return order as any
  } catch (error) {
    console.error('Create order error:', error)
    return null
  }
}

// Получение заказов пользователя
export async function getUserOrders(userId: number, role: string): Promise<Order[]> {
  try {
    if (role === 'client') {
      return await prisma.order.findMany({
        where: { clientId: userId },
        include: {
          category: true,
          executor: true
        },
        orderBy: { createdAt: 'desc' }
      }) as any
    } else if (role === 'executor') {
      return await prisma.order.findMany({
        where: { executorId: userId },
        include: {
          category: true,
          client: true
        },
        orderBy: { createdAt: 'desc' }
      }) as any
    }
    return []
  } catch (error) {
    console.error('Get user orders error:', error)
    return []
  }
}

// Обновление статуса заказа
export async function updateOrderStatus(orderId: number, status: string): Promise<boolean> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any }
    })
    return true
  } catch (error) {
    console.error('Update order status error:', error)
    return false
  }
}

// Получение профиля исполнителя
export async function getExecutorProfile(userId: number): Promise<ExecutorProfile | null> {
  try {
    return await prisma.executorProfile.findUnique({
      where: { userId }
    }) as any
  } catch (error) {
    console.error('Get executor profile error:', error)
    return null
  }
}

// Создание профиля исполнителя
export async function createExecutorProfile(profileData: {
  userId: number
  description?: string
  experience?: string
  hourlyRate?: number
  categories: number[]
  workingHours?: any
  responseTime?: string
}): Promise<ExecutorProfile | null> {
  try {
    const profile = await prisma.executorProfile.create({
      data: profileData
    })

    return profile as any
  } catch (error) {
    console.error('Create executor profile error:', error)
    return null
  }
}

// Получение подписки пользователя
export async function getUserSubscription(userId: number): Promise<Subscription | null> {
  try {
    return await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gte: new Date() }
      },
      orderBy: { endDate: 'desc' }
    }) as any
  } catch (error) {
    console.error('Get user subscription error:', error)
    return null
  }
}

// Создание подписки
export async function createSubscription(subscriptionData: {
  userId: number
  planType: string
  startDate: Date
  endDate: Date
  amount: number
  paymentMethod?: string
}): Promise<Subscription | null> {
  try {
    const subscription = await prisma.subscription.create({
      data: {
        ...subscriptionData,
        planType: subscriptionData.planType as any
      }
    })

    return subscription as any
  } catch (error) {
    console.error('Create subscription error:', error)
    return null
  }
}

// Получение уведомлений пользователя
export async function getUserNotifications(userId: number): Promise<Notification[]> {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Get user notifications error:', error)
    return []
  }
}

// Создание уведомления
export async function createNotification(notificationData: {
  userId: number
  title: string
  message: string
  type: string
}): Promise<Notification | null> {
  try {
    const notification = await prisma.notification.create({
      data: notificationData
    })

    return notification
  } catch (error) {
    console.error('Create notification error:', error)
    return null
  }
}

// Получение всех пользователей (для админки)
export async function getAllUsers(): Promise<User[]> {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    }) as any
  } catch (error) {
    console.error('Get all users error:', error)
    return []
  }
}

// Обновление статуса пользователя
export async function updateUserStatus(userId: number, status: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: status as any }
    })
    return true
  } catch (error) {
    console.error('Update user status error:', error)
    return false
  }
}

// Получение всех документов исполнителей
export async function getAllExecutorDocuments(): Promise<ExecutorDocument[]> {
  try {
    return await prisma.executorDocument.findMany({
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    }) as any
  } catch (error) {
    console.error('Get all executor documents error:', error)
    return []
  }
}

// Обновление статуса проверки документа
export async function updateDocumentVerificationStatus(
  documentId: number,
  status: string,
  verifiedBy: number,
  notes?: string
): Promise<boolean> {
  try {
    await prisma.executorDocument.update({
      where: { id: documentId },
      data: {
        verificationStatus: status as any,
        verifiedBy,
        verifiedAt: new Date(),
        notes
      }
    })
    return true
  } catch (error) {
    console.error('Update document verification status error:', error)
    return false
  }
}

// Получение статистики
export async function getPlatformStats(): Promise<{
  totalUsers: number
  totalExecutors: number
  totalClients: number
  totalOrders: number
  totalCategories: number
}> {
  try {
    const [totalUsers, totalExecutors, totalClients, totalOrders, totalCategories] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'executor' } }),
      prisma.user.count({ where: { role: 'client' } }),
      prisma.order.count(),
      prisma.category.count()
    ])

    return {
      totalUsers,
      totalExecutors,
      totalClients,
      totalOrders,
      totalCategories
    }
  } catch (error) {
    console.error('Get platform stats error:', error)
    return {
      totalUsers: 0,
      totalExecutors: 0,
      totalClients: 0,
      totalOrders: 0,
      totalCategories: 0
    }
  }
}

export default prisma

