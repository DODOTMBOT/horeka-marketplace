'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { HomepageConfig, PackageTier, CatalogConfig, NavbarConfig } from '@/lib/siteConfig'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') throw new Error('Forbidden')
}

export async function saveHomepageConfig(config: HomepageConfig): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.siteConfig.upsert({
      where: { key: 'homepage' },
      update: { value: config as object },
      create: { key: 'homepage', value: config as object },
    })
    revalidatePath('/')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

export async function saveCatalogConfig(config: CatalogConfig): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.siteConfig.upsert({
      where: { key: 'catalog' },
      update: { value: config as object },
      create: { key: 'catalog', value: config as object },
    })
    revalidatePath('/catalog')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

export async function savePackageTiers(tiers: PackageTier[]): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.siteConfig.upsert({
      where: { key: 'packageTiers' },
      update: { value: tiers as object[] },
      create: { key: 'packageTiers', value: tiers as object[] },
    })
    revalidatePath('/dashboard/services/new')
    revalidatePath('/dashboard/services')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

export async function saveNavbarConfig(config: NavbarConfig): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.siteConfig.upsert({
      where: { key: 'navbar' },
      update: { value: config as object },
      create: { key: 'navbar', value: config as object },
    })
    revalidatePath('/', 'layout')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}

export async function savePriceUnits(units: string[]): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await prisma.siteConfig.upsert({
      where: { key: 'priceUnits' },
      update: { value: units },
      create: { key: 'priceUnits', value: units },
    })
    revalidatePath('/dashboard/services/new')
    revalidatePath('/dashboard/services')
    return {}
  } catch (e) {
    return { error: String(e) }
  }
}
