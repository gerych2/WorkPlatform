'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminAuth = localStorage.getItem('adminAuth')
        
        if (!adminAuth) {
          router.push('/admin/login')
          return
        }

        const admin = JSON.parse(adminAuth)
        
        // Проверяем, что токен не старше 24 часов
        const tokenAge = Date.now() - admin.timestamp
        const maxAge = 24 * 60 * 60 * 1000 // 24 часа

        if (tokenAge > maxAge) {
          localStorage.removeItem('adminAuth')
          router.push('/admin/login')
          return
        }

        if (admin.role !== 'admin') {
          localStorage.removeItem('adminAuth')
          router.push('/admin/login')
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('adminAuth')
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}


