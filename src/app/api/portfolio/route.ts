import { NextResponse } from 'next/server'
import { addPortfolioImage } from '@/actions/profile'

export async function POST(req: Request) {
  const fd = await req.formData()
  const url = fd.get('portfolioUrl') as string | null
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 })

  const result = await addPortfolioImage(url)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true })
}
