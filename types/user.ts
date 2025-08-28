// Типы пользователей
export type UserRole = 'client' | 'executor' | 'admin'

export type ExecutorStatus = 'ip' | 'legal' | 'self_employed' // ИП, Юр.лицо, Самозанятый

export type DocumentVerificationStatus = 'pending' | 'approved' | 'rejected'

// Базовый пользователь
export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Клиент
export interface Client extends User {
  role: 'client'
}

// Исполнитель
export interface Executor extends User {
  role: 'executor'
  status: ExecutorStatus
  companyName?: string // Для ИП и юр.лиц
  inn?: string
  registrationNumber?: string
  documents: ExecutorDocument[]
  verificationStatus: DocumentVerificationStatus
  categories: string[]
  description?: string
  hourlyRate?: number
  isActive: boolean
  subscriptionEndsAt?: Date
}

// Документы исполнителя
export interface ExecutorDocument {
  id: string
  type: 'registration' | 'inn' | 'self_employed_certificate'
  fileName: string
  filePath: string
  uploadedAt: Date
}

// Формы регистрации
export interface ClientRegistrationForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
}

export interface ExecutorRegistrationForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  status: ExecutorStatus
  companyName?: string
  inn?: string
  registrationNumber?: string
  categories: string[]
  description?: string
}

// Форма входа
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}