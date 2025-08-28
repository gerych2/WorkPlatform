import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Валидация email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Валидация телефона (российский формат)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Валидация пароля
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

// Форматирование телефона
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    return '+7' + cleaned.slice(1)
  }
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return '+' + cleaned
  }
  if (cleaned.length === 10) {
    return '+7' + cleaned
  }
  return phone
}