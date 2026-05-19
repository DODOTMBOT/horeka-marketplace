import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unit-one.ru'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/catalog`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE_URL}/catalog?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const serviceRoutes: MetadataRoute.Sitemap = services.map(s => ({
    url: `${BASE_URL}/catalog/${s.id}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...serviceRoutes]
}
