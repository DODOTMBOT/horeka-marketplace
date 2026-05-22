import { notFound, redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getCategories } from '@/actions/services'
import type { ServicePackage } from '@/actions/services'
import { getPackageTiers, getPriceUnits } from '@/lib/siteConfig'
import EditServiceForm from './EditServiceForm'

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, service, categories, packageTiers, priceUnits] = await Promise.all([
    getSession(),
    prisma.service.findUnique({ where: { id } }),
    getCategories(),
    getPackageTiers(),
    getPriceUnits(),
  ])

  if (!session) redirect('/login')
  if (!service || service.sellerId !== session.userId) notFound()

  const serviceData = {
    id: service.id,
    title: service.title,
    description: service.description,
    price: Number(service.price),
    priceUnit: service.priceUnit,
    status: service.status,
    images: service.images,
    tags: service.tags,
    packages: service.packages as ServicePackage[] | null,
    categoryId: service.categoryId,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active="services" />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            Редактировать услугу
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{service.title}</p>
        </div>
        <EditServiceForm service={serviceData} categories={categories} packageTiers={packageTiers} priceUnits={priceUnits} />
      </div>
    </div>
  )
}
