'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import { RegisterSchema, LoginSchema } from '@/lib/definitions'
import type { RegisterFormState, LoginFormState } from '@/lib/definitions'
import type { UserRole } from '@prisma/client'
import { logActivity } from '@/lib/activity'

export async function register(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    role: formData.get('role'),
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, phone, password, role } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { errors: { email: ['Пользователь с таким email уже зарегистрирован'] } }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone: phone || null,
      role: role as UserRole,
    },
  })

  await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role })
  await logActivity({ userId: user.id, action: 'REGISTER', meta: { email, role } })

  redirect('/dashboard')
}

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { errors: { general: ['Неверный email или пароль'] } }
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return { errors: { general: ['Неверный email или пароль'] } }
  }

  await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role })
  await logActivity({ userId: user.id, action: 'LOGIN', meta: { email } })

  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/')
}
