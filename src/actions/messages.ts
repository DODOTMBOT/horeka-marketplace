'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function getOrCreateConversation(otherUserId: string, serviceId?: string) {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }
  if (session.userId === otherUserId) return { error: 'Нельзя написать себе' }

  // Find existing conversation between these two users about this service
  const existing = await prisma.conversation.findFirst({
    where: {
      ...(serviceId ? { serviceId } : {}),
      participants: {
        every: { userId: { in: [session.userId, otherUserId] } },
      },
    },
    include: { participants: true },
  })

  if (existing && existing.participants.length === 2) {
    return { conversationId: existing.id }
  }

  const conversation = await prisma.conversation.create({
    data: {
      serviceId: serviceId ?? null,
      participants: {
        create: [{ userId: session.userId }, { userId: otherUserId }],
      },
    },
  })

  return { conversationId: conversation.id }
}

export async function sendMessage(conversationId: string, body: string) {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }
  if (!body.trim()) return { error: 'Пустое сообщение' }

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.userId } },
  })
  if (!participant) return { error: 'Нет доступа' }

  const message = await prisma.message.create({
    data: { conversationId, senderId: session.userId, body: body.trim() },
    include: { sender: { select: { name: true } } },
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  // Notify other participants
  const others = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: session.userId } },
  })
  for (const other of others) {
    await createNotification({
      userId: other.userId,
      type: 'MESSAGE_NEW',
      title: 'Новое сообщение',
      body: `${message.sender.name}: ${body.trim().slice(0, 80)}`,
      link: `/dashboard/messages/${conversationId}`,
    })
  }

  revalidatePath(`/dashboard/messages/${conversationId}`)
  return { message }
}

export async function getConversations() {
  const session = await getSession()
  if (!session) return []

  return prisma.conversation.findMany({
    where: { participants: { some: { userId: session.userId } } },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true, companyName: true } } },
      },
      service: { select: { id: true, title: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getConversation(id: string) {
  const session = await getSession()
  if (!session) return null

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.userId } },
  })
  if (!participant) return null

  return prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true, companyName: true } } },
      },
      service: { select: { id: true, title: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}
