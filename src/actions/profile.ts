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
      portfolioUrls: true, createdAt: true,
    },
  })
}
