'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { uploadFile } from '@/lib/storage'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { logActivity } from '@/lib/activity'

export type ServicePackage = {
  tier: 'basic' | 'standard' | 'premium'
  name: string
  description: string
  price: number
  deliveryDays: number
}

const ServiceSchema = z.object({
  title: z.string().min(5, 'Минимум 5 символов').max(120, 'Максимум 120 символов'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  description: z.string().min(20, 'Минимум 20 символов'),
  price: z.coerce.number().positive('Укажите цену'),
  priceUnit: z.string().default('разово'),
  tags: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
})

export type CreateServiceState = {
  errors?: Record<string, string[]>
  error?: string
  success?: boolean
}

export async function createService(
  _prev: CreateServiceState,
  formData: FormData
): Promise<CreateServiceState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }
  if (session.role !== 'SELLER' && session.role !== 'ADMIN') {
    return { error: 'Только поставщики могут создавать услуги' }
  }

  const raw = {
    title: formData.get('title'),
    categoryId: formData.get('categoryId'),
    description: formData.get('description'),
    price: formData.get('price'),
    priceUnit: formData.get('priceUnit') || 'разово',
    tags: formData.get('tags'),
    status: formData.get('status') || 'DRAFT',
  }

  const parsed = ServiceSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // Collect pre-uploaded image URLs from hidden inputs
  const imageUrls: string[] = []
  let i = 0
  while (true) {
    const url = formData.get(`imageUrl_${i}`) as string | null
    if (!url) break
    imageUrls.push(url)
    i++
  }
  // Also handle direct file uploads if any
  const imageFiles = formData.getAll('images') as File[]
  for (const file of imageFiles) {
    if (!(file instanceof File) || file.size === 0) continue
    const { url } = await uploadFile(file, 'services', session.userId)
    imageUrls.push(url)
  }

  // Parse packages
  const packagesJson = formData.get('packages') as string | null
  let packages: ServicePackage[] | null = null
  if (packagesJson) {
    try { packages = JSON.parse(packagesJson) } catch { /* ignore */ }
  }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const created = await prisma.service.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      priceUnit: parsed.data.priceUnit,
      status: parsed.data.status as 'DRAFT' | 'ACTIVE',
      images: imageUrls,
      tags,
      packages: packages ?? undefined,
      categoryId: parsed.data.categoryId,
      sellerId: session.userId,
    },
  })

  await logActivity({ userId: session.userId, action: 'SERVICE_CREATE', target: created.id, meta: { title: parsed.data.title } })

  revalidatePath('/catalog')
  revalidatePath('/dashboard')
  redirect('/dashboard/services')
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export type ServiceFilters = {
  categorySlug?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  priceUnit?: string
  tag?: string
  innVerified?: boolean
  page?: number
}

const PAGE_SIZE = 12

export async function getServices(filters: ServiceFilters = {}) {
  const { categorySlug, search, minPrice, maxPrice, priceUnit, tag, innVerified, page = 1 } = filters

  const where: Record<string, unknown> = { status: 'ACTIVE' }

  if (categorySlug) where.category = { slug: categorySlug }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ]
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) (where.price as Record<string, unknown>).gte = minPrice
    if (maxPrice !== undefined) (where.price as Record<string, unknown>).lte = maxPrice
  }

  if (priceUnit) where.priceUnit = priceUnit
  if (tag) where.tags = { has: tag }
  if (innVerified) where.seller = { innVerified: true }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        category: true,
        seller: { select: { id: true, name: true, avatarUrl: true, innVerified: true, companyName: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.service.count({ where }),
  ])

  return { services, total, pages: Math.ceil(total / PAGE_SIZE) }
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const rows = await prisma.$queryRaw<{ tag: string; count: bigint }[]>`
    SELECT UNNEST(tags) as tag, COUNT(*) as count
    FROM "Service"
    WHERE status = 'ACTIVE'
    GROUP BY tag
    ORDER BY count DESC, tag ASC
    LIMIT 60
  `
  return rows.map(r => ({ tag: r.tag, count: Number(r.count) }))
}

export async function getService(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      seller: {
        select: {
          id: true, name: true, avatarUrl: true, innVerified: true,
          companyName: true, bio: true, createdAt: true,
          services: { where: { status: 'ACTIVE' }, select: { id: true } },
          reviews: { select: { rating: true } },
        },
      },
      reviews: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
}

export async function getSellerProfile(id: string) {
  return prisma.user.findUnique({
    where: { id, role: 'SELLER' },
    select: {
      id: true, name: true, avatarUrl: true, innVerified: true,
      companyName: true, bio: true, portfolioUrls: true, createdAt: true,
      services: {
        where: { status: 'ACTIVE' },
        include: {
          category: true,
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function getMyServices() {
  const session = await getSession()
  if (!session) return []

  return prisma.service.findMany({
    where: { sellerId: session.userId },
    include: { category: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateService(
  _prev: CreateServiceState,
  formData: FormData
): Promise<CreateServiceState> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const id = formData.get('id') as string
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service || service.sellerId !== session.userId) return { error: 'Нет доступа' }

  const raw = {
    title: formData.get('title'),
    categoryId: formData.get('categoryId'),
    description: formData.get('description'),
    price: formData.get('price'),
    priceUnit: formData.get('priceUnit') || 'разово',
    tags: formData.get('tags'),
    status: formData.get('status') || 'DRAFT',
  }

  const parsed = ServiceSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const imageUrls: string[] = []
  let i = 0
  while (true) {
    const url = formData.get(`imageUrl_${i}`) as string | null
    if (!url) break
    imageUrls.push(url)
    i++
  }

  const packagesJson = formData.get('packages') as string | null
  let packages: ServicePackage[] | null = null
  if (packagesJson) {
    try { packages = JSON.parse(packagesJson) } catch { /* ignore */ }
  }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(',').map(t => t.trim()).filter(Boolean)
    : []

  await prisma.service.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      priceUnit: parsed.data.priceUnit,
      status: parsed.data.status as 'DRAFT' | 'ACTIVE',
      images: imageUrls.length > 0 ? imageUrls : service.images,
      tags,
      packages: packages ?? undefined,
      categoryId: parsed.data.categoryId,
    },
  })

  await logActivity({ userId: session.userId, action: 'SERVICE_EDIT', target: id, meta: { title: parsed.data.title } })

  revalidatePath('/catalog')
  revalidatePath(`/catalog/${id}`)
  revalidatePath('/dashboard/services')
  redirect('/dashboard/services')
}

export async function deleteService(id: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'Не авторизован' }

  const service = await prisma.service.findUnique({ where: { id } })
  if (!service || service.sellerId !== session.userId) return { error: 'Нет доступа' }

  await prisma.service.delete({ where: { id } })
  await logActivity({ userId: session.userId, action: 'SERVICE_DELETE', target: id, meta: { title: service.title } })
  revalidatePath('/dashboard/services')
  revalidatePath('/catalog')
  return {}
}
