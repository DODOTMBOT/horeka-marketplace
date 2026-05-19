import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getMyServices } from '@/actions/services'
import DashboardNav from '@/components/DashboardNav'

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:  { label: 'Активна',        color: '#16a34a', bg: '#f0fdf4' },
  DRAFT:   { label: 'Черновик',        color: '#64748b', bg: '#f1f5f9' },
  PAUSED:  { label: 'Приостановлена',  color: '#d97706', bg: '#fffbeb' },
  ARCHIVED:{ label: 'Архив',           color: '#94a3b8', bg: '#f8fafc' },
}

function avg(reviews: { rating: number }[]) {
  if (!reviews.length) return null
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
}

export default async function MyServicesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'SELLER' && session.role !== 'ADMIN') redirect('/dashboard')

  const services = await getMyServices()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active="services" />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>Мои услуги</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{services.length} услуг в системе</p>
          </div>
          <Link href="/dashboard/services/new" style={{
            padding: '10px 22px', borderRadius: '50px',
            background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700,
            boxShadow: '0 2px 8px rgba(249,115,22,0.28)',
          }}>
            + Добавить услугу
          </Link>
        </div>

        {services.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
            padding: '60px 32px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>📦</p>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Нет созданных услуг</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>Создайте первую услугу — покупатели увидят её в каталоге</p>
            <Link href="/dashboard/services/new" style={{
              padding: '10px 24px', borderRadius: '50px',
              background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 700,
            }}>
              Создать первую услугу
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {services.map(service => {
              const status = STATUS_LABEL[service.status] ?? STATUS_LABEL.DRAFT
              const rating = avg(service.reviews)
              return (
                <div key={service.id} style={{
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-card)',
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '12px', flexShrink: 0,
                    background: 'var(--bg)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', overflow: 'hidden', fontSize: '26px',
                  }}>
                    {service.images[0]
                      ? <img src={service.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : service.category.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{service.title}</h3>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        color: status.color, background: status.bg,
                      }}>
                        {status.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {service.category.name}
                      {rating && ` · ★ ${rating} (${service.reviews.length})`}
                      {' · '}от {Number(service.price).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <Link href={`/dashboard/services/${service.id}/edit`} style={{
                      padding: '7px 16px', borderRadius: '50px',
                      background: 'var(--primary-light)', border: '1px solid #fed7aa',
                      fontSize: '12px', fontWeight: 600, color: 'var(--primary)',
                    }}>
                      Редактировать
                    </Link>
                    <Link href={`/catalog/${service.id}`} style={{
                      padding: '7px 16px', borderRadius: '50px',
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                    }}>
                      Просмотр
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
