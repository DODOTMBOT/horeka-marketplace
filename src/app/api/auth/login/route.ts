import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'
import { LoginSchema } from '@/lib/definitions'
import { logActivity } from '@/lib/activity'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ errors: { general: ['Неверный email или пароль'] } }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ errors: { general: ['Неверный email или пароль'] } }, { status: 401 })
    }

    await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role })
    await logActivity({ userId: user.id, action: 'LOGIN', meta: { email } })

    return NextResponse.json({ ok: true, redirect: '/dashboard' })
  } catch (e) {
    console.error('[api/auth/login]', e)
    return NextResponse.json({ errors: { general: ['Ошибка сервера, попробуйте позже'] } }, { status: 500 })
  }
}
