'use client'

import React, { useState, useRef, useEffect } from 'react'

interface FloatingInputProps {
  id: string
  type?: string
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  error?: string
  className?: string
  rows?: number
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  type = 'text',
  label,
  value,
  onChange,
  required = false,
  placeholder,
  error,
  className = '',
  rows
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setHasValue(value.length > 0)
  }, [value])

  const isFloating = isFocused || hasValue

  const inputClasses = `
    peer w-full px-4 pt-6 pb-2 bg-transparent border-2 rounded-xl
    transition-all duration-200 ease-in-out
    ${error 
      ? 'border-red-300 focus:border-red-500' 
      : 'border-gray-300 focus:border-primary-500'
    }
    focus:outline-none focus:ring-4 focus:ring-primary-100
    ${className}
  `.trim()

  const labelClasses = `
    absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
    ${isFloating 
      ? 'top-2 text-xs font-medium' 
      : 'top-4 text-base'
    }
    ${error 
      ? 'text-red-500' 
      : isFloating 
        ? 'text-primary-600' 
        : 'text-gray-500'
    }
  `.trim()

  const InputComponent = rows ? 'textarea' : 'input'

  return (
    <div className="relative">
      <div className="relative">
        <InputComponent
          ref={inputRef as any}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          placeholder={isFloating ? placeholder : ''}
          rows={rows}
          className={inputClasses}
        />
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-red-500 text-sm">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}
