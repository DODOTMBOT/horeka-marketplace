'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { uploadFile } from '@/lib/storage'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { logActivity } from '@/lib/activity'

export type ServicePackage = {
  tier: string
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
    return { error: 'Только исполнители могут создавать услуги' }
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
  const fullDescription = (formData.get('fullDescription') as string | null) || null

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

  const format = (formData.get('format') as string) || 'service'
  const brand = (formData.get('brand') as string | null) || null

  // Digital files (only for format=digital)
  const digitalFilesJson = formData.get('digitalFiles') as string | null
  let digitalFiles: { name: string; url: string; size: number }[] | null = null
  if (digitalFilesJson) {
    try { digitalFiles = JSON.parse(digitalFilesJson) } catch { /* ignore */ }
  }

  const created = await prisma.service.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      fullDescription: fullDescription || undefined,
      price: parsed.data.price,
      priceUnit: parsed.data.priceUnit,
      format,
      brand,
      status: parsed.data.status as 'DRAFT' | 'ACTIVE',
      images: imageUrls,
      tags,
      packages: packages ?? undefined,
      digitalFiles: digitalFiles ?? undefined,
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
  return prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, icon: true, slug: true, format: true } })
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
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
  format?: string
  brand?: string
}

const PAGE_SIZE = 12

const SORT_MAP: Record<string, object> = {
  newest:    { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc:{ price: 'desc' },
  popular:   { reviews: { _count: 'desc' } },
}

export async function getServices(filters: ServiceFilters = {}) {
  const { categorySlug, search, minPrice, maxPrice, priceUnit, tag, innVerified, page = 1, sort = 'newest', format, brand } = filters

  const where: Record<string, unknown> = { status: 'ACTIVE' }

  if (format) where.format = format
  if (brand) where.brand = brand
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

  const orderBy = SORT_MAP[sort] ?? SORT_MAP.newest

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        category: true,
        seller: { select: { id: true, name: true, avatarUrl: true, innVerified: true, companyName: true } },
        reviews: { select: { rating: true } },
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.service.count({ where }),
  ])

  return { services, total, pages: Math.ceil(total / PAGE_SIZE) }
}

export async function getTopSellers(limit = 5) {
  const sellers = await prisma.user.findMany({
    where: { role: 'SELLER', services: { some: { status: 'ACTIVE' } } },
    select: {
      id: true, name: true, avatarUrl: true, companyName: true, innVerified: true,
      services: {
        where: { status: 'ACTIVE' },
        select: { id: true, reviews: { select: { rating: true } } },
      },
    },
    take: 30,
  })

  return sellers
    .map(s => {
      const allReviews = s.services.flatMap(svc => svc.reviews)
      const avgRating = allReviews.length
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0
      return { ...s, avgRating, reviewCount: allReviews.length, serviceCount: s.services.length }
    })
    .sort((a, b) => b.reviewCount - a.reviewCount || b.avgRating - a.avgRating)
    .slice(0, limit)
}

export async function getAllTags({ format }: { format?: string } = {}): Promise<{ tag: string; count: number }[]> {
  const rows = format
    ? await prisma.$queryRaw<{ tag: string; count: bigint }[]>`
        SELECT UNNEST(tags) as tag, COUNT(*) as count
        FROM "Service"
        WHERE status = 'ACTIVE' AND format = ${format}
        GROUP BY tag ORDER BY count DESC, tag ASC LIMIT 60
      `
    : await prisma.$queryRaw<{ tag: string; count: bigint }[]>`
        SELECT UNNEST(tags) as tag, COUNT(*) as count
        FROM "Service"
        WHERE status = 'ACTIVE'
        GROUP BY tag ORDER BY count DESC, tag ASC LIMIT 60
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
  return prisma.user.findFirst({
    where: { id },
    select: {
      id: true, name: true, avatarUrl: true, innVerified: true,
      companyName: true, bio: true, portfolioUrls: true, createdAt: true, businessType: true,
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
  const fullDescription = (formData.get('fullDescription') as string | null) || null

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

  const brand = (formData.get('brand') as string | null) || null

  const digitalFilesJson = formData.get('digitalFiles') as string | null
  let digitalFiles: { name: string; url: string; size: number }[] | null = null
  if (digitalFilesJson) {
    try { digitalFiles = JSON.parse(digitalFilesJson) } catch { /* ignore */ }
  }

  await prisma.service.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      fullDescription: fullDescription,
      price: parsed.data.price,
      priceUnit: parsed.data.priceUnit,
      status: parsed.data.status as 'DRAFT' | 'ACTIVE',
      images: imageUrls.length > 0 ? imageUrls : service.images,
      tags,
      packages: packages ?? undefined,
      categoryId: parsed.data.categoryId,
      brand,
      digitalFiles: digitalFiles !== null ? digitalFiles : undefined,
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
