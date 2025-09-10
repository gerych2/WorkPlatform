import { NextRequest, NextResponse } from 'next/server'

interface IncomeCertificateVerificationRequest {
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

interface IncomeCertificateVerificationResult {
  isValid: boolean
  data?: {
    certificateNumber: string
    issueDate: string
    organizationName: string
    fullName: string
    period: {
      startDate: string
      endDate: string
    }
    incomeAmount: number
    status: string
  }
  error?: string
  verificationType: string
  timestamp: string
}

// Верификация справки о доходах
export async function POST(request: NextRequest) {
  try {
    const body: IncomeCertificateVerificationRequest = await request.json()
    const { certificateNumber, issueDate, organizationName, taxpayerNumber, fullName, period, incomeAmount } = body

    // Валидация входных данных
    if (!certificateNumber || !issueDate || !organizationName || !taxpayerNumber || !fullName || !period || !incomeAmount) {
      return NextResponse.json(
        { error: 'Необходимо заполнить все обязательные поля' },
        { status: 400 }
      )
    }

    // Проверка формата номера справки
    if (!/^\d{6,12}$/.test(certificateNumber)) {
      return NextResponse.json(
        { error: 'Неверный формат номера справки' },
        { status: 400 }
      )
    }

    // Проверка даты выдачи
    const issueDateObj = new Date(issueDate)
    if (isNaN(issueDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Неверный формат даты выдачи' },
        { status: 400 }
      )
    }

    // Проверка периода
    const startDateObj = new Date(period.startDate)
    const endDateObj = new Date(period.endDate)
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Неверный формат периода' },
        { status: 400 }
      )
    }

    if (startDateObj >= endDateObj) {
      return NextResponse.json(
        { error: 'Дата начала периода должна быть раньше даты окончания' },
        { status: 400 }
      )
    }

    // Проверка суммы дохода
    if (incomeAmount <= 0) {
      return NextResponse.json(
        { error: 'Сумма дохода должна быть положительной' },
        { status: 400 }
      )
    }

    // Верификация справки
    const verificationResult = await verifyIncomeCertificate({
      certificateNumber,
      issueDate,
      organizationName,
      taxpayerNumber,
      fullName,
      period,
      incomeAmount
    })

    return NextResponse.json(verificationResult)

  } catch (error) {
    console.error('Income certificate verification error:', error)
    return NextResponse.json(
      { error: 'Ошибка при верификации справки о доходах' },
      { status: 500 }
    )
  }
}

// Моковая функция верификации справки о доходах
async function verifyIncomeCertificate(data: IncomeCertificateVerificationRequest): Promise<IncomeCertificateVerificationResult> {
  try {
    // В реальном приложении здесь был бы запрос к API МНС РБ
    // Например: https://api.nalog.gov.by/v1/certificates/verify
    
    // Моковая логика проверки
    const isValidCertificate = await mockIncomeCertificateVerification(data)

    if (!isValidCertificate) {
      return {
        isValid: false,
        error: 'Справка о доходах не найдена или неверна',
        verificationType: 'income_certificate',
        timestamp: new Date().toISOString()
      }
    }

    return {
      isValid: true,
      data: {
        certificateNumber: data.certificateNumber,
        issueDate: data.issueDate,
        organizationName: data.organizationName,
        fullName: data.fullName,
        period: data.period,
        incomeAmount: data.incomeAmount,
        status: 'valid'
      },
      verificationType: 'income_certificate',
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error in income certificate verification:', error)
    return {
      isValid: false,
      error: 'Ошибка при обращении к базе данных справок',
      verificationType: 'income_certificate',
      timestamp: new Date().toISOString()
    }
  }
}

// Моковая функция проверки справки о доходах
async function mockIncomeCertificateVerification(data: IncomeCertificateVerificationRequest): Promise<boolean> {
  // В реальном приложении здесь был бы запрос к API МНС РБ
  // Пока используем простую логику для демонстрации
  
  // Проверяем, что номер справки не содержит запрещенных комбинаций
  const forbiddenNumbers = ['000000', '111111', '123456']
  
  if (forbiddenNumbers.includes(data.certificateNumber)) {
    return false
  }

  // Проверяем, что дата выдачи не в будущем
  const issueDate = new Date(data.issueDate)
  const today = new Date()
  
  if (issueDate > today) {
    return false
  }

  // Проверяем, что период не превышает 1 год
  const startDate = new Date(data.period.startDate)
  const endDate = new Date(data.period.endDate)
  const periodDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  
  if (periodDays > 365) {
    return false
  }

  // Проверяем разумность суммы дохода (не более 1 млн BYN в месяц)
  const periodMonths = periodDays / 30
  const monthlyIncome = data.incomeAmount / periodMonths
  
  if (monthlyIncome > 1000000) {
    return false
  }

  // В реальном приложении здесь была бы проверка в базе данных МНС
  // Пока возвращаем true для валидных данных
  return true
}

// GET endpoint для проверки статуса справки
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const certificateNumber = searchParams.get('number')
    const organizationName = searchParams.get('organization')

    if (!certificateNumber || !organizationName) {
      return NextResponse.json(
        { error: 'Необходимо указать номер справки и название организации' },
        { status: 400 }
      )
    }

    // Простая проверка существования справки
    const isValid = await mockIncomeCertificateVerification({
      certificateNumber,
      issueDate: new Date().toISOString().split('T')[0],
      organizationName,
      taxpayerNumber: '123456789',
      fullName: 'Тестовый Пользователь',
      period: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      incomeAmount: 1000
    })

    return NextResponse.json({
      exists: isValid,
      verificationType: 'income_certificate',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Income certificate status check error:', error)
    return NextResponse.json(
      { error: 'Ошибка при проверке статуса справки' },
      { status: 500 }
    )
  }
}







