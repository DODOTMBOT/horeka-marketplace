import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getMyServices } from '@/actions/services'

const STATUS: Record<string, { label: string; dot: string }> = {
  ACTIVE:   { label: 'Активна',        dot: '#22c55e' },
  DRAFT:    { label: 'Черновик',        dot: '#94a3b8' },
  PAUSED:   { label: 'Приостановлена', dot: '#d97706' },
  ARCHIVED: { label: 'Архив',          dot: '#cbd5e1' },
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
  const active = services.filter(s => s.status === 'ACTIVE').length

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {active} активных · {services.length} всего
          </p>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
            Мои услуги
          </h1>
        </div>
        <Link href="/dashboard/services/new" style={{
          padding: '10px 22px', borderRadius: '10px', background: 'var(--ink)', color: '#fff',
          fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          + Добавить услугу
        </Link>
      </div>

      {services.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '36px', marginBottom: '12px' }}>📦</p>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Нет созданных услуг</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>Создайте первую услугу — покупатели увидят её в каталоге</p>
          <Link href="/dashboard/services/new" style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--ink)', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            Создать услугу
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {services.map(service => {
            const st = STATUS[service.status] ?? STATUS.DRAFT
            const rating = avg(service.reviews)
            return (
              <div key={service.id} style={{
                background: '#fff', borderRadius: '14px', border: '1px solid var(--line)',
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              }}>
                <div style={{
                  width: '58px', height: '58px', borderRadius: '10px', flexShrink: 0,
                  background: 'var(--paper-2)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden', fontSize: '24px',
                }}>
                  {service.images[0]
                    ? <img src={service.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : service.category.icon}
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{service.title}</h3>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>{st.label}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {service.category.name}
                    {rating && ` · ★ ${rating} (${service.reviews.length})`}
                    {' · '}<span style={{ fontWeight: 700, color: 'var(--ink)' }}>от {Number(service.price).toLocaleString('ru-RU')} ₽</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link href={`/catalog/${service.id}`} style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>
                    Просмотр
                  </Link>
                  <Link href={`/dashboard/services/${service.id}/edit`} style={{ padding: '7px 14px', borderRadius: '8px', background: 'var(--ink)', color: '#fff', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                    Редактировать
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
