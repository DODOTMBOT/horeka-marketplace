import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import { headers } from 'next/headers'

export type ActivityAction =
  | 'LOGIN' | 'LOGOUT' | 'REGISTER'
  | 'SERVICE_CREATE' | 'SERVICE_EDIT' | 'SERVICE_DELETE' | 'SERVICE_VIEW'
  | 'ORDER_CREATE' | 'ORDER_STATUS' | 'ORDER_DISPUTE'
  | 'REVIEW_CREATE' | 'REVIEW_DELETE'
  | 'MESSAGE_SEND'
  | 'PROFILE_UPDATE' | 'INN_VERIFY'
  | 'FAVORITE_ADD' | 'FAVORITE_REMOVE'
  | 'ADMIN_BLOCK_USER' | 'ADMIN_SET_ROLE' | 'ADMIN_DELETE_REVIEW' | 'ADMIN_RESOLVE_DISPUTE' | 'ADMIN_INN_VERIFY'

export async function logActivity({
  userId,
  action,
  target,
  meta,
}: {
  userId?: string
  action: ActivityAction
  target?: string
  meta?: Record<string, unknown>
}) {
  try {
    const hdrs = await headers()
    const ip =
      hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      hdrs.get('x-real-ip') ??
      'unknown'

    await prisma.activityLog.create({
      data: {
        userId: userId ?? null,
        action,
        target: target ?? null,
        meta: meta ? (meta as Prisma.InputJsonValue) : Prisma.JsonNull,
        ip,
      },
    })
  } catch {
    // never throw — logging must not break the main flow
  }
}
