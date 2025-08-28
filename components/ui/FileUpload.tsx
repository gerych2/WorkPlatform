import React from 'react'
import { cn } from '../../lib/utils'

interface FileUploadProps {
  label?: string
  multiple?: boolean
  accept?: string
  value?: File[]
  onChange?: (files: File[]) => void
  error?: string
  helpText?: string
  required?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  multiple = false,
  accept,
  value = [],
  onChange,
  error,
  helpText,
  required = false
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onChange) {
      const files = Array.from(e.target.files)
      onChange(multiple ? files : [files[0]])
    }
  }

  const removeFile = (index: number) => {
    if (onChange) {
      const newFiles = value.filter((_, i) => i !== index)
      onChange(newFiles)
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-3">
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          className={cn(
            'input-field',
            error && 'border-red-500 focus:ring-red-500'
          )}
        />
        
        {value.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Выбранные файлы:</p>
            <div className="space-y-2">
              {value.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
} 