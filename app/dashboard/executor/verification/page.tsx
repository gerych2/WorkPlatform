'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  FileText,
  User,
  Building,
  DollarSign,
  Loader2,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react'

interface VerificationStatus {
  isVerified: boolean
  status: string
  results?: any
  verifiedAt?: string
  message: string
}

interface DocumentData {
  passport: {
    passportSeries: string
    passportNumber: string
    firstName: string
    lastName: string
    middleName: string
    birthDate: string
  }
  egr: {
    regNum: string
    name: string
    type: 'individual' | 'legal'
  }
  income_certificate: {
    certificateNumber: string
    issueDate: string
    organizationName: string
    taxpayerNumber: string
    fullName: string
    period: {
      startDate: string
      endDate: string
    }
    incomeAmount: number
  }
}

export default function ExecutorVerification() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  
  // Данные документов
  const [documentData, setDocumentData] = useState<DocumentData>({
    passport: {
      passportSeries: '',
      passportNumber: '',
      firstName: '',
      lastName: '',
      middleName: '',
      birthDate: ''
    },
    egr: {
      regNum: '',
      name: '',
      type: 'individual'
    },
    income_certificate: {
      certificateNumber: '',
      issueDate: '',
      organizationName: '',
      taxpayerNumber: '',
      fullName: '',
      period: {
        startDate: '',
        endDate: ''
      },
      incomeAmount: 0
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'passport' | 'egr' | 'income'>('passport')

  useEffect(() => {
    // Проверяем аутентификацию
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user && user.id && user.role === 'executor') {
            setCurrentUser(user)
            setIsAuthenticated(true)
            return user
          }
        }
        router.push('/auth/login')
        return null
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/login')
        return null
      }
    }

    checkAuth().then(user => {
      if (user) {
        loadVerificationStatus(user)
      }
    })
  }, [router])

  const loadVerificationStatus = async (user: any) => {
    try {
      const response = await fetch(`/api/verification?userId=${user.id}`)
      if (response.ok) {
        const status = await response.json()
        setVerificationStatus(status)
      }
    } catch (error) {
      console.error('Error loading verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (section: keyof DocumentData, field: string, value: string | number) => {
    setDocumentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({ ...prev, [`${section}.${field}`]: '' }))
    }
  }

  const handlePeriodChange = (field: 'startDate' | 'endDate', value: string) => {
    setDocumentData(prev => ({
      ...prev,
      income_certificate: {
        ...prev.income_certificate,
        period: {
          ...prev.income_certificate.period,
          [field]: value
        }
      }
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Валидация паспорта
    if (!documentData.passport.passportSeries) {
      newErrors['passport.passportSeries'] = 'Серия паспорта обязательна'
    }
    if (!documentData.passport.passportNumber) {
      newErrors['passport.passportNumber'] = 'Номер паспорта обязателен'
    }
    if (!documentData.passport.firstName) {
      newErrors['passport.firstName'] = 'Имя обязательно'
    }
    if (!documentData.passport.lastName) {
      newErrors['passport.lastName'] = 'Фамилия обязательна'
    }
    if (!documentData.passport.birthDate) {
      newErrors['passport.birthDate'] = 'Дата рождения обязательна'
    }

    // Валидация ЕГР
    if (!documentData.egr.regNum) {
      newErrors['egr.regNum'] = 'Регистрационный номер обязателен'
    }
    if (!documentData.egr.name) {
      newErrors['egr.name'] = 'Название организации обязательно'
    }

    // Валидация справки о доходах
    if (!documentData.income_certificate.certificateNumber) {
      newErrors['income_certificate.certificateNumber'] = 'Номер справки обязателен'
    }
    if (!documentData.income_certificate.issueDate) {
      newErrors['income_certificate.issueDate'] = 'Дата выдачи обязательна'
    }
    if (!documentData.income_certificate.organizationName) {
      newErrors['income_certificate.organizationName'] = 'Название организации обязательно'
    }
    if (!documentData.income_certificate.fullName) {
      newErrors['income_certificate.fullName'] = 'ФИО обязательно'
    }
    if (!documentData.income_certificate.period.startDate) {
      newErrors['income_certificate.period.startDate'] = 'Дата начала периода обязательна'
    }
    if (!documentData.income_certificate.period.endDate) {
      newErrors['income_certificate.period.endDate'] = 'Дата окончания периода обязательна'
    }
    if (!documentData.income_certificate.incomeAmount || documentData.income_certificate.incomeAmount <= 0) {
      newErrors['income_certificate.incomeAmount'] = 'Сумма дохода должна быть положительной'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVerification = async () => {
    if (!validateForm()) return

    setIsVerifying(true)

    try {
      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(JSON.stringify(currentUser)).toString('base64')}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          documentType: 'all',
          documentData
        })
      })

      if (response.ok) {
        const result = await response.json()
        setVerificationStatus(result)
        alert(result.message)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Ошибка при верификации')
      }
    } catch (error) {
      console.error('Error during verification:', error)
      alert('Произошла ошибка при верификации')
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'partial':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Проверка аутентификации...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка статуса верификации...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Верификация документов
          </h1>
          <p className="text-gray-600">
            Подтвердите свою личность и статус для получения больше заказов
          </p>
        </div>

        {/* Статус верификации */}
        {verificationStatus && (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary-600" />
                Статус верификации
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verificationStatus.status)}`}>
                {getStatusIcon(verificationStatus.status)}
                <span className="ml-2">
                  {verificationStatus.status === 'verified' ? 'Верифицирован' :
                   verificationStatus.status === 'partial' ? 'Частично верифицирован' :
                   verificationStatus.status === 'failed' ? 'Не верифицирован' : 'Неизвестно'}
                </span>
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{verificationStatus.message}</p>
            
            {verificationStatus.verifiedAt && (
              <p className="text-sm text-gray-500">
                Последняя проверка: {new Date(verificationStatus.verifiedAt).toLocaleString('ru-RU')}
              </p>
            )}
          </div>
        )}

        {/* Табы для документов */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 mb-8">
          <div className="border-b border-secondary-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'passport', label: 'Паспорт', icon: User },
                { id: 'egr', label: 'ЕГР РБ', icon: Building },
                { id: 'income', label: 'Справка о доходах', icon: DollarSign }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Паспорт */}
            {activeTab === 'passport' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Данные паспорта</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Серия паспорта *
                    </label>
                    <Input
                      type="text"
                      value={documentData.passport.passportSeries}
                      onChange={(e) => handleInputChange('passport', 'passportSeries', e.target.value)}
                      placeholder="AB"
                      maxLength={2}
                      className={errors['passport.passportSeries'] ? 'border-red-500' : ''}
                    />
                    {errors['passport.passportSeries'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['passport.passportSeries']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Номер паспорта *
                    </label>
                    <Input
                      type="text"
                      value={documentData.passport.passportNumber}
                      onChange={(e) => handleInputChange('passport', 'passportNumber', e.target.value)}
                      placeholder="1234567"
                      maxLength={7}
                      className={errors['passport.passportNumber'] ? 'border-red-500' : ''}
                    />
                    {errors['passport.passportNumber'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['passport.passportNumber']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия *
                    </label>
                    <Input
                      type="text"
                      value={documentData.passport.lastName}
                      onChange={(e) => handleInputChange('passport', 'lastName', e.target.value)}
                      placeholder="Иванов"
                      className={errors['passport.lastName'] ? 'border-red-500' : ''}
                    />
                    {errors['passport.lastName'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['passport.lastName']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя *
                    </label>
                    <Input
                      type="text"
                      value={documentData.passport.firstName}
                      onChange={(e) => handleInputChange('passport', 'firstName', e.target.value)}
                      placeholder="Иван"
                      className={errors['passport.firstName'] ? 'border-red-500' : ''}
                    />
                    {errors['passport.firstName'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['passport.firstName']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Отчество
                    </label>
                    <Input
                      type="text"
                      value={documentData.passport.middleName}
                      onChange={(e) => handleInputChange('passport', 'middleName', e.target.value)}
                      placeholder="Иванович"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата рождения *
                    </label>
                    <Input
                      type="date"
                      value={documentData.passport.birthDate}
                      onChange={(e) => handleInputChange('passport', 'birthDate', e.target.value)}
                      className={errors['passport.birthDate'] ? 'border-red-500' : ''}
                    />
                    {errors['passport.birthDate'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['passport.birthDate']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ЕГР РБ */}
            {activeTab === 'egr' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Данные ЕГР РБ</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Регистрационный номер *
                    </label>
                    <Input
                      type="text"
                      value={documentData.egr.regNum}
                      onChange={(e) => handleInputChange('egr', 'regNum', e.target.value)}
                      placeholder="123456789"
                      className={errors['egr.regNum'] ? 'border-red-500' : ''}
                    />
                    {errors['egr.regNum'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['egr.regNum']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тип субъекта
                    </label>
                    <select
                      value={documentData.egr.type}
                      onChange={(e) => handleInputChange('egr', 'type', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    >
                      <option value="individual">Индивидуальный предприниматель</option>
                      <option value="legal">Юридическое лицо</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название организации *
                    </label>
                    <Input
                      type="text"
                      value={documentData.egr.name}
                      onChange={(e) => handleInputChange('egr', 'name', e.target.value)}
                      placeholder="ООО 'Название компании'"
                      className={errors['egr.name'] ? 'border-red-500' : ''}
                    />
                    {errors['egr.name'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['egr.name']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Справка о доходах */}
            {activeTab === 'income' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Справка о доходах</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Номер справки *
                    </label>
                    <Input
                      type="text"
                      value={documentData.income_certificate.certificateNumber}
                      onChange={(e) => handleInputChange('income_certificate', 'certificateNumber', e.target.value)}
                      placeholder="123456"
                      className={errors['income_certificate.certificateNumber'] ? 'border-red-500' : ''}
                    />
                    {errors['income_certificate.certificateNumber'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['income_certificate.certificateNumber']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата выдачи *
                    </label>
                    <Input
                      type="date"
                      value={documentData.income_certificate.issueDate}
                      onChange={(e) => handleInputChange('income_certificate', 'issueDate', e.target.value)}
                      className={errors['income_certificate.issueDate'] ? 'border-red-500' : ''}
                    />
                    {errors['income_certificate.issueDate'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['income_certificate.issueDate']}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название организации *
                    </label>
                    <Input
                      type="text"
                      value={documentData.income_certificate.organizationName}
                      onChange={(e) => handleInputChange('income_certificate', 'organizationName', e.target.value)}
                      placeholder="ООО 'Название компании'"
                      className={errors['income_certificate.organizationName'] ? 'border-red-500' : ''}
                    />
                    {errors['income_certificate.organizationName'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['income_certificate.organizationName']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      УНП организации
                    </label>
                    <Input
                      type="text"
                      value={documentData.income_certificate.taxpayerNumber}
                      onChange={(e) => handleInputChange('income_certificate', 'taxpayerNumber', e.target.value)}
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ФИО в справке *
                    </label>
                    <Input
                      type="text"
                      value={documentData.income_certificate.fullName}
                      onChange={(e) => handleInputChange('income_certificate', 'fullName', e.target.value)}
                      placeholder="Иванов Иван Иванович"
                      className={errors['income_certificate.fullName'] ? 'border-red-500' : ''}
                    />
                    {errors['income_certificate.fullName'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['income_certificate.fullName']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Период с *
                    </label>
                    <Input
                      type="date"
                      value={documentData.income_certificate.period.startDate}
                      onChange={(e) => handlePeriodChange('startDate', e.target.value)}
                      className={errors['income_certificate.period.startDate'] ? 'border-red-500' : ''}
                    />
                    {errors['income_certificate.period.startDate'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['income_certificate.period.startDate']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Период по *
                    </label>
                    <Input
                      type="date"
                      value={documentData.income_certificate.period.endDate}
                      onChange={(e) => handlePeriodChange('endDate', e.target.value)}
                      className={errors['income_certificate.period.endDate'] ? 'border-red-500' : ''}
                    />
                    {errors['income_certificate.period.endDate'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['income_certificate.period.endDate']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сумма дохода (BYN) *
                    </label>
                    <Input
                      type="number"
                      value={documentData.income_certificate.incomeAmount}
                      onChange={(e) => handleInputChange('income_certificate', 'incomeAmount', parseFloat(e.target.value) || 0)}
                      placeholder="1000"
                      min="0"
                      step="0.01"
                      className={errors['income_certificate.incomeAmount'] ? 'border-red-500' : ''}
                    />
                    {errors['income_certificate.incomeAmount'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['income_certificate.incomeAmount']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка верификации */}
        <div className="flex justify-center">
          <Button
            onClick={handleVerification}
            disabled={isVerifying}
            className="px-8 py-3 text-lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Верификация...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Начать верификацию
              </>
            )}
          </Button>
        </div>

        {/* Информация о верификации */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Как работает верификация?
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li>• <strong>Паспорт:</strong> Проверяется через базу данных МВД РБ</li>
            <li>• <strong>ЕГР РБ:</strong> Проверяется регистрационный номер в Едином государственном реестре</li>
            <li>• <strong>Справка о доходах:</strong> Проверяется через базу данных МНС РБ</li>
            <li>• <strong>Безопасность:</strong> Все данные передаются по защищенному соединению</li>
            <li>• <strong>Конфиденциальность:</strong> Ваши данные не передаются третьим лицам</li>
          </ul>
        </div>
      </div>
    </div>
  )
}





