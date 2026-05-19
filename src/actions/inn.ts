'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { InnSchema } from '@/lib/definitions'
import type { BusinessType } from '@prisma/client'

export type InnVerifyState = {
  error?: string
  result?: {
    inn: string
    name: string
    type: string
    status: string
    ogrn: string
    address: string
  }
}

export type InnSaveState = {
  error?: string
  success?: boolean
}

export async function verifyInn(
  _prev: InnVerifyState,
  formData: FormData
): Promise<InnVerifyState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const parsed = InnSchema.safeParse({ inn: formData.get('inn') })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.inn?.[0] ?? 'Некорректный ИНН' }
  }

  const apiKey = process.env.DADATA_API_KEY
  if (!apiKey) return { error: 'Сервис временно недоступен' }

  const res = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${apiKey}`,
    },
    body: JSON.stringify({ query: parsed.data.inn }),
  })

  if (!res.ok) return { error: 'Ошибка запроса к ФНС' }

  const data = await res.json()
  const org = data.suggestions?.[0]?.data
  if (!org) return { error: 'ИНН не найден в реестре ФНС' }

  return {
    result: {
      inn: org.inn,
      name: org.name?.full_with_opf ?? org.name?.short_with_opf ?? '',
      type: org.type,
      status: org.state?.status ?? '',
      ogrn: org.ogrn ?? '',
      address: org.address?.value ?? '',
    },
  }
}

export async function saveInn(
  _prev: InnSaveState,
  formData: FormData
): Promise<InnSaveState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const inn = formData.get('inn') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string // LEGAL | INDIVIDUAL

  const businessType: BusinessType =
    type === 'LEGAL' ? 'COMPANY' : 'IP'

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      inn,
      innVerified: true,
      businessType,
      companyName: name,
    },
  })

  return { success: true }
}
