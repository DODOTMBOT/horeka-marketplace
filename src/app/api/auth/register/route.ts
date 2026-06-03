import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'
import { RegisterSchema } from '@/lib/definitions'
import type { UserRole } from '@prisma/client'
import { logActivity } from '@/lib/activity'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const { name, email, phone, password, role, businessType, companyName, inn,
            ogrn, kpp, legalAddress, bankAccount, bankBik, bankName, bankCorrAccount } = parsed.data

    if (role === 'SELLER') {
      if (!businessType) return NextResponse.json({ errors: { businessType: ['Выберите тип бизнеса'] } }, { status: 422 })
      if (!inn) return NextResponse.json({ errors: { inn: ['ИНН обязателен для исполнителей'] } }, { status: 422 })
      if (!bankAccount) return NextResponse.json({ errors: { bankAccount: ['Укажите расчётный счёт'] } }, { status: 422 })
      if (!bankBik) return NextResponse.json({ errors: { bankBik: ['Укажите БИК банка'] } }, { status: 422 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ errors: { email: ['Пользователь с таким email уже зарегистрирован'] } }, { status: 422 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        role: role as UserRole,
        ...(role === 'SELLER' && {
          businessType: (businessType || undefined) as any,
          companyName: companyName || null,
          inn: inn || null,
          ogrn: ogrn || null,
          kpp: kpp || null,
          legalAddress: legalAddress || null,
          bankAccount: bankAccount || null,
          bankBik: bankBik || null,
          bankName: bankName || null,
          bankCorrAccount: bankCorrAccount || null,
        }),
      },
    })

    await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role })
    await logActivity({ userId: user.id, action: 'REGISTER', meta: { email, role } })

    return NextResponse.json({ ok: true, redirect: '/dashboard' })
  } catch (e) {
    console.error('[api/auth/register]', e)
    return NextResponse.json({ errors: { general: ['Ошибка сервера, попробуйте позже'] } }, { status: 500 })
  }
}
