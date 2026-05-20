import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v).replace(/"/g, '""')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
  }
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ].join('\n')
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const type = req.nextUrl.searchParams.get('type') ?? 'users'

  let csv = ''
  let filename = 'export.csv'

  if (type === 'users') {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        companyName: true, inn: true, innVerified: true, blocked: true, createdAt: true,
        _count: { select: { services: true, orders: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    csv = toCsv(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? '',
      role: u.role,
      company: u.companyName ?? '',
      inn: u.inn ?? '',
      inn_verified: u.innVerified,
      blocked: u.blocked,
      services: u._count.services,
      orders: u._count.orders,
      reviews: u._count.reviews,
      created_at: u.createdAt.toISOString(),
    })))
    filename = 'users.csv'

  } else if (type === 'orders') {
    const orders = await prisma.order.findMany({
      include: {
        buyer: { select: { name: true, email: true } },
        service: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    csv = toCsv(orders.map(o => ({
      id: o.id,
      status: o.status,
      price: Number(o.price),
      buyer_name: o.buyer.name,
      buyer_email: o.buyer.email,
      service: o.service.title,
      created_at: o.createdAt.toISOString(),
    })))
    filename = 'orders.csv'

  } else if (type === 'reviews') {
    const reviews = await prisma.review.findMany({
      include: {
        author: { select: { name: true, email: true } },
        service: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    csv = toCsv(reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? '',
      author_name: r.author.name,
      author_email: r.author.email,
      service: r.service.title,
      created_at: r.createdAt.toISOString(),
    })))
    filename = 'reviews.csv'
  } else {
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  }

  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
