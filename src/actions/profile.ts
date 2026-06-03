'use server'

import { prisma } from '@/lib/prisma'
import { getSession, createSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ProfileSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа').max(100),
  phone: z.string().regex(/^[\d\s\-+()]{7,20}$/, 'Некорректный номер').optional().or(z.literal('')),
  bio: z.string().max(500, 'Максимум 500 символов').optional().or(z.literal('')),
})

export type UpdateProfileState = {
  errors?: Record<string, string[]>
  error?: string
  success?: boolean
}

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const parsed = ProfileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    bio: formData.get('bio'),
  })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  // Avatar is pre-uploaded on client — comes as URL string
  const avatarUrlRaw = (formData.get('avatarUrl') as string | null)?.trim()
  const avatarUrl = avatarUrlRaw && avatarUrlRaw.startsWith('/') ? avatarUrlRaw : undefined

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  })

  // Refresh JWT so Navbar shows updated name immediately
  await createSession({ userId: session.userId, email: session.email, name: parsed.data.name, role: session.role })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  return { success: true }
}

export type PortfolioState = { error?: string; success?: boolean }

export async function addPortfolioImage(url: string): Promise<PortfolioState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }
  if (session.role !== 'SELLER') return { error: 'Только для исполнителей' }
  if (!url.startsWith('/')) return { error: 'Некорректный URL' }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { portfolioUrls: true } })
  if (!user) return { error: 'Пользователь не найден' }
  if (user.portfolioUrls.length >= 12) return { error: 'Максимум 12 изображений' }

  await prisma.user.update({
    where: { id: session.userId },
    data: { portfolioUrls: { push: url } },
  })

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function removePortfolioImage(url: string): Promise<PortfolioState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { portfolioUrls: true } })
  if (!user) return { error: 'Не найден' }

  await prisma.user.update({
    where: { id: session.userId },
    data: { portfolioUrls: user.portfolioUrls.filter(u => u !== url) },
  })

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function getProfileData() {
  const session = await getSession()
  if (!session) return null

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, avatarUrl: true, bio: true,
      inn: true, innVerified: true, companyName: true,
      businessType: true, ogrn: true, kpp: true, legalAddress: true,
      bankAccount: true, bankBik: true, bankName: true, bankCorrAccount: true,
      portfolioUrls: true, createdAt: true,
    },
  })
}

export type BecomeSellerState = {
  errors?: Record<string, string[]>
  error?: string
  success?: boolean
}

export async function becomeSeller(
  _prev: BecomeSellerState,
  formData: FormData
): Promise<BecomeSellerState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }
  if (session.role === 'SELLER' || session.role === 'ADMIN') return { error: 'Вы уже исполнитель' }

  const bizType = formData.get('businessType') as string
  const inn = (formData.get('inn') as string)?.trim()
  const companyName = (formData.get('companyName') as string)?.trim() || null
  const ogrn = (formData.get('ogrn') as string)?.trim() || null
  const kpp = (formData.get('kpp') as string)?.trim() || null
  const legalAddress = (formData.get('legalAddress') as string)?.trim() || null
  const bankAccount = (formData.get('bankAccount') as string)?.trim()
  const bankBik = (formData.get('bankBik') as string)?.trim()
  const bankName = (formData.get('bankName') as string)?.trim() || null
  const bankCorrAccount = (formData.get('bankCorrAccount') as string)?.trim() || null

  const errors: Record<string, string[]> = {}
  if (!['SELF_EMPLOYED', 'IP', 'COMPANY'].includes(bizType)) errors.businessType = ['Выберите тип бизнеса']
  if (!inn || inn.length < 10) errors.inn = ['Введите ИНН (10 или 12 цифр)']
  if (!bankAccount || bankAccount.length !== 20) errors.bankAccount = ['Расчётный счёт — 20 цифр']
  if (!bankBik || bankBik.length !== 9) errors.bankBik = ['БИК — 9 цифр']
  if (Object.keys(errors).length) return { errors }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      role: 'SELLER',
      businessType: bizType as 'SELF_EMPLOYED' | 'IP' | 'COMPANY',
      inn, companyName, ogrn, kpp, legalAddress,
      bankAccount, bankBik, bankName, bankCorrAccount,
    },
  })

  await createSession({ userId: session.userId, email: session.email, name: session.name, role: 'SELLER' })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  return { success: true }
}
