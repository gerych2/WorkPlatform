import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VerificationRequest {
  userId: number
  documentType: 'passport' | 'egr' | 'income_certificate' | 'all'
  documentData: any
}

interface VerificationResult {
  success: boolean
  results: {
    [key: string]: {
      isValid: boolean
      data?: any
      error?: string
      timestamp: string
    }
  }
  overallStatus: 'verified' | 'partial' | 'failed'
  message: string
}

// Основной endpoint для верификации документов
export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json()
    const { userId, documentType, documentData } = body

    if (!userId || !documentType || !documentData) {
      return NextResponse.json(
        { error: 'Необходимо указать userId, documentType и documentData' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { executorProfile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    const results: VerificationResult['results'] = {}
    let overallStatus: VerificationResult['overallStatus'] = 'failed'
    let message = ''

    // Верификация в зависимости от типа документа
    if (documentType === 'passport' || documentType === 'all') {
      try {
        const passportResult = await verifyPassport(documentData.passport)
        results.passport = passportResult
      } catch (error) {
        results.passport = {
          isValid: false,
          error: 'Ошибка при верификации паспорта',
          timestamp: new Date().toISOString()
        }
      }
    }

    if (documentType === 'egr' || documentType === 'all') {
      try {
        const egrResult = await verifyEGR(documentData.egr)
        results.egr = egrResult
      } catch (error) {
        results.egr = {
          isValid: false,
          error: 'Ошибка при верификации ЕГР',
          timestamp: new Date().toISOString()
        }
      }
    }

    if (documentType === 'income_certificate' || documentType === 'all') {
      try {
        const incomeResult = await verifyIncomeCertificate(documentData.income_certificate)
        results.income_certificate = incomeResult
      } catch (error) {
        results.income_certificate = {
          isValid: false,
          error: 'Ошибка при верификации справки о доходах',
          timestamp: new Date().toISOString()
        }
      }
    }

    // Определяем общий статус верификации
    const validResults = Object.values(results).filter(result => result.isValid)
    const totalResults = Object.keys(results).length

    if (validResults.length === totalResults && totalResults > 0) {
      overallStatus = 'verified'
      message = 'Все документы успешно верифицированы'
    } else if (validResults.length > 0) {
      overallStatus = 'partial'
      message = `Верифицировано ${validResults.length} из ${totalResults} документов`
    } else {
      overallStatus = 'failed'
      message = 'Верификация документов не пройдена'
    }

    // Сохраняем результаты верификации в базе данных
    await saveVerificationResults(userId, results, overallStatus)

    // Обновляем статус верификации пользователя
    await updateUserVerificationStatus(userId, overallStatus)

    const verificationResult: VerificationResult = {
      success: overallStatus !== 'failed',
      results,
      overallStatus,
      message
    }

    return NextResponse.json(verificationResult)

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Ошибка при верификации документов' },
      { status: 500 }
    )
  }
}

// Верификация паспорта
async function verifyPassport(passportData: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/verification/passport`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(passportData)
  })

  const result = await response.json()
  return {
    isValid: result.isValid,
    data: result.data,
    error: result.error,
    timestamp: result.timestamp
  }
}

// Верификация ЕГР
async function verifyEGR(egrData: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/verification/egr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(egrData)
  })

  const result = await response.json()
  return {
    isValid: result.isValid,
    data: result.data,
    error: result.error,
    timestamp: result.timestamp
  }
}

// Верификация справки о доходах
async function verifyIncomeCertificate(incomeData: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/verification/income-certificate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(incomeData)
  })

  const result = await response.json()
  return {
    isValid: result.isValid,
    data: result.data,
    error: result.error,
    timestamp: result.timestamp
  }
}

// Сохранение результатов верификации
async function saveVerificationResults(userId: number, results: any, overallStatus: string) {
  try {
    // Создаем запись о верификации
    await prisma.verification.create({
      data: {
        userId,
        status: overallStatus,
        results: JSON.stringify(results),
        verifiedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error saving verification results:', error)
  }
}

// Обновление статуса верификации пользователя
async function updateUserVerificationStatus(userId: number, status: string) {
  try {
    const isVerified = status === 'verified'
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified,
        verificationStatus: status
      }
    })

    // Если это исполнитель, обновляем и его профиль
    if (isVerified) {
      await prisma.executorProfile.updateMany({
        where: { userId },
        data: {
          isVerified: true,
          verificationStatus: 'verified'
        }
      })
    }
  } catch (error) {
    console.error('Error updating user verification status:', error)
  }
}

// GET endpoint для получения статуса верификации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Необходимо указать userId' },
        { status: 400 }
      )
    }

    // Получаем последнюю верификацию пользователя
    const verification = await prisma.verification.findFirst({
      where: { userId: parseInt(userId) },
      orderBy: { verifiedAt: 'desc' }
    })

    if (!verification) {
      return NextResponse.json({
        isVerified: false,
        status: 'not_verified',
        message: 'Верификация не проводилась'
      })
    }

    const results = JSON.parse(verification.results)

    return NextResponse.json({
      isVerified: verification.status === 'verified',
      status: verification.status,
      results,
      verifiedAt: verification.verifiedAt,
      message: getVerificationMessage(verification.status, results)
    })

  } catch (error) {
    console.error('Error getting verification status:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении статуса верификации' },
      { status: 500 }
    )
  }
}

// Получение сообщения о статусе верификации
function getVerificationMessage(status: string, results: any): string {
  switch (status) {
    case 'verified':
      return 'Все документы успешно верифицированы'
    case 'partial':
      const validCount = Object.values(results).filter((result: any) => result.isValid).length
      const totalCount = Object.keys(results).length
      return `Верифицировано ${validCount} из ${totalCount} документов`
    case 'failed':
      return 'Верификация документов не пройдена'
    default:
      return 'Статус верификации неизвестен'
  }
}





