import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { getSellerProfile } from '@/actions/services'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const seller = await getSellerProfile(id)
  if (!seller) return { title: 'Исполнитель не найден' }
  const name = seller.companyName ?? seller.name
  return {
    title: `${name} — профиль исполнителя`,
    description: seller.bio ?? `${name} на Unit One. ${seller.services.length} активных услуг для HoReCa.`,
    openGraph: {
      title: name,
      description: seller.bio ?? `${name} — исполнитель на Unit One`,
      images: seller.avatarUrl ? [seller.avatarUrl] : [],
    },
  }
}

function avg(reviews: { rating: number }[]) {
  if (!reviews.length) return null
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d9e0', fontSize: `${size}px` }}>★</span>
      ))}
    </span>
  )
}

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [seller, allReviewsRaw] = await Promise.all([
    getSellerProfile(id),
    prisma.review.findMany({
      where: { service: { sellerId: id, status: 'ACTIVE' } },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        service: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  if (!seller) notFound()

  const initials = seller.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const allRatings = allReviewsRaw.map(r => ({ rating: r.rating }))
  const rating = avg(allRatings)
  const memberSince = new Date(seller.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviewsRaw.filter(r => r.rating === star).length,
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Главная</Link>
          <span>›</span>
          <Link href="/catalog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Каталог</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{seller.companyName ?? seller.name}</span>
        </div>

        {/* Header card */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-out)', overflow: 'hidden', marginBottom: '20px',
        }}>
          {/* Top gradient banner */}
          <div style={{ height: '80px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }} />

          <div style={{ padding: '0 28px 28px', marginTop: '-40px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '20px' }}>
              {/* Avatar */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '20px', flexShrink: 0,
                background: 'var(--primary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: 800,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '3px solid #fff',
                overflow: 'hidden',
              }}>
                {seller.avatarUrl
                  ? <img src={seller.avatarUrl} style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} alt="" />
                  : initials}
              </div>

              <div style={{ flex: 1, paddingBottom: '4px', minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
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
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{seller.name}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {seller.bio && (
              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '20px', maxWidth: '680px' }}>
                {seller.bio}
              </p>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Услуги', value: String(seller.services.length), icon: '📦' },
                { label: 'Отзывы', value: String(allReviewsRaw.length), icon: '💬' },
                { label: 'Рейтинг', value: rating ? `★ ${rating}` : '—', icon: '⭐' },
                { label: 'На платформе', value: memberSince, icon: '📅' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-in)', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ fontSize: '18px' }}>{stat.icon}</span>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: stat.label === 'Рейтинг' ? '#f59e0b' : 'var(--text)', lineHeight: 1 }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

          {/* Left: services + portfolio + reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Services */}
            {seller.services.length > 0 && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-out)', padding: '24px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>
                  Услуги ({seller.services.length})
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                  {seller.services.map(service => {
                    const sRating = service.reviews.length
                      ? (service.reviews.reduce((s, r) => s + r.rating, 0) / service.reviews.length).toFixed(1)
                      : null
                    return (
                      <Link key={service.id} href={`/catalog/${service.id}`} style={{ textDecoration: 'none' }}>
                        <div className="card-hover" style={{
                          background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)', overflow: 'hidden',
                        }}>
                          <div style={{ height: '130px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', overflow: 'hidden' }}>
                            {service.images[0]
                              ? <img src={service.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : service.category.icon}
                          </div>
                          <div style={{ padding: '12px 14px' }}>
                            <p style={{
                              fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                              marginBottom: '6px', lineHeight: 1.4,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {service.title}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {sRating ? <span style={{ fontSize: '11px', color: '#f59e0b' }}>★ {sRating} ({service.reviews.length})</span> : <span />}
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
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

            {/* Reviews */}
            {allReviewsRaw.length > 0 && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-out)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>
                    Отзывы ({allReviewsRaw.length})
                  </h2>
                  {rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>{rating}</span>
                      <Stars rating={Math.round(Number(rating))} size={16} />
                    </div>
                  )}
                </div>

                {/* Rating distribution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '24px' }}>
                  {ratingDist.map(({ star, count }) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#6b7280', width: '24px', textAlign: 'right' }}>{star}★</span>
                      <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px', background: '#f59e0b',
                          width: allReviewsRaw.length ? `${(count / allReviewsRaw.length) * 100}%` : '0%',
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <span style={{ color: '#9ca3af', width: '20px' }}>{count}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {allReviewsRaw.map((review, i) => {
                    const rInitials = review.author.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <div key={review.id} style={{
                        paddingBottom: '20px',
                        borderBottom: i < allReviewsRaw.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            background: 'var(--primary)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700, overflow: 'hidden',
                          }}>
                            {review.author.avatarUrl
                              ? <img src={review.author.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              : rInitials}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{review.author.name}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                  <Stars rating={review.rating} />
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              </div>
                              <Link href={`/catalog/${review.service.id}`} style={{
                                fontSize: '11px', color: 'var(--primary)', fontWeight: 600,
                                textDecoration: 'none', maxWidth: '200px',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {review.service.title} →
                              </Link>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, marginTop: '8px' }}>
                              {review.comment}
                            </p>
                            {review.sellerReply && (
                              <div style={{ marginTop: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px' }}>
                                <p style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>Ответ исполнителя</p>
                                <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{review.sellerReply}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {seller.portfolioUrls.length > 0 && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-out)', padding: '24px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>
                  Портфолио
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {seller.portfolioUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Портфолио ${i + 1}`} style={{
                        width: '100%', height: '140px', objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)', display: 'block',
                      }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {seller.services.length === 0 && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-out)', padding: '60px 32px', textAlign: 'center' }}>
                <p style={{ fontSize: '40px', marginBottom: '16px' }}>📦</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>У исполнителя пока нет активных услуг</p>
                <Link href="/catalog" style={{
                  display: 'inline-block', marginTop: '16px',
                  padding: '10px 24px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '14px',
                }}>
                  Вернуться в каталог
                </Link>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-out)', padding: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                Контакт
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, marginBottom: '16px' }}>
                Есть вопросы или хотите обсудить сотрудничество — напишите исполнителю напрямую через любую его услугу.
              </p>
              {seller.services.length > 0 && (
                <Link href={`/catalog/${seller.services[0].id}`} style={{
                  display: 'block', textAlign: 'center', padding: '11px',
                  borderRadius: 'var(--radius-sm)', background: 'var(--primary)',
                  color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                  boxShadow: '4px 4px 12px rgba(249,115,22,0.3)',
                }}>
                  Написать исполнителю
                </Link>
              )}
            </div>

            {/* INN badge */}
            {seller.innVerified && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>Верифицированный исполнитель</p>
                </div>
                <p style={{ fontSize: '12px', color: '#166534', lineHeight: 1.5 }}>
                  ИНН и юридические данные проверены командой Unit One
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
