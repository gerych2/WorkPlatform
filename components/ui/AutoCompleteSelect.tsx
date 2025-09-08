'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

interface Option {
  id: number
  name: string
  description: string
  icon?: string
}

interface AutoCompleteSelectProps<T extends Option> {
  options: T[]
  value: T | null
  onChange: (option: T | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  searchPlaceholder?: string
}

export function AutoCompleteSelect<T extends Option>({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  className = "",
  disabled = false,
  searchPlaceholder = "Начните вводить..."
}: AutoCompleteSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Фильтрация опций по поисковому запросу
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
    setHighlightedIndex(-1)
  }, [searchTerm, options])

  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (option: T) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSearchTerm('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Основной инпут */}
      <div
        className={`
          relative flex items-center w-full px-4 py-3 border-2 rounded-xl
          transition-all duration-200 cursor-pointer
          ${isOpen 
            ? 'border-primary-500 ring-2 ring-primary-200' 
            : 'border-secondary-300 hover:border-secondary-400'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Иконка поиска */}
        <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
        
        {/* Выбранное значение или плейсхолдер */}
        {value ? (
          <div className="flex items-center flex-1 min-w-0">
            {value.icon && (
              <span className="text-lg mr-2 flex-shrink-0">{value.icon}</span>
            )}
            <span className="text-gray-900 truncate">{value.name}</span>
          </div>
        ) : (
          <span className="text-gray-500 flex-1">{placeholder}</span>
        )}
        
        {/* Кнопки действий */}
        <div className="flex items-center space-x-2">
          {value && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {/* Поле поиска */}
          <div className="p-3 border-b border-secondary-100">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              autoComplete="off"
            />
          </div>
          
          {/* Список опций */}
          <div className="py-1" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.id}
                  className={`
                    flex items-center px-4 py-3 cursor-pointer transition-colors
                    ${index === highlightedIndex 
                      ? 'bg-primary-50 text-primary-900' 
                      : 'hover:bg-secondary-50'
                    }
                  `}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  {option.icon && (
                    <span className="text-lg mr-3 flex-shrink-0">{option.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {option.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {option.description}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                {searchTerm ? 'Ничего не найдено' : 'Нет доступных опций'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
