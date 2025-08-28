'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Loader2 } from 'lucide-react'

interface AdminAuth {
  email: string
  name: string
  role: string
  timestamp: number
}

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminData, setAdminData] = useState<AdminAuth | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    
    if (!auth) {
      router.push('/admin/login')
      return
    }

    try {
      const authData: AdminAuth = JSON.parse(auth)
      
      // Проверяем, не истек ли токен (24 часа)
      if (Date.now() - authData.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('adminAuth')
        router.push('/admin/login')
        return
      }

      // Проверяем роль
      if (authData.role !== 'admin') {
        localStorage.removeItem('adminAuth')
        router.push('/admin/login')
        return
      }

      setAdminData(authData)
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem('adminAuth')
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div>
      {/* Верхняя панель с информацией об администраторе */}
      <div className="bg-red-600 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Панель администратора</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {adminData?.name} ({adminData?.email})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-700 hover:bg-red-800 px-3 py-1 rounded transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
      
      {children}
    </div>
  )
} 