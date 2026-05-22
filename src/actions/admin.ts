'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@prisma/client'
import { createNotification } from './notifications'
import { logActivity } from '@/lib/activity'

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
  const admin = await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role } })
  await logActivity({ userId: admin.userId, action: 'ADMIN_SET_ROLE', target: userId, meta: { role } })
  revalidatePath('/admin/users')
  return {}
}

export async function setUserBlocked(userId: string, blocked: boolean): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { blocked } })
  await logActivity({ userId: admin.userId, action: 'ADMIN_BLOCK_USER', target: userId, meta: { blocked } })
  revalidatePath('/admin/users')
  return {}
}

export async function setInnVerified(userId: string, innVerified: boolean): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { innVerified } })
  await logActivity({ userId: admin.userId, action: 'ADMIN_INN_VERIFY', target: userId, meta: { innVerified } })
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

  const admin = await getSession()
  await logActivity({ userId: admin?.userId, action: 'ADMIN_RESOLVE_DISPUTE', target: orderId, meta: { resolution, serviceTitle: order.service.title } })

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
  const admin = await requireAdmin()
  await prisma.review.delete({ where: { id: reviewId } })
  await logActivity({ userId: admin.userId, action: 'ADMIN_DELETE_REVIEW', target: reviewId })
  revalidatePath('/admin/reviews')
  return {}
}

// ─── Activity Logs ───────────────────────────────────────────────────────────

export async function getAdminLogs({
  userId,
  action,
  page = 1,
}: { userId?: string; action?: string; page?: number } = {}) {
  await requireAdmin()
  const PAGE = 50
  const where = {
    ...(userId ? { userId } : {}),
    ...(action && action !== 'ALL' ? { action } : {}),
  }
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    prisma.activityLog.count({ where }),
  ])
  return { logs, total, pages: Math.ceil(total / PAGE) }
}

// ─── Multi-accounts ──────────────────────────────────────────────────────────

export async function getAdminMultiAccounts() {
  await requireAdmin()

  // Find IPs that have 2+ distinct users in activity logs
  const rows = await prisma.$queryRaw<{ ip: string; userIds: string[] }[]>`
    SELECT ip, array_agg(DISTINCT "userId") AS "userIds"
    FROM "ActivityLog"
    WHERE ip IS NOT NULL
      AND ip != 'unknown'
      AND "userId" IS NOT NULL
    GROUP BY ip
    HAVING COUNT(DISTINCT "userId") >= 2
    ORDER BY COUNT(DISTINCT "userId") DESC
    LIMIT 200
  `

  if (!rows.length) return []

  const allUserIds = [...new Set(rows.flatMap(r => r.userIds))]

  const users = await prisma.user.findMany({
    where: { id: { in: allUserIds } },
    select: {
      id: true, name: true, email: true, role: true, blocked: true, createdAt: true,
      _count: { select: { orders: true, services: true } },
    },
  })

  const userMap = new Map(users.map(u => [u.id, u]))

  // Get last seen per user per ip from logs
  const lastSeen = await prisma.$queryRaw<{ ip: string; userId: string; lastSeen: Date }[]>`
    SELECT ip, "userId", MAX("createdAt") AS "lastSeen"
    FROM "ActivityLog"
    WHERE ip = ANY(${rows.map(r => r.ip)}::text[])
      AND "userId" = ANY(${allUserIds}::text[])
    GROUP BY ip, "userId"
  `
  const lastSeenMap = new Map(lastSeen.map(r => [`${r.ip}:${r.userId}`, r.lastSeen]))

  return rows.map(row => ({
    ip: row.ip,
    accounts: row.userIds
      .map(id => {
        const u = userMap.get(id)
        if (!u) return null
        return { ...u, lastSeen: lastSeenMap.get(`${row.ip}:${id}`) ?? null }
      })
      .filter(Boolean)
      .sort((a, b) => (a!.blocked === b!.blocked ? 0 : a!.blocked ? 1 : -1)),
  }))
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getAdminCategories() {
  await requireAdmin()
  return prisma.category.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: { name: 'asc' },
  })
}

export async function createCategory(_prev: { error?: string; success?: boolean }, formData: FormData) {
  await requireAdmin()
  const name = (formData.get('name') as string)?.trim()
  const icon = (formData.get('icon') as string)?.trim() || '📦'
  const format = (formData.get('format') as string)?.trim() || 'service'
  if (!name || name.length < 2) return { error: 'Минимум 2 символа' }
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zа-яё0-9-]/gi, '')
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) return { error: 'Категория с таким slug уже существует' }
  await prisma.category.create({ data: { name, icon, slug, format } })
  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
}

export async function updateCategory(_prev: { error?: string; success?: boolean }, formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const icon = (formData.get('icon') as string)?.trim()
  const format = (formData.get('format') as string)?.trim() || 'service'
  if (!name || name.length < 2) return { error: 'Минимум 2 символа' }
  await prisma.category.update({ where: { id }, data: { name, icon, format } })
  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  await requireAdmin()
  const count = await prisma.service.count({ where: { categoryId: id } })
  if (count > 0) return { error: `Нельзя удалить — в категории ${count} услуг` }
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
  revalidatePath('/')
  return {}
}

// ─── Moderation ──────────────────────────────────────────────────────────────

export async function getAdminModeration() {
  await requireAdmin()
  return prisma.service.findMany({
    where: { status: 'DRAFT' },
    include: {
      category: true,
      seller: { select: { id: true, name: true, email: true, companyName: true, innVerified: true } },
      _count: { select: { orders: true, reviews: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function approveService(serviceId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { seller: true },
  })
  if (!service) return { error: 'Услуга не найдена' }
  await prisma.service.update({ where: { id: serviceId }, data: { status: 'ACTIVE' } })
  await createNotification({
    userId: service.sellerId,
    type: 'ORDER_STATUS',
    title: 'Услуга опубликована',
    body: `Ваша услуга «${service.title}» прошла модерацию и теперь видна в каталоге`,
    link: `/catalog/${serviceId}`,
  })
  await logActivity({ userId: admin.userId, action: 'SERVICE_EDIT', target: serviceId, meta: { action: 'approve', title: service.title } })
  revalidatePath('/admin/moderation')
  revalidatePath('/catalog')
  return {}
}

export async function rejectService(serviceId: string, reason?: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const service = await prisma.service.findUnique({ where: { id: serviceId }, include: { seller: true } })
  if (!service) return { error: 'Услуга не найдена' }
  await prisma.service.update({ where: { id: serviceId }, data: { status: 'ARCHIVED' } })
  await createNotification({
    userId: service.sellerId,
    type: 'ORDER_STATUS',
    title: 'Услуга отклонена',
    body: reason
      ? `Услуга «${service.title}» отклонена: ${reason}`
      : `Услуга «${service.title}» отклонена модератором. Исправьте и отправьте снова.`,
    link: `/dashboard/services`,
  })
  await logActivity({ userId: admin.userId, action: 'SERVICE_EDIT', target: serviceId, meta: { action: 'reject', reason } })
  revalidatePath('/admin/moderation')
  return {}
}

// ─── User Detail ─────────────────────────────────────────────────────────────

export async function getAdminUserDetail(userId: string) {
  await requireAdmin()
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      services: {
        include: { category: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      orders: {
        include: { service: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      reviews: {
        include: { service: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
      _count: { select: { services: true, orders: true, reviews: true } },
    },
  })
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export async function getAdminFinance() {
  await requireAdmin()
  const [totalRevenue, completedOrders, avgOrder, topSellers, byDay] = await Promise.all([
    prisma.order.aggregate({ _sum: { price: true }, where: { status: 'COMPLETED' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.aggregate({ _avg: { price: true }, where: { status: 'COMPLETED' } }),
    prisma.order.groupBy({
      by: ['serviceId'],
      where: { status: 'COMPLETED' },
      _sum: { price: true },
      _count: true,
      orderBy: { _sum: { price: 'desc' } },
      take: 5,
    }),
    prisma.$queryRaw<{ day: Date; revenue: number; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") as day,
             SUM(price)::float as revenue,
             COUNT(*) as count
      FROM "Order"
      WHERE status = 'COMPLETED'
        AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY 1 ORDER BY 1
    `,
  ])

  const serviceIds = topSellers.map(t => t.serviceId)
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    include: { seller: { select: { id: true, name: true, companyName: true } } },
  })

  const topWithNames = topSellers.map(t => ({
    ...t,
    service: services.find(s => s.id === t.serviceId),
  }))

  return {
    totalRevenue: Number(totalRevenue._sum.price ?? 0),
    completedOrders,
    avgOrder: Number(avgOrder._avg.price ?? 0),
    topSellers: topWithNames,
    byDay: byDay.map(d => ({ day: d.day, revenue: d.revenue, count: Number(d.count) })),
  }
}

// ─── Send Notification ───────────────────────────────────────────────────────

export async function sendAdminNotification(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const admin = await requireAdmin()
  const title = (formData.get('title') as string)?.trim()
  const body = (formData.get('body') as string)?.trim()
  const target = formData.get('target') as string // userId or 'ALL'

  if (!title || !body) return { error: 'Заголовок и текст обязательны' }

  if (target === 'ALL') {
    const users = await prisma.user.findMany({ select: { id: true } })
    await Promise.all(users.map(u => createNotification({ userId: u.id, type: 'ORDER_STATUS', title, body })))
    await logActivity({ userId: admin.userId, action: 'ADMIN_BLOCK_USER', target: 'ALL', meta: { notif: title } })
  } else {
    await createNotification({ userId: target, type: 'ORDER_STATUS', title, body })
  }

  return { success: true }
}

export async function getAdminUsers2() {
  await requireAdmin()
  return prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } })
}

// ─── Payouts ─────────────────────────────────────────────────────────────────

export async function getAdminPayouts() {
  await requireAdmin()

  const [pending, done] = await Promise.all([
    prisma.order.findMany({
      where: { paid: true, sellerPaid: false },
      include: {
        service: { include: { seller: { select: { id: true, name: true, companyName: true, phone: true, email: true } } } },
        buyer: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { sellerPaid: true },
      include: {
        service: { include: { seller: { select: { id: true, name: true, companyName: true } } } },
        buyer: { select: { id: true, name: true } },
      },
      orderBy: { sellerPaidAt: 'desc' },
      take: 50,
    }),
  ])

  const pendingTotal = pending.reduce((s, o) => s + Number(o.price), 0)

  return { pending, done, pendingTotal }
}

export async function markSellerPaid(orderId: string): Promise<{ error?: string }> {
  await requireAdmin()
  await prisma.order.update({
    where: { id: orderId },
    data: { sellerPaid: true, sellerPaidAt: new Date() },
  })
  revalidatePath('/admin/payouts')
  return {}
}
