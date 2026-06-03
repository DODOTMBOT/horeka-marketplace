'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from './notifications'
import { logActivity } from '@/lib/activity'
import { OrderStatus } from '@prisma/client'

export type CreateOrderState = {
  error?: string
  success?: boolean
  orderId?: string
}

async function writeOrderLog(opts: {
  orderId: string
  userId?: string
  fromStatus?: OrderStatus
  toStatus: OrderStatus
  note?: string
}) {
  await prisma.orderLog.create({
    data: {
      orderId: opts.orderId,
      userId: opts.userId ?? null,
      fromStatus: opts.fromStatus ?? null,
      toStatus: opts.toStatus,
      note: opts.note ?? null,
    },
  })
}

export async function createOrder(
  _prev: CreateOrderState,
  formData: FormData
): Promise<CreateOrderState> {
  const session = await getSession()
  if (!session) return { error: 'Войдите в аккаунт' }
  if (session.role === 'SELLER') return { error: 'Исполнители не могут создавать заказы' }

  const serviceId = formData.get('serviceId') as string
  const comment = (formData.get('comment') as string) || ''
  const packageTier = formData.get('packageTier') as string | null
  const priceRaw = formData.get('price') as string

  if (!serviceId) return { error: 'Услуга не указана' }

  const service = await prisma.service.findUnique({
    where: { id: serviceId, status: 'ACTIVE' },
  })
  if (!service) return { error: 'Услуга не найдена' }
  if (service.sellerId === session.userId) return { error: 'Нельзя заказать собственную услугу' }

  let price = Number(service.price)
  if (priceRaw && !isNaN(Number(priceRaw))) price = Number(priceRaw)

  const order = await prisma.order.create({
    data: {
      buyerId: session.userId,
      serviceId,
      price,
      comment: [comment, packageTier ? `Пакет: ${packageTier}` : ''].filter(Boolean).join('\n') || null,
    },
    include: { service: { include: { seller: true } } },
  })

  await writeOrderLog({ orderId: order.id, userId: session.userId, toStatus: 'PENDING', note: 'Заказ создан' })

  await createNotification({
    userId: order.service.sellerId,
    type: 'ORDER_NEW',
    title: 'Новый заказ',
    body: `Поступил новый заказ на услугу "${order.service.title}"`,
    link: `/dashboard/orders/incoming`,
  })
  await logActivity({ userId: session.userId, action: 'ORDER_CREATE', target: order.id, meta: { serviceId, serviceTitle: order.service.title } })

  revalidatePath('/dashboard/orders')
  redirect(`/dashboard/orders/${order.id}`)
}

export async function startWork(orderId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: true },
  })
  if (!order) return { error: 'Заказ не найден' }
  if (order.service.sellerId !== session.userId) return { error: 'Нет доступа' }
  if (order.status !== 'ACTIVE') return { error: 'Заказ не в нужном статусе' }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'IN_PROGRESS', workStartedAt: new Date() },
  })

  await writeOrderLog({ orderId, userId: session.userId, fromStatus: 'ACTIVE', toStatus: 'IN_PROGRESS', note: 'Исполнитель начал работу' })

  await createNotification({
    userId: order.buyerId,
    type: 'ORDER_STATUS',
    title: 'Исполнитель начал работу',
    body: `По заказу "${order.service.title}" исполнитель приступил к выполнению`,
    link: `/dashboard/orders/${orderId}`,
  })

  await logActivity({ userId: session.userId, action: 'ORDER_STATUS', target: orderId, meta: { status: 'IN_PROGRESS' } })

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders/incoming')
  return {}
}

export async function completeWork(orderId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: true },
  })
  if (!order) return { error: 'Заказ не найден' }
  if (order.service.sellerId !== session.userId) return { error: 'Нет доступа' }
  if (order.status !== 'IN_PROGRESS') return { error: 'Заказ не в работе' }

  const now = new Date()
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED', completedAt: now },
  })

  await writeOrderLog({ orderId, userId: session.userId, fromStatus: 'IN_PROGRESS', toStatus: 'COMPLETED', note: 'Исполнитель отметил заказ выполненным' })

  await createNotification({
    userId: order.buyerId,
    type: 'ORDER_STATUS',
    title: 'Заказ выполнен',
    body: `Исполнитель завершил работу по заказу "${order.service.title}". Пожалуйста, оставьте отзыв.`,
    link: `/dashboard/orders/${orderId}`,
  })

  await logActivity({ userId: session.userId, action: 'ORDER_STATUS', target: orderId, meta: { status: 'COMPLETED' } })

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders/incoming')
  return {}
}

export async function getMyOrders() {
  const session = await getSession()
  if (!session) return []

  return prisma.order.findMany({
    where: { buyerId: session.userId },
    include: {
      service: {
        include: {
          category: true,
          seller: { select: { id: true, name: true, avatarUrl: true, companyName: true } },
        },
      },
      review: true,
      dispute: { select: { status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getIncomingOrders() {
  const session = await getSession()
  if (!session) return []

  return prisma.order.findMany({
    where: { service: { sellerId: session.userId } },
    include: {
      service: { include: { category: true } },
      buyer: { select: { id: true, name: true, avatarUrl: true, phone: true } },
      review: true,
      dispute: { select: { status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrder(id: string) {
  const session = await getSession()
  if (!session) return null

  return prisma.order.findUnique({
    where: { id },
    include: {
      service: {
        include: {
          category: true,
          seller: { select: { id: true, name: true, avatarUrl: true, companyName: true, innVerified: true } },
        },
      },
      buyer: { select: { id: true, name: true, avatarUrl: true, phone: true } },
      review: true,
      dispute: {
        include: {
          files: true,
          openedBy: { select: { id: true, name: true } },
          resolvedBy: { select: { id: true, name: true } },
        },
      },
      logs: { orderBy: { createdAt: 'asc' } },
    },
  })
}

export async function updateOrderStatus(
  orderId: string,
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED',
  disputeReason?: string
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: true },
  })
  if (!order) return { error: 'Заказ не найден' }

  const isSeller = order.service.sellerId === session.userId
  const isBuyer = order.buyerId === session.userId

  if (!isSeller && !isBuyer) return { error: 'Нет доступа' }

  if (isBuyer && !isSeller) {
    if (status === 'CANCELLED' && order.status !== 'PENDING') return { error: 'Нельзя отменить' }
    if (status !== 'CANCELLED') return { error: 'Нельзя изменить статус' }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === 'CANCELLED' ? { completedAt: new Date() } : {}),
    },
  })

  await writeOrderLog({
    orderId,
    userId: session.userId,
    fromStatus: order.status as OrderStatus,
    toStatus: status as OrderStatus,
    note: disputeReason ? `Причина: ${disputeReason}` : undefined,
  })

  const statusLabels: Record<string, string> = {
    ACTIVE: 'принят в работу',
    COMPLETED: 'выполнен',
    CANCELLED: 'отменён',
    DISPUTED: 'оспорен',
  }
  const notifyUserId = isSeller ? order.buyerId : order.service.sellerId
  await createNotification({
    userId: notifyUserId,
    type: 'ORDER_STATUS',
    title: 'Статус заказа изменён',
    body: `Заказ на "${order.service.title}" ${statusLabels[status] ?? status}`,
    link: `/dashboard/orders/${orderId}`,
  })

  await logActivity({
    userId: session.userId,
    action: 'ORDER_STATUS',
    target: orderId,
    meta: { status, serviceTitle: order.service.title },
  })

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath('/dashboard/orders')
  revalidatePath('/dashboard/orders/incoming')
  return {}
}

export async function getDashboardStats() {
  const session = await getSession()
  if (!session) return null

  if (session.role === 'SELLER') {
    const [services, orders, reviews] = await Promise.all([
      prisma.service.count({ where: { sellerId: session.userId, status: 'ACTIVE' } }),
      prisma.order.count({ where: { service: { sellerId: session.userId } } }),
      prisma.review.findMany({
        where: { service: { sellerId: session.userId } },
        select: { rating: true },
      }),
    ])
    const rating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null
    return { services, orders, reviews: reviews.length, rating }
  } else {
    const [orders, reviews, completed, pending] = await Promise.all([
      prisma.order.count({ where: { buyerId: session.userId } }),
      prisma.review.count({ where: { authorId: session.userId } }),
      prisma.order.count({ where: { buyerId: session.userId, status: 'COMPLETED' } }),
      prisma.order.count({ where: { buyerId: session.userId, status: { in: ['PENDING', 'ACTIVE', 'IN_PROGRESS'] } } }),
    ])
    return { services: null, orders, reviews, rating: null, completed, pending }
  }
}
