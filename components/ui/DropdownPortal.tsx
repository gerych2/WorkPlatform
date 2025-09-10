'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface DropdownPortalProps {
  children: React.ReactNode
  className?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export const DropdownPortal: React.FC<DropdownPortalProps> = ({ 
  children, 
  className = '',
  position = 'top-right'
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed right-4 top-20'
      case 'top-left':
        return 'fixed left-4 top-20'
      case 'bottom-right':
        return 'fixed right-4 bottom-4'
      case 'bottom-left':
        return 'fixed left-4 bottom-4'
      default:
        return 'fixed right-4 top-20'
    }
  }

  return createPortal(
    <div className={`z-maximum ${getPositionClasses()} ${className}`}>
      {children}
    </div>,
    document.body
  )
}
