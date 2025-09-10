'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Send, Users, MessageSquare } from 'lucide-react'

interface EmailFormData {
  to: string
  subject: string
  content: string
  type: 'single' | 'newsletter'
}

export default function EmailAdminPage() {
  const [formData, setFormData] = useState<EmailFormData>({
    to: '',
    subject: '',
    content: '',
    type: 'single'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      if (formData.type === 'single') {
        // Отправка одиночного письма
        const response = await fetch('/api/admin/email/send-single', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: formData.to,
            subject: formData.subject,
            content: formData.content
          })
        })

        const data = await response.json()
        
        if (data.success) {
          setResult({ success: true, message: 'Письмо успешно отправлено!' })
          setFormData({ to: '', subject: '', content: '', type: 'single' })
        } else {
          setResult({ success: false, message: data.error || 'Ошибка отправки письма' })
        }
      } else {
        // Отправка рассылки
        const response = await fetch('/api/admin/email/send-newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: formData.subject,
            content: formData.content,
            textContent: formData.content.replace(/<[^>]*>/g, '') // Убираем HTML теги для текстовой версии
          })
        })

        const data = await response.json()
        
        if (data.success) {
          setResult({ 
            success: true, 
            message: `Рассылка отправлена! Успешно: ${data.successCount}, ошибок: ${data.failedCount}` 
          })
          setFormData({ to: '', subject: '', content: '', type: 'newsletter' })
        } else {
          setResult({ success: false, message: data.error || 'Ошибка отправки рассылки' })
        }
      }
    } catch (error) {
      setResult({ success: false, message: 'Ошибка сети' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Управление Email</h1>
            </div>
            <p className="mt-2 text-gray-600">
              Отправка одиночных писем и рассылок пользователям
            </p>
          </div>

          <div className="p-6">
            {/* Переключатель типа отправки */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'single' })}
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    formData.type === 'single'
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Одиночное письмо
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'newsletter' })}
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    formData.type === 'newsletter'
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Рассылка всем
                </button>
              </div>
            </div>

            {/* Форма отправки */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {formData.type === 'single' && (
                <div>
                  <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                    Email получателя
                  </label>
                  <Input
                    id="to"
                    type="email"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Тема письма
                </label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Введите тему письма"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Содержание письма (HTML)
                </label>
                <textarea
                  id="content"
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<h1>Привет!</h1><p>Это тестовое письмо.</p>"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Поддерживается HTML разметка
                </p>
              </div>

              {/* Результат */}
              {result && (
                <div className={`p-4 rounded-lg ${
                  result.success 
                    ? 'bg-secondary-50 border border-secondary-200 text-secondary-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {result.message}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {formData.type === 'single' ? 'Отправить письмо' : 'Отправить рассылку'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
