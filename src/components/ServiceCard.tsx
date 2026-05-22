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

function plainExcerpt(raw: string, max = 160) {
  const clean = raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : clean.slice(0, max).trimEnd() + '…'
}

export default function ServiceCard({ service, isFavorited = false }: { service: ServiceWithRelations; isFavorited?: boolean }) {
  const rating  = avgRating(service.reviews)
  const initials = service.seller.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const hasImage = service.images.length > 0

  return (
    <Link href={`/catalog/${service.id}`} style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
      <div className="svc-card" style={{ width: '100%' }}>

        {/* ── Image / placeholder ── */}
        <div style={{
          position: 'relative', overflow: 'hidden', flexShrink: 0,
          height: '200px',
          background: hasImage ? 'var(--paper-2)' : 'var(--paper-2)',
        }}>
          {hasImage ? (
            <img
              src={service.images[0]}
              alt={service.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '52px', lineHeight: 1 }}>{service.category.icon ?? '📦'}</span>
            </div>
          )}

          {/* Category badge — uses format accent from CSS var */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px',
            background: 'var(--fmt-accent, var(--ink))',
            color: 'var(--fmt-text, #fff)',
            borderRadius: 'var(--r-sm)',
            padding: '3px 9px',
            fontSize: '10px', fontWeight: 700, fontFamily: 'var(--ff-mono)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}>
            {service.category.name}
          </div>

          <FavoriteButton serviceId={service.id} isFavorited={isFavorited} />

          {/* Image count badge */}
          {service.images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: '10px', right: '10px',
              background: 'rgba(15,15,18,0.55)', backdropFilter: 'blur(8px)',
              borderRadius: 'var(--r-sm)', padding: '3px 8px',
              fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700,
              color: '#fff', letterSpacing: '0.04em',
            }}>
              1/{service.images.length}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--ff-display)', fontSize: '15px', fontWeight: 800,
            color: 'var(--ink)', lineHeight: 1.35, letterSpacing: '-0.02em',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {service.title}
          </h3>

          {/* Description — stripped, hard-capped at 160 chars */}
          {service.description && (
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.55 }}>
              {plainExcerpt(service.description, 160)}
            </p>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Seller */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            paddingTop: '10px', borderTop: '1px solid var(--line)',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--fmt-accent, var(--ink))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--fmt-text, #fff)', fontSize: '12px', fontWeight: 800,
              overflow: 'hidden', fontFamily: 'var(--ff-display)',
            }}>
              {service.seller.avatarUrl
                ? <img src={service.seller.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '13px', fontWeight: 700, color: 'var(--ink)',
                fontFamily: 'var(--ff-display)', letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}>
                {service.seller.name}
              </p>
              {service.seller.companyName && (
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {service.seller.companyName}
                </p>
              )}
            </div>
            {service.seller.innVerified && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
          </div>

          {/* Price + Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{
                fontFamily: 'var(--ff-display)', fontWeight: 900,
                fontSize: '26px', color: 'var(--ink)',
                lineHeight: 1, letterSpacing: '-0.04em',
              }}>
                {Number(service.price).toLocaleString('ru-RU')}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--muted)', marginLeft: '3px' }}>₽</span>
            </div>

            {rating ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                padding: '3px 8px', borderRadius: 'var(--r-sm)',
                background: 'var(--paper-2)', border: '1px solid var(--line)',
              }}>
                <span style={{ color: '#f59e0b', fontSize: '12px', lineHeight: 1 }}>★</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--ff-display)', letterSpacing: '-0.02em' }}>{rating}</span>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>({service.reviews.length})</span>
              </div>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--line)', fontFamily: 'var(--ff-display)' }}>нет отзывов</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
