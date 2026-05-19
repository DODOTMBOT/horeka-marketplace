import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { InnSchema } from '@/lib/definitions'

const DADATA_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = InnSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.inn?.[0] ?? 'Некорректный ИНН' },
      { status: 422 }
    )
  }

  const apiKey = process.env.DADATA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'DaData API key not configured' }, { status: 503 })
  }

  const response = await fetch(DADATA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${apiKey}`,
    },
    body: JSON.stringify({ query: parsed.data.inn }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Ошибка запроса к DaData' }, { status: 502 })
  }

  const data = await response.json()
  const suggestions = data.suggestions ?? []

  if (suggestions.length === 0) {
    return NextResponse.json({ error: 'ИНН не найден в реестре ФНС' }, { status: 404 })
  }

  const org = suggestions[0].data
  return NextResponse.json({
    inn: org.inn,
    name: org.name?.full_with_opf ?? org.name?.short_with_opf ?? '',
    type: org.type,
    status: org.state?.status,
    ogrn: org.ogrn,
    address: org.address?.value,
  })
}
