import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyNotification } from '@/lib/tbank'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  if (!await verifyNotification(body)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  // OrderId format: "dbOrderId_timestamp" — extract the real DB id
  const tbankOrderId = body.OrderId as string
  const orderId = tbankOrderId.includes('_') ? tbankOrderId.split('_').slice(0, -1).join('_') : tbankOrderId
  const status = body.Status as string
  const success = body.Success as boolean

  if (!success || status !== 'CONFIRMED') {
    return NextResponse.json({ ok: true })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: true },
  })

  if (!order || order.paid) {
    return NextResponse.json({ ok: true })
  }

  const now = new Date()
  await prisma.order.update({
    where: { id: orderId },
    data: { paid: true, status: 'ACTIVE', paidAt: now },
  })

  await prisma.orderLog.create({
    data: {
      orderId,
      fromStatus: 'PENDING',
      toStatus: 'ACTIVE',
      note: `Оплата подтверждена (PaymentId: ${body.PaymentId})`,
    },
  })

  await prisma.notification.create({
    data: {
      userId: order.service.sellerId,
      type: 'ORDER_NEW',
      title: 'Оплата получена',
      body: `Заказ на "${order.service.title}" оплачен покупателем`,
      link: `/dashboard/orders/incoming`,
    },
  })

  await prisma.notification.create({
    data: {
      userId: order.buyerId,
      type: 'ORDER_STATUS',
      title: 'Оплата прошла успешно',
      body: `Заказ на "${order.service.title}" оплачен и передан исполнителю`,
      link: `/dashboard/orders/${orderId}`,
    },
  })

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders')
  revalidatePath('/dashboard/orders/incoming')

  return NextResponse.json({ ok: true })
}
