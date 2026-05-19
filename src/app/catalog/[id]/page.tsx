import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { getService } from '@/actions/services'
import type { ServicePackage } from '@/actions/services'
import { getSession } from '@/lib/session'
import PackageTabs from './PackageTabs'
import OrderForm from './OrderForm'
import ContactButton from './ContactButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const service = await getService(id)
  if (!service) return { title: 'Услуга не найдена' }

  const description = service.description.replace(/<[^>]*>/g, '').slice(0, 160)
  return {
    title: service.title,
    description: description || `${service.title} — ${service.category.name}. От ${Number(service.price).toLocaleString('ru-RU')} ₽`,
    openGraph: {
      title: service.title,
      description,
      images: service.images[0] ? [service.images[0]] : [],
    },
  }
}

function avg(reviews: { rating: number }[]) {
  if (!reviews.length) return null
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d9e0', fontSize: '14px' }}>★</span>
      ))}
    </span>
  )
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [service, session] = await Promise.all([getService(id), getSession()])

  if (!service) notFound()

  const rating = avg(service.reviews)
  const sellerInitials = service.seller.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const sellerServiceCount = service.seller.services.length
  const sellerRating = avg(service.seller.reviews)

  const packages = (service.packages as ServicePackage[] | null) ?? []
  const hasPackages = packages.length > 0
  const isOwner = session?.userId === service.seller.id

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link href="/catalog">Каталог</Link>
          <span>›</span>
          <Link href={`/catalog?category=${service.category.slug}`}>{service.category.name}</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{service.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'start' }}>
          {/* Left column */}
          <div>
            {/* Images */}
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-out)', overflow: 'hidden', marginBottom: '24px',
            }}>
              {service.images.length > 0 ? (
                <div>
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                  />
                  {service.images.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto' }}>
                      {service.images.slice(1).map((img, i) => (
                        <img key={i} src={img} alt="" style={{
                          width: '80px', height: '60px', objectFit: 'cover',
                          borderRadius: '8px', flexShrink: 0, cursor: 'pointer',
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  height: '300px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '80px', background: 'var(--bg)',
                }}>
                  {service.category.icon ?? '📦'}
                </div>
              )}
            </div>

            {/* Title + rating */}
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-out)', padding: '28px', marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#fff3eb', border: '1px solid #fed7aa',
                  borderRadius: '20px', padding: '3px 12px',
                  fontSize: '12px', fontWeight: 600, color: 'var(--primary)',
                }}>
                  {service.category.name}
                </span>
                {service.tags.map(tag => (
                  <span key={tag} style={{
                    background: 'var(--bg)', borderRadius: '20px', padding: '3px 12px',
                    fontSize: '12px', color: 'var(--text-muted)',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px', lineHeight: 1.3 }}>
                {service.title}
              </h1>
              {rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stars rating={Math.round(Number(rating))} />
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{rating}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    ({service.reviews.length} {service.reviews.length === 1 ? 'отзыв' : 'отзывов'})
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-out)', padding: '28px', marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
                Описание
              </h2>
              <div
                style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text)' }}
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
            </div>

            {/* Reviews */}
            {service.reviews.length > 0 && (
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-out)', padding: '28px',
              }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
                  Отзывы ({service.reviews.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {service.reviews.map(review => {
                    const initials = review.author.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <div key={review.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'var(--primary)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0,
                          }}>
                            {review.author.avatarUrl
                              ? <img src={review.author.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                              : initials}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{review.author.name}</p>
                            <Stars rating={review.rating} />
                          </div>
                          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>{review.comment}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column — order card */}
          <div style={{ position: 'sticky', top: '80px' }}>
            {/* Package tabs or simple price */}
            {hasPackages ? (
              <PackageTabs packages={packages} serviceId={service.id} isLoggedIn={!!session} isOwner={isOwner} />
            ) : (
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-out)', padding: '24px', marginBottom: '20px',
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Стоимость</span>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
                    {Number(service.price).toLocaleString('ru-RU')} ₽
                    <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>
                      / {service.priceUnit}
                    </span>
                  </p>
                </div>
                {isOwner ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Это ваша услуга</p>
                ) : session ? (
                  <OrderForm serviceId={service.id} price={Number(service.price)} />
                ) : (
                  <Link href="/login" style={{
                    display: 'block', textAlign: 'center',
                    padding: '14px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--primary)', color: '#fff', fontSize: '15px', fontWeight: 700,
                    boxShadow: '4px 4px 12px rgba(249,115,22,0.35)',
                  }}>
                    Войдите для заказа
                  </Link>
                )}
              </div>
            )}

            {/* Seller card */}
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-out)', padding: '20px',
            }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                Поставщик
              </p>
              <Link href={`/seller/${service.seller.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--primary)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontSize: '17px', fontWeight: 700,
                  }}>
                    {service.seller.avatarUrl
                      ? <img src={service.seller.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                      : sellerInitials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                        {service.seller.companyName ?? service.seller.name}
                      </p>
                      {service.seller.innVerified && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      )}
                    </div>
                    {sellerRating && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>★ {sellerRating}</p>
                    )}
                  </div>
                </div>
              </Link>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-in)', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{sellerServiceCount}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Услуг</p>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-in)', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{service.seller.reviews.length}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Отзывов</p>
                </div>
              </div>

              <Link href={`/seller/${service.seller.id}`} style={{
                display: 'block', textAlign: 'center',
                padding: '10px', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)', boxShadow: 'var(--shadow-sm)',
                fontSize: '13px', fontWeight: 600, color: 'var(--text)',
              }}>
                Профиль поставщика
              </Link>
              {session && !isOwner && (
                <ContactButton sellerId={service.seller.id} serviceId={service.id} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
