'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import { logActivity } from '@/lib/activity'
import { DisputeReason } from '@prisma/client'
import { REASON_LABELS } from '@/lib/disputeLabels'
import { getDisputeConfig } from '@/lib/disputeConfig'

export type OpenDisputeState = {
  error?: string
  success?: boolean
}

export async function openDispute(
  _prev: OpenDisputeState,
  formData: FormData
): Promise<OpenDisputeState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const orderId = formData.get('orderId') as string
  const reason = formData.get('reason') as DisputeReason
  const description = (formData.get('description') as string)?.trim()
  const fileUrls = formData.getAll('fileUrl') as string[]
  const fileNames = formData.getAll('fileName') as string[]
  const fileSizes = formData.getAll('fileSize') as string[]

  const cfg = await getDisputeConfig()

  if (!orderId) return { error: 'Заказ не указан' }
  if (!reason) return { error: 'Выберите причину спора' }
  if (!description || description.length < cfg.minDescriptionLength) {
    return { error: `Опишите ситуацию подробнее (минимум ${cfg.minDescriptionLength} символов)` }
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: true, dispute: { select: { id: true } } },
  })
  if (!order) return { error: 'Заказ не найден' }
  if (order.buyerId !== session.userId) return { error: 'Нет доступа' }
  if (!['ACTIVE', 'IN_PROGRESS'].includes(order.status)) return { error: 'Спор можно открыть только по активному заказу' }

  const disputeDelayMs = cfg.disputeDelayHours * 3600000
  if (order.paidAt && cfg.disputeDelayHours > 0) {
    const elapsed = Date.now() - new Date(order.paidAt).getTime()
    if (elapsed < disputeDelayMs) {
      const hoursLeft = Math.ceil((disputeDelayMs - elapsed) / 3600000)
      return { error: `Спор можно открыть через ${hoursLeft} ч после оплаты` }
    }
  }

  if (order.dispute) return { error: 'Спор уже открыт' }

  const now = new Date()
  await prisma.$transaction(async (tx) => {
    const dispute = await tx.dispute.create({
      data: {
        orderId,
        openedById: session.userId,
        reason,
        description,
        files: fileUrls.length > 0 ? {
          create: fileUrls.map((url, i) => ({
            url,
            name: fileNames[i] ?? 'file',
            size: parseInt(fileSizes[i] ?? '0', 10),
          })),
        } : undefined,
      },
    })

    await tx.order.update({
      where: { id: orderId },
      data: { status: 'DISPUTED', disputeOpenedAt: now },
    })

    await tx.orderLog.create({
      data: {
        orderId,
        userId: session.userId,
        fromStatus: order.status as 'ACTIVE' | 'IN_PROGRESS',
        toStatus: 'DISPUTED',
        note: `Спор открыт: ${REASON_LABELS[reason] ?? reason}`,
      },
    })

    return dispute
  })

  const sellerId = order.service.sellerId
  await Promise.all([
    createNotification({
      userId: sellerId,
      type: 'ORDER_STATUS',
      title: 'Открыт спор по заказу',
      body: `Покупатель открыл спор по заказу "${order.service.title}". Ожидайте решения модератора.`,
      link: `/dashboard/orders/${orderId}`,
    }),
    createNotification({
      userId: session.userId,
      type: 'ORDER_STATUS',
      title: 'Спор принят в рассмотрение',
      body: `Модератор рассмотрит ситуацию в течение ${cfg.reviewHours} часов.`,
      link: `/dashboard/orders/${orderId}`,
    }),
  ])

  await logActivity({
    userId: session.userId,
    action: 'ORDER_DISPUTE',
    target: orderId,
    meta: { reason, serviceTitle: order.service.title },
  })

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders')
  return { success: true }
}

export async function resolveDispute(
  disputeId: string,
  outcome: 'CONFIRMED' | 'REJECTED',
  resolution: string
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Нет доступа' }
  if (!resolution.trim()) return { error: 'Укажите решение' }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { order: { include: { service: true } } },
  })
  if (!dispute) return { error: 'Спор не найден' }
  if (dispute.status !== 'OPEN') return { error: 'Спор уже закрыт' }

  const now = new Date()
  const newOrderStatus = outcome === 'CONFIRMED' ? 'CANCELLED' : 'COMPLETED'

  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: outcome,
        resolution: resolution.trim(),
        resolvedById: session.userId,
        resolvedAt: now,
      },
    })

    await tx.order.update({
      where: { id: dispute.orderId },
      data: { status: newOrderStatus, completedAt: now },
    })

    await tx.orderLog.create({
      data: {
        orderId: dispute.orderId,
        userId: session.userId,
        fromStatus: 'DISPUTED',
        toStatus: newOrderStatus,
        note: `Спор ${outcome === 'CONFIRMED' ? 'подтверждён (возврат покупателю)' : 'отклонён (выплата исполнителю)'}. ${resolution.trim()}`,
      },
    })
  })

  const order = dispute.order
  const buyerMsg = outcome === 'CONFIRMED'
    ? `Спор подтверждён. Возврат средств будет выполнен в ближайшее время.`
    : `Спор отклонён. Заказ считается выполненным.`
  const sellerMsg = outcome === 'CONFIRMED'
    ? `Спор по заказу "${order.service.title}" подтверждён — деньги возвращены покупателю.`
    : `Спор по заказу "${order.service.title}" отклонён — выплата будет произведена.`

  await Promise.all([
    createNotification({
      userId: order.buyerId,
      type: 'ORDER_STATUS',
      title: 'Решение по спору',
      body: buyerMsg,
      link: `/dashboard/orders/${order.id}`,
    }),
    createNotification({
      userId: order.service.sellerId,
      type: 'ORDER_STATUS',
      title: 'Решение по спору',
      body: sellerMsg,
      link: `/dashboard/orders/incoming`,
    }),
  ])

  await logActivity({
    userId: session.userId,
    action: 'DISPUTE_RESOLVE',
    target: disputeId,
    meta: { outcome, orderId: dispute.orderId },
  })

  revalidatePath(`/admin/disputes/${disputeId}`)
  revalidatePath('/admin/disputes')
  revalidatePath(`/dashboard/orders/${dispute.orderId}`)
  return {}
}

export async function getDisputes(filter?: 'OPEN' | 'CONFIRMED' | 'REJECTED') {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return []

  return prisma.dispute.findMany({
    where: filter ? { status: filter } : undefined,
    include: {
      order: {
        include: {
          service: { select: { title: true } },
          buyer: { select: { name: true, email: true } },
        },
      },
      openedBy: { select: { name: true, email: true } },
      files: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getDispute(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null

  return prisma.dispute.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          service: {
            include: {
              seller: { select: { id: true, name: true, email: true, phone: true, companyName: true } },
            },
          },
          buyer: { select: { id: true, name: true, email: true, phone: true } },
          logs: { orderBy: { createdAt: 'asc' } },
          disputeConversation: {
            include: {
              messages: {
                include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      },
      openedBy: { select: { id: true, name: true, email: true } },
      resolvedBy: { select: { id: true, name: true } },
      files: true,
    },
  })
}

