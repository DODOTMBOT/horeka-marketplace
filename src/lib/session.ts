import 'server-only'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from './jwt'
import type { SessionPayload } from './jwt'
import { prisma } from './prisma'
import { redirect } from 'next/navigation'

export type { SessionPayload }
export { encrypt, decrypt }

const COOKIE_NAME = 'horeka_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

export async function createSession(data: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  const session = await encrypt({ ...data, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await decrypt(token)
  if (!payload) return null
  // Check if user is blocked
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { blocked: true } })
  if (user?.blocked) redirect('/blocked')
  return payload
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function refreshSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  const session = await encrypt({ ...payload, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}
