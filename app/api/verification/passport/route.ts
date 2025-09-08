import { NextRequest, NextResponse } from 'next/server'

interface PassportVerificationRequest {
  passportSeries: string
  passportNumber: string
  firstName: string
  lastName: string
  middleName?: string
  birthDate: string
}

interface PassportVerificationResult {
  isValid: boolean
  data?: {
    fullName: string
    birthDate: string
    passportInfo: string
    status: string
  }
  error?: string
  verificationType: string
  timestamp: string
}

// Верификация паспортных данных
export async function POST(request: NextRequest) {
  try {
    const body: PassportVerificationRequest = await request.json()
    const { passportSeries, passportNumber, firstName, lastName, middleName, birthDate } = body

    // Валидация входных данных
    if (!passportSeries || !passportNumber || !firstName || !lastName || !birthDate) {
      return NextResponse.json(
        { error: 'Необходимо заполнить все обязательные поля' },
        { status: 400 }
      )
    }

    // Проверка формата серии и номера паспорта
    if (!/^[A-Z]{2}$/.test(passportSeries)) {
      return NextResponse.json(
        { error: 'Неверный формат серии паспорта' },
        { status: 400 }
      )
    }

    if (!/^\d{7}$/.test(passportNumber)) {
      return NextResponse.json(
        { error: 'Неверный формат номера паспорта' },
        { status: 400 }
      )
    }

    // Проверка даты рождения
    const birthDateObj = new Date(birthDate)
    if (isNaN(birthDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Неверный формат даты рождения' },
        { status: 400 }
      )
    }

    // В реальном приложении здесь был бы запрос к API МВД РБ
    // Пока используем моковую проверку
    const verificationResult = await verifyPassportData({
      passportSeries,
      passportNumber,
      firstName,
      lastName,
      middleName,
      birthDate
    })

    return NextResponse.json(verificationResult)

  } catch (error) {
    console.error('Passport verification error:', error)
    return NextResponse.json(
      { error: 'Ошибка при верификации паспортных данных' },
      { status: 500 }
    )
  }
}

// Моковая функция верификации паспортных данных
async function verifyPassportData(data: PassportVerificationRequest): Promise<PassportVerificationResult> {
  try {
    // В реальном приложении здесь был бы запрос к API МВД РБ
    // Например: https://api.mvd.gov.by/v1/passport/verify
    
    // Моковая логика проверки
    const isValidPassport = await mockPassportVerification(data)

    if (!isValidPassport) {
      return {
        isValid: false,
        error: 'Паспортные данные не найдены или неверны',
        verificationType: 'passport',
        timestamp: new Date().toISOString()
      }
    }

    const fullName = `${data.lastName} ${data.firstName}${data.middleName ? ' ' + data.middleName : ''}`

    return {
      isValid: true,
      data: {
        fullName,
        birthDate: data.birthDate,
        passportInfo: `${data.passportSeries} ${data.passportNumber}`,
        status: 'active'
      },
      verificationType: 'passport',
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error in passport verification:', error)
    return {
      isValid: false,
      error: 'Ошибка при обращении к базе данных паспортов',
      verificationType: 'passport',
      timestamp: new Date().toISOString()
    }
  }
}

// Моковая функция проверки паспорта
async function mockPassportVerification(data: PassportVerificationRequest): Promise<boolean> {
  // В реальном приложении здесь был бы запрос к API МВД РБ
  // Пока используем простую логику для демонстрации
  
  // Проверяем, что серия и номер не содержат запрещенных комбинаций
  const forbiddenSeries = ['XX', 'YY', 'ZZ']
  const forbiddenNumbers = ['0000000', '1111111', '1234567']
  
  if (forbiddenSeries.includes(data.passportSeries) || 
      forbiddenNumbers.includes(data.passportNumber)) {
    return false
  }

  // Проверяем возраст (должен быть старше 14 лет для паспорта)
  const birthDate = new Date(data.birthDate)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  
  if (age < 14) {
    return false
  }

  // В реальном приложении здесь была бы проверка в базе данных МВД
  // Пока возвращаем true для валидных данных
  return true
}

// GET endpoint для проверки статуса паспорта
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const passportSeries = searchParams.get('series')
    const passportNumber = searchParams.get('number')

    if (!passportSeries || !passportNumber) {
      return NextResponse.json(
        { error: 'Необходимо указать серию и номер паспорта' },
        { status: 400 }
      )
    }

    // Простая проверка существования паспорта
    const isValid = await mockPassportVerification({
      passportSeries,
      passportNumber,
      firstName: '',
      lastName: '',
      birthDate: '1990-01-01'
    })

    return NextResponse.json({
      exists: isValid,
      verificationType: 'passport',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Passport status check error:', error)
    return NextResponse.json(
      { error: 'Ошибка при проверке статуса паспорта' },
      { status: 500 }
    )
  }
}





