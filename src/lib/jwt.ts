import { jwtVerify, SignJWT } from 'jose'
import type { UserRole } from '@prisma/client'

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: UserRole
  expiresAt: Date
}

const getKey = () => new TextEncoder().encode(process.env.SESSION_SECRET)

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getKey())
}
