'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@prisma/client'
import { createNotification } from './notifications'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') throw new Error('Forbidden')
  return session
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  await requireAdmin()
  const [
    totalUsers, totalSellers, totalBuyers,
    totalServices, activeServices, draftServices,
    totalOrders, completedOrders, disputedOrders,
    revenue, newUsersRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SELLER' } }),
    prisma.user.count({ where: { role: 'BUYER' } }),
    prisma.service.count(),
    prisma.service.count({ where: { status: 'ACTIVE' } }),
    prisma.service.count({ where: { status: 'DRAFT' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.count({ where: { status: 'DISPUTED' } }),
    prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { price: true } }),
    // New users per day, last 30 days
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY day ORDER BY day ASC
    `,
  ])

  const newUsers = newUsersRaw.map(r => ({
    day: new Date(r.day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    count: Number(r.count),
  }))

  return {
    totalUsers, totalSellers, totalBuyers,
    totalServices, activeServices, draftServices,
    totalOrders, completedOrders, disputedOrders,
    revenue: Number(revenue._sum.price ?? 0),
    newUsers,
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getAdminUsers(search?: string, role?: string) {
  await requireAdmin()
  return prisma.user.findMany({
    where: {
      ...(role && role !== 'ALL' ? { role: role as UserRole } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { inn: { contains: search } },
        ],
      } : {}),
    },
    select: {
      id: true, name: true, email: true, role: true,
      innVerified: true, companyName: true, blocked: true, createdAt: true,
      _count: { select: { services: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

export async function setUserRole(userId: string, role: UserRole): Promise<{ error?: string }> {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/admin/users')
  return {}
}

export async function setUserBlocked(userId: string, blocked: boolean): Promise<{ error?: string }> {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { blocked } })
  revalidatePath('/admin/users')
  return {}
}

export async function setInnVerified(userId: string, innVerified: boolean): Promise<{ error?: string }> {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { innVerified } })
  revalidatePath('/admin/users')
  return {}
}

// ─── Services ────────────────────────────────────────────────────────────────

export async function getAdminServices(status?: string, search?: string) {
  await requireAdmin()
  return prisma.service.findMany({
    where: {
      ...(status && status !== 'ALL' ? { status: status as never } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    },
    include: {
      category: true,
      seller: { select: { id: true, name: true, companyName: true } },
      _count: { select: { orders: true, reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

export async function setServiceStatus(serviceId: string, status: 'ACTIVE' | 'ARCHIVED' | 'PAUSED'): Promise<{ error?: string }> {
  await requireAdmin()
  await prisma.service.update({ where: { id: serviceId }, data: { status } })
  revalidatePath('/admin/services')
  revalidatePath('/catalog')
  return {}
}

export async function adminDeleteService(serviceId: string): Promise<{ error?: string }> {
  await requireAdmin()
  await prisma.service.delete({ where: { id: serviceId } })
  revalidatePath('/admin/services')
  revalidatePath('/catalog')
  return {}
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getAdminOrders(status?: string) {
  await requireAdmin()
  return prisma.order.findMany({
    where: status && status !== 'ALL' ? { status: status as never } : {},
    include: {
      service: {
        select: {
          id: true, title: true,
          seller: { select: { id: true, name: true, email: true } },
        },
      },
      buyer: { select: { id: true, name: true, email: true } },
      disputeConversation: {
        include: {
          messages: {
            include: { sender: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}

export async function resolveDispute(orderId: string, resolution: 'COMPLETED' | 'CANCELLED'): Promise<{ error?: string }> {
  await requireAdmin()
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { service: { include: { seller: true } }, buyer: true },
  })
  if (!order || order.status !== 'DISPUTED') return { error: 'Заказ не в статусе спора' }

  await prisma.order.update({ where: { id: orderId }, data: { status: resolution } })

  const label = resolution === 'COMPLETED' ? 'завершён в пользу продавца' : 'отменён в пользу покупателя'
  const link = `/dashboard/orders/${orderId}`

  await Promise.all([
    createNotification({
      userId: order.buyerId,
      type: 'ORDER_STATUS',
      title: 'Спор разрешён',
      body: `Спор по заказу «${order.service.title}» ${label}`,
      link,
    }),
    createNotification({
      userId: order.service.sellerId,
      type: 'ORDER_STATUS',
      title: 'Спор разрешён',
      body: `Спор по заказу «${order.service.title}» ${label}`,
      link,
    }),
  ])

  revalidatePath('/admin/orders')
  revalidatePath(link)
  return {}
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getAdminReviews() {
  await requireAdmin()
  return prisma.review.findMany({
    include: {
      author: { select: { id: true, name: true } },
      service: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}

export async function adminDeleteReview(reviewId: string): Promise<{ error?: string }> {
  await requireAdmin()
  await prisma.review.delete({ where: { id: reviewId } })
  revalidatePath('/admin/reviews')
  return {}
}
