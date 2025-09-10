import React from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

interface NotificationProps {
  type: 'success' | 'error' | 'info'
  message: string
  onClose: () => void
  duration?: number
}

export const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  onClose, 
  duration = 5000 
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-secondary-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'info':
        return <AlertCircle className="h-5 w-5 text-primary-600" />
      default:
        return null
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-secondary-100 border-secondary-400 text-secondary-700'
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700'
      case 'info':
        return 'bg-primary-100 border-primary-400 text-primary-700'
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-notification p-4 rounded-lg shadow-lg border max-w-md ${getStyles()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}




