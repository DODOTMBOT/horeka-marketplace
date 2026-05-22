import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ titles: [], tags: [] })

  const [services, tagRows] = await Promise.all([
    prisma.service.findMany({
      where: { status: 'ACTIVE', title: { contains: q, mode: 'insensitive' } },
      select: { title: true },
      take: 5,
    }),
    prisma.$queryRaw<{ tag: string }[]>`
      SELECT DISTINCT tag FROM (
        SELECT UNNEST(tags) as tag FROM "Service" WHERE status = 'ACTIVE'
      ) t WHERE tag ILIKE ${`%${q}%`} LIMIT 6
    `,
  ])

  return NextResponse.json({
    titles: [...new Set(services.map(s => s.title))].slice(0, 5),
    tags: tagRows.map(r => r.tag),
  })
}
