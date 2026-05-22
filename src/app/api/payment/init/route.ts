import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { initPayment } from '@/lib/tbank'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

    let orderId: string
    try {
      const body = await req.json()
      orderId = body.orderId
    } catch {
      return NextResponse.json({ error: 'Неверный запрос' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true },
    })

    if (!order) return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    if (order.buyerId !== session.userId) return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    if (order.paid) return NextResponse.json({ error: 'Заказ уже оплачен' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unit-one.ru'
    const amountKopecks = Math.round(Number(order.price) * 100)

    const result = await initPayment({
      orderId: order.id,
      amountKopecks,
      description: `Оплата услуги: ${order.service.title.slice(0, 140)}`,
      successUrl: `${baseUrl}/dashboard/orders/${order.id}?payment=success`,
      failUrl: `${baseUrl}/dashboard/orders/${order.id}?payment=fail`,
      notificationUrl: `${baseUrl}/api/payment/notify`,
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: result.paymentId },
    })

    return NextResponse.json({ paymentUrl: result.paymentUrl })
  } catch (e) {
    console.error('[payment/init]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
