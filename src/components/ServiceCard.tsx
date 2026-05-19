import Link from 'next/link'
import type { Prisma } from '@prisma/client'
import FavoriteButton from './FavoriteButton'

type ServiceWithRelations = Prisma.ServiceGetPayload<{
  include: {
    category: true
    seller: { select: { id: true; name: true; avatarUrl: true; innVerified: true; companyName: true } }
    reviews: { select: { rating: true } }
  }
}>

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return null
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
}

export default function ServiceCard({ service, isFavorited = false }: { service: ServiceWithRelations; isFavorited?: boolean }) {
  const rating = avgRating(service.reviews)
  const initials = service.seller.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Link href={`/catalog/${service.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card-hover" style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
      }}>
        {/* Image */}
        <div style={{
          width: '100%', height: '170px',
          background: 'var(--bg)',
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          {service.images[0] ? (
            <img src={service.images[0]} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
              {service.category.icon ?? '📦'}
            </div>
          )}
          {/* Category badge */}
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50px', padding: '3px 10px',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}>
            {service.category.name}
          </div>
          <FavoriteButton serviceId={service.id} isFavorited={isFavorited} />
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <h3 style={{
            fontSize: '14px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {service.title}
          </h3>

          {/* Seller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontSize: '8px', fontWeight: 700, overflow: 'hidden',
            }}>
              {service.seller.avatarUrl
                ? <img src={service.seller.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : initials}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {service.seller.companyName ?? service.seller.name}
            </span>
            {service.seller.innVerified && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
          </div>

          {/* Rating + price */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border)',
          }}>
            {rating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ color: '#f59e0b', fontSize: '13px' }}>★</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{rating}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({service.reviews.length})</span>
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Нет отзывов</span>
            )}
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>от </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                {Number(service.price).toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
