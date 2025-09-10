import { Buffer } from 'buffer'

// Безопасное декодирование из base64 для UTF-8 строк на сервере
export function safeBase64Decode(str: string): string {
  try {
    // Сначала декодируем из base64, затем из UTF-8
    return Buffer.from(str, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Error decoding from base64:', error)
    // Fallback: используем простой Buffer для ASCII строк
    return Buffer.from(str, 'base64').toString('ascii')
  }
}

// Извлечение данных пользователя из токена авторизации
export function getUserDataFromToken(authHeader: string | null) {
  if (!authHeader) {
    return null
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const userDataString = safeBase64Decode(token)
    return JSON.parse(userDataString)
  } catch (error) {
    console.error('Error parsing user data from token:', error)
    return null
  }
}







