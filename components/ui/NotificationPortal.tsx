'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface NotificationPortalProps {
  children: React.ReactNode
  className?: string
}

export const NotificationPortal: React.FC<NotificationPortalProps> = ({ 
  children, 
  className = '' 
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return createPortal(
    <div className={`notification-dropdown ${className}`}>
      {children}
    </div>,
    document.body
  )
}
