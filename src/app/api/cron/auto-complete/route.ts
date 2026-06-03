import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDisputeConfig } from '@/lib/disputeConfig'

export const runtime = 'nodejs'

// Called by server cron: curl -H "Authorization: Bearer $CRON_SECRET" https://unit-one.ru/api/cron/auto-complete
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cfg = await getDisputeConfig()
  const autoCompleteMs = cfg.autoCompleteHours * 3600000
  const cutoff = new Date(Date.now() - autoCompleteMs)

  // Find IN_PROGRESS orders where work started > 48h ago and no open dispute
  const orders = await prisma.order.findMany({
    where: {
      status: 'IN_PROGRESS',
      workStartedAt: { lte: cutoff },
      dispute: { is: null },
    },
    include: { service: { select: { title: true, sellerId: true } } },
  })

  const now = new Date()
  let completed = 0

  for (const order of orders) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED', completedAt: now },
      })
      await tx.orderLog.create({
        data: {
          orderId: order.id,
          fromStatus: 'IN_PROGRESS',
          toStatus: 'COMPLETED',
          note: `Автозавершение: ${cfg.autoCompleteHours} ч без спора`,
        },
      })
      await tx.notification.create({
        data: {
          userId: order.buyerId,
          type: 'ORDER_STATUS',
          title: 'Заказ завершён автоматически',
          body: `Заказ "${order.service.title}" завершён. Пожалуйста, оставьте отзыв.`,
          link: `/dashboard/orders/${order.id}`,
        },
      })
    })
    completed++
  }

  return NextResponse.json({ completed, checked: orders.length })
}
