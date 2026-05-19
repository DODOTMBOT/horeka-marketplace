'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { NotificationType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string
  type: NotificationType
  title: string
  body: string
  link?: string
}) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, link },
    include: { user: { select: { email: true } } },
  })

  // Fire-and-forget email
  sendEmail({ to: notification.user.email, subject: title, title, body, link, linkLabel: 'Открыть' })

  return notification
}

export async function getNotifications() {
  const session = await getSession()
  if (!session) return []

  return prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function getUnreadCount(): Promise<number> {
  const session = await getSession()
  if (!session) return 0

  return prisma.notification.count({
    where: { userId: session.userId, read: false },
  })
}

export async function markAllRead() {
  const session = await getSession()
  if (!session) return

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  })
  revalidatePath('/dashboard/notifications')
}

export async function markRead(id: string) {
  const session = await getSession()
  if (!session) return

  await prisma.notification.updateMany({
    where: { id, userId: session.userId },
    data: { read: true },
  })
  revalidatePath('/dashboard/notifications')
}
