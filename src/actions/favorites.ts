'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(serviceId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const existing = await prisma.favorite.findUnique({
    where: { userId_serviceId: { userId: session.userId, serviceId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    revalidatePath('/dashboard/favorites')
    return { favorited: false }
  } else {
    await prisma.favorite.create({ data: { userId: session.userId, serviceId } })
    revalidatePath('/dashboard/favorites')
    return { favorited: true }
  }
}

export async function getFavorites() {
  const session = await getSession()
  if (!session) return []

  return prisma.favorite.findMany({
    where: { userId: session.userId },
    include: {
      service: {
        include: {
          category: true,
          seller: { select: { id: true, name: true, avatarUrl: true, innVerified: true, companyName: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFavoriteIds(): Promise<string[]> {
  const session = await getSession()
  if (!session) return []

  const favs = await prisma.favorite.findMany({
    where: { userId: session.userId },
    select: { serviceId: true },
  })
  return favs.map(f => f.serviceId)
}
