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
        <span key={i} style={{ color: i <= rating ? '#d97706' : '#d1d5db', fontSize: `${size}px` }}>★</span>
      ))}
    </span>
  )
}

const BIZ_LABELS: Record<string, string> = {
  SELF_EMPLOYED: 'Самозанятый', IP: 'ИП', COMPANY: 'ООО',
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
  const rating = avg(allReviewsRaw.map(r => ({ rating: r.rating })))
  const memberSince = new Date(seller.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
  const bizLabel = seller.businessType ? BIZ_LABELS[seller.businessType as string] ?? null : null

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviewsRaw.filter(r => r.rating === star).length,
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '12px', color: 'var(--muted)' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Главная</Link>
          <span>›</span>
          <Link href="/catalog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Каталог</Link>
          <span>›</span>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{seller.companyName ?? seller.name}</span>
        </div>

        {/* Profile header */}
        <div style={{
          background: '#fff', borderRadius: '20px',
          border: '1px solid var(--line)', overflow: 'hidden',
          marginBottom: '20px',
        }}>
          {/* Dark top strip */}
          <div style={{ height: '72px', background: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(215,255,58,0.12) 0%, transparent 60%)',
            }} />
          </div>

          <div style={{ padding: '0 28px 24px', marginTop: '-36px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
              {/* Avatar */}
              <div style={{
                width: '72px', height: '72px', borderRadius: '16px', flexShrink: 0,
                background: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '24px', color: 'var(--lime)',
                border: '3px solid #fff', overflow: 'hidden',
              }}>
                {seller.avatarUrl
                  ? <img src={seller.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : initials}
              </div>

              <div style={{ flex: 1, paddingBottom: '4px', minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                    {seller.companyName ?? seller.name}
                  </h1>
                  {seller.innVerified && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: '#dcfce7', border: '1px solid #86efac',
                      borderRadius: '999px', padding: '3px 10px',
                      fontSize: '11px', fontWeight: 700, color: '#15803d',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      ИНН верифицирован
                    </span>
                  )}
                  {bizLabel && (
                    <span style={{
                      padding: '3px 10px', borderRadius: '999px',
                      background: 'var(--paper-2)', color: 'var(--muted)',
                      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {bizLabel}
                    </span>
                  )}
                </div>
                {seller.companyName && (
                  <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{seller.name}</p>
                )}
              </div>
            </div>

            {seller.bio && (
              <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.7, marginBottom: '18px', maxWidth: '680px', opacity: 0.75 }}>
                {seller.bio}
              </p>
            )}

            {/* Stats pills */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'услуг', value: String(seller.services.length) },
                { label: 'отзывов', value: String(allReviewsRaw.length) },
                ...(rating ? [{ label: 'рейтинг', value: `★ ${rating}` }] : []),
                { label: 'на платформе с', value: memberSince },
              ].map(stat => (
                <div key={stat.label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '999px',
                  background: 'var(--paper-2)', border: '1px solid var(--line)',
                }}>
                  <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '14px', color: 'var(--ink)' }}>
                    {stat.value}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Services */}
            {seller.services.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--line)', padding: '24px' }}>
                <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>
                  Услуги · {seller.services.length}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {seller.services.map(service => {
                    const sRating = service.reviews.length
                      ? (service.reviews.reduce((s, r) => s + r.rating, 0) / service.reviews.length).toFixed(1)
                      : null
                    return (
                      <Link key={service.id} href={`/catalog/${service.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'var(--paper)', borderRadius: '14px',
                          border: '1px solid var(--line)', overflow: 'hidden',
                          transition: 'border-color 0.15s',
                        }}>
                          <div style={{ height: '120px', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', overflow: 'hidden' }}>
                            {service.images[0]
                              ? <img src={service.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : service.category.icon}
                          </div>
                          <div style={{ padding: '12px 14px' }}>
                            <p style={{
                              fontSize: '13px', fontWeight: 600, color: 'var(--ink)',
                              marginBottom: '8px', lineHeight: 1.4,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {service.title}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {sRating
                                ? <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>★ {sRating} ({service.reviews.length})</span>
                                : <span />}
                              <span style={{ fontFamily: 'var(--ff-display)', fontSize: '14px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
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
              <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--line)', padding: '24px' }}>
                <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '18px' }}>
                  Портфолио
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                  {seller.portfolioUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Портфолио ${i + 1}`} style={{
                        width: '100%', height: '130px', objectFit: 'cover',
                        borderRadius: '12px', display: 'block', border: '1px solid var(--line)',
                      }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {allReviewsRaw.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--line)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                    Отзывы · {allReviewsRaw.length}
                  </h2>
                  {rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em' }}>{rating}</span>
                      <Stars rating={Math.round(Number(rating))} size={15} />
                    </div>
                  )}
                </div>

                {/* Rating distribution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '24px', maxWidth: '320px' }}>
                  {ratingDist.map(({ star, count }) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--muted)', width: '22px', textAlign: 'right', fontWeight: 600 }}>{star}★</span>
                      <div style={{ flex: 1, height: '5px', background: 'var(--paper-2)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '3px', background: '#d97706',
                          width: allReviewsRaw.length ? `${(count / allReviewsRaw.length) * 100}%` : '0%',
                        }} />
                      </div>
                      <span style={{ color: 'var(--muted)', width: '18px', fontSize: '11px' }}>{count}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {allReviewsRaw.map((review, i) => {
                    const rInitials = review.author.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <div key={review.id} style={{
                        paddingBottom: '20px',
                        borderBottom: i < allReviewsRaw.length - 1 ? '1px solid var(--line)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                            background: 'var(--ink)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontFamily: 'var(--ff-display)',
                            color: 'var(--lime)', fontSize: '12px', fontWeight: 800, overflow: 'hidden',
                          }}>
                            {review.author.avatarUrl
                              ? <img src={review.author.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              : rInitials}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>{review.author.name}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                  <Stars rating={review.rating} />
                                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              </div>
                              <Link href={`/catalog/${review.service.id}`} style={{
                                fontSize: '11px', color: 'var(--blue)', fontWeight: 600,
                                textDecoration: 'none', maxWidth: '200px',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {review.service.title} →
                              </Link>
                            </div>
                            {review.comment && (
                              <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, opacity: 0.8 }}>
                                {review.comment}
                              </p>
                            )}
                            {review.sellerReply && (
                              <div style={{ marginTop: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px' }}>
                                <p style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>Ответ исполнителя</p>
                                <p style={{ fontSize: '13px', color: '#166534', lineHeight: 1.6 }}>{review.sellerReply}</p>
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

            {seller.services.length === 0 && (
              <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--line)', padding: '60px 32px', textAlign: 'center' }}>
                <p style={{ fontSize: '40px', marginBottom: '16px' }}>📦</p>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  У исполнителя пока нет активных услуг
                </p>
                <Link href="/catalog" style={{
                  display: 'inline-block', marginTop: '16px',
                  padding: '10px 24px', borderRadius: '10px',
                  background: 'var(--ink)', color: 'var(--lime)',
                  fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '13px',
                  textDecoration: 'none',
                }}>
                  Вернуться в каталог
                </Link>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Contact */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--line)', padding: '20px' }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '14px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                Связаться
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '14px' }}>
                Выберите услугу и напишите исполнителю — он ответит в течение 24 часов
              </p>
              {seller.services.length > 0 && (
                <Link href={`/catalog/${seller.services[0].id}`} style={{
                  display: 'block', textAlign: 'center', padding: '11px',
                  borderRadius: '10px', background: 'var(--ink)',
                  color: 'var(--lime)', fontFamily: 'var(--ff-display)',
                  fontSize: '13px', fontWeight: 800, textDecoration: 'none',
                  letterSpacing: '-0.01em',
                }}>
                  Написать исполнителю →
                </Link>
              )}
            </div>

            {/* Verified badge */}
            {seller.innVerified && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '16px', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#15803d' }}>Верифицированный</p>
                </div>
                <p style={{ fontSize: '12px', color: '#166534', lineHeight: 1.5 }}>
                  ИНН и юридические данные проверены платформой
                </p>
              </div>
            )}

            {/* Quick stats */}
            {(allReviewsRaw.length > 0 || seller.services.length > 0) && (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '16px 18px' }}>
                {[
                  { lbl: 'Услуг', val: String(seller.services.length) },
                  { lbl: 'Отзывов', val: String(allReviewsRaw.length) },
                  ...(rating ? [{ lbl: 'Рейтинг', val: `★ ${rating}` }] : []),
                ].map(({ lbl, val }, i, arr) => (
                  <div key={lbl} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{lbl}</span>
                    <span style={{ fontFamily: 'var(--ff-display)', fontSize: '15px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
