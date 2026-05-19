import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getSellerProfile } from '@/actions/services'

function avg(reviews: { rating: number }[]) {
  if (!reviews.length) return null
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
}

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const seller = await getSellerProfile(id)
  if (!seller) notFound()

  const initials = seller.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const allReviews = seller.services.flatMap(s => s.reviews)
  const rating = avg(allReviews)
  const memberSince = new Date(seller.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })


  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header card */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-out)', padding: '32px', marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '96px', height: '96px', borderRadius: '24px', flexShrink: 0,
              background: 'var(--primary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 800,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {seller.avatarUrl
                ? <img src={seller.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover' }} alt="" />
                : initials}
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>
                  {seller.companyName ?? seller.name}
                </h1>
                {seller.innVerified && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: '20px', padding: '3px 10px',
                    fontSize: '12px', fontWeight: 600, color: '#16a34a',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    ИНН верифицирован
                  </div>
                )}
              </div>
              {seller.companyName && (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>{seller.name}</p>
              )}
              {seller.bio && (
                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, marginBottom: '12px', maxWidth: '600px' }}>
                  {seller.bio}
                </p>
              )}
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>На платформе с {memberSince}</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0, flexWrap: 'wrap' }}>
              {[
                { label: 'Услуг', value: String(seller.services.length) },
                { label: 'Отзывов', value: String(allReviews.length) },
                { label: 'Рейтинг', value: rating ? `★ ${rating}` : '—' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-in)', padding: '14px 20px', textAlign: 'center',
                  minWidth: '80px',
                }}>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: stat.label === 'Рейтинг' ? '#f59e0b' : 'var(--text)' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services */}
        {seller.services.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              Услуги поставщика
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {seller.services.map(service => {
                const sRating = service.reviews.length
                  ? (service.reviews.reduce((s, r) => s + r.rating, 0) / service.reviews.length).toFixed(1)
                  : null
                return (
                  <Link key={service.id} href={`/catalog/${service.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card-hover" style={{
                      background: 'var(--surface)', borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-out)', overflow: 'hidden',
                    }}>
                      <div style={{ height: '160px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                        {service.images[0]
                          ? <img src={service.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : service.category.icon}
                      </div>
                      <div style={{ padding: '16px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.4 }}>
                          {service.title}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {sRating
                            ? <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>★ {sRating}</span>
                            : <span />
                          }
                          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                            от {Number(service.price).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {seller.portfolioUrls.length > 0 && (
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '28px',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              Портфолио
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {seller.portfolioUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={`Портфолио ${i + 1}`}
                    style={{
                      width: '100%', height: '160px', objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)',
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {seller.services.length === 0 && (
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '60px 32px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>📦</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              У поставщика пока нет активных услуг
            </p>
            <Link href="/catalog" style={{
              display: 'inline-block', marginTop: '16px',
              padding: '10px 24px', borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '14px',
            }}>
              Вернуться в каталог
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
