'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from './notifications'

export type CreateOrderState = {
  error?: string
  success?: boolean
  orderId?: string
}

export async function createOrder(
  _prev: CreateOrderState,
  formData: FormData
): Promise<CreateOrderState> {
  const session = await getSession()
  if (!session) return { error: 'Войдите в аккаунт' }
  if (session.role === 'SELLER') return { error: 'Поставщики не могут создавать заказы' }

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

  await createNotification({
    userId: order.service.sellerId,
    type: 'ORDER_NEW',
    title: 'Новый заказ',
    body: `Поступил новый заказ на услугу "${order.service.title}"`,
    link: `/dashboard/orders/incoming`,
  })

  revalidatePath('/dashboard/orders')
  redirect(`/dashboard/orders/${order.id}`)
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

  // Buyers can cancel PENDING or open dispute on ACTIVE
  if (isBuyer && !isSeller) {
    if (status === 'CANCELLED' && order.status !== 'PENDING') return { error: 'Нельзя отменить' }
    if (status === 'DISPUTED' && order.status !== 'ACTIVE') return { error: 'Спор можно открыть только по активному заказу' }
    if (status !== 'CANCELLED' && status !== 'DISPUTED') return { error: 'Нельзя изменить статус' }
  }

  let disputeConversationId: string | undefined
  if (status === 'DISPUTED') {
    // Auto-create conversation between buyer and seller for this dispute
    const sellerId = order.service.sellerId
    const existing = await prisma.conversation.findFirst({
      where: {
        serviceId: order.serviceId,
        participants: { every: { userId: { in: [order.buyerId, sellerId] } } },
      },
      include: { participants: true },
    })
    if (existing && existing.participants.length === 2) {
      disputeConversationId = existing.id
    } else {
      const conv = await prisma.conversation.create({
        data: {
          serviceId: order.serviceId,
          participants: { create: [{ userId: order.buyerId }, { userId: sellerId }] },
        },
      })
      disputeConversationId = conv.id
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === 'DISPUTED' ? {
        disputeReason: disputeReason?.trim() || null,
        disputeConversationId,
      } : {}),
    },
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
    const [orders, reviews] = await Promise.all([
      prisma.order.count({ where: { buyerId: session.userId } }),
      prisma.review.count({ where: { authorId: session.userId } }),
    ])
    return { services: null, orders, reviews, rating: null }
  }
}
