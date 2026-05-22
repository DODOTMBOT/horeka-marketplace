'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import { logActivity } from '@/lib/activity'

export type CreateReviewState = {
  error?: string
  success?: boolean
}

export async function createReview(
  _prev: CreateReviewState,
  formData: FormData
): Promise<CreateReviewState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const orderId = formData.get('orderId') as string
  const rating = Number(formData.get('rating'))
  const comment = (formData.get('comment') as string)?.trim()

  if (!orderId) return { error: 'Заказ не указан' }
  if (!rating || rating < 1 || rating > 5) return { error: 'Укажите оценку от 1 до 5' }
  if (!comment || comment.length < 5) return { error: 'Напишите отзыв (минимум 5 символов)' }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  })

  if (!order) return { error: 'Заказ не найден' }
  if (order.buyerId !== session.userId) return { error: 'Нет доступа' }
  if (order.status !== 'COMPLETED') return { error: 'Можно оставить отзыв только по завершённому заказу' }
  if (order.review) return { error: 'Отзыв уже оставлен' }

  const review = await prisma.review.create({
    data: {
      orderId,
      serviceId: order.serviceId,
      authorId: session.userId,
      rating,
      comment,
    },
    include: { service: { include: { seller: true } } },
  })

  await createNotification({
    userId: review.service.sellerId,
    type: 'REVIEW_NEW',
    title: 'Новый отзыв',
    body: `Получен новый отзыв ${rating}★ на услугу "${review.service.title}"`,
    link: `/catalog/${order.serviceId}`,
  })

  await logActivity({ userId: session.userId, action: 'REVIEW_CREATE', target: review.id, meta: { rating, serviceId: order.serviceId } })

  revalidatePath(`/dashboard/orders/${orderId}`)
  revalidatePath(`/catalog/${order.serviceId}`)
  return { success: true }
}

export type ReplyState = { error?: string; success?: boolean }

export async function replyToReview(
  _prev: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const reviewId = formData.get('reviewId') as string
  const reply = (formData.get('reply') as string)?.trim()

  if (!reply || reply.length < 5) return { error: 'Минимум 5 символов' }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { service: true },
  })

  if (!review) return { error: 'Отзыв не найден' }
  if (review.service.sellerId !== session.userId) return { error: 'Нет доступа' }

  await prisma.review.update({
    where: { id: reviewId },
    data: { sellerReply: reply, sellerRepliedAt: new Date() },
  })

  revalidatePath(`/catalog/${review.serviceId}`)
  return { success: true }
}
