import { NextRequest, NextResponse } from 'next/server'

// Базовый URL для API ЕГР РБ (замените на реальный)
const EGR_API_BASE_URL = process.env.EGR_API_BASE_URL || 'https://api.egr.gov.by/v2'

interface EGRVerificationRequest {
  regNum?: string
  name?: string
  startDate?: string
  endDate?: string
  type: 'individual' | 'legal' | 'both'
}

interface EGRVerificationResult {
  isValid: boolean
  data?: any
  error?: string
  verificationType: string
  timestamp: string
}

// Основной endpoint для верификации через ЕГР РБ
export async function POST(request: NextRequest) {
  try {
    const body: EGRVerificationRequest = await request.json()
    const { regNum, name, type } = body

    if (!regNum && !name) {
      return NextResponse.json(
        { error: 'Необходимо указать регистрационный номер или название' },
        { status: 400 }
      )
    }

    let verificationResult: EGRVerificationResult

    if (regNum) {
      // Верификация по регистрационному номеру
      verificationResult = await verifyByRegNum(regNum, type)
    } else if (name) {
      // Верификация по названию
      verificationResult = await verifyByName(name, type)
    } else {
      return NextResponse.json(
        { error: 'Неверные параметры запроса' },
        { status: 400 }
      )
    }

    return NextResponse.json(verificationResult)

  } catch (error) {
    console.error('EGR verification error:', error)
    return NextResponse.json(
      { error: 'Ошибка при верификации через ЕГР РБ' },
      { status: 500 }
    )
  }
}

// Верификация по регистрационному номеру
async function verifyByRegNum(regNum: string, type: string): Promise<EGRVerificationResult> {
  try {
    // Получаем базовую информацию
    const baseInfoResponse = await fetch(`${EGR_API_BASE_URL}/egr/getBaseInfoByRegNum/${regNum}`)
    
    if (!baseInfoResponse.ok) {
      return {
        isValid: false,
        error: 'Субъект не найден в ЕГР РБ',
        verificationType: 'egr_regnum',
        timestamp: new Date().toISOString()
      }
    }

    const baseInfo = await baseInfoResponse.json()

    // Дополнительные проверки в зависимости от типа
    const additionalData: any = {}

    if (type === 'individual' || type === 'both') {
      // Получаем ФИО ИП
      const fioResponse = await fetch(`${EGR_API_BASE_URL}/egr/getIPFIOByRegNum/${regNum}`)
      if (fioResponse.ok) {
        additionalData.fio = await fioResponse.json()
      }

      // Получаем адрес ИП
      const addressResponse = await fetch(`${EGR_API_BASE_URL}/egr/getAddressByRegNum/${regNum}`)
      if (addressResponse.ok) {
        additionalData.address = await addressResponse.json()
      }
    }

    if (type === 'legal' || type === 'both') {
      // Получаем названия юридического лица
      const namesResponse = await fetch(`${EGR_API_BASE_URL}/egr/getJurNamesByRegNum/${regNum}`)
      if (namesResponse.ok) {
        additionalData.names = await namesResponse.json()
      }

      // Получаем ВЭД
      const vedResponse = await fetch(`${EGR_API_BASE_URL}/egr/getVEDByRegNum/${regNum}`)
      if (vedResponse.ok) {
        additionalData.ved = await vedResponse.json()
      }
    }

    return {
      isValid: true,
      data: {
        baseInfo,
        ...additionalData
      },
      verificationType: 'egr_regnum',
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error verifying by reg num:', error)
    return {
      isValid: false,
      error: 'Ошибка при обращении к ЕГР РБ',
      verificationType: 'egr_regnum',
      timestamp: new Date().toISOString()
    }
  }
}

// Верификация по названию
async function verifyByName(name: string, type: string): Promise<EGRVerificationResult> {
  try {
    // Получаем краткую информацию по названию
    const shortInfoResponse = await fetch(`${EGR_API_BASE_URL}/egr/getShortInfoByRegName/${encodeURIComponent(name)}`)
    
    if (!shortInfoResponse.ok) {
      return {
        isValid: false,
        error: 'Субъект с таким названием не найден в ЕГР РБ',
        verificationType: 'egr_name',
        timestamp: new Date().toISOString()
      }
    }

    const shortInfo = await shortInfoResponse.json()

    return {
      isValid: true,
      data: {
        shortInfo
      },
      verificationType: 'egr_name',
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error verifying by name:', error)
    return {
      isValid: false,
      error: 'Ошибка при обращении к ЕГР РБ',
      verificationType: 'egr_name',
      timestamp: new Date().toISOString()
    }
  }
}

// GET endpoint для получения статуса верификации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const regNum = searchParams.get('regNum')
    const name = searchParams.get('name')

    if (!regNum && !name) {
      return NextResponse.json(
        { error: 'Необходимо указать регистрационный номер или название' },
        { status: 400 }
      )
    }

    // Простая проверка существования
    const result = regNum 
      ? await verifyByRegNum(regNum, 'both')
      : await verifyByName(name!, 'both')

    return NextResponse.json({
      exists: result.isValid,
      verificationType: result.verificationType,
      timestamp: result.timestamp
    })

  } catch (error) {
    console.error('EGR status check error:', error)
    return NextResponse.json(
      { error: 'Ошибка при проверке статуса' },
      { status: 500 }
    )
  }
}







