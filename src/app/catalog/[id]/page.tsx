import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ServiceCard from '@/components/ServiceCard'
import { getService } from '@/actions/services'
import type { ServicePackage } from '@/actions/services'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import ImageGallery from './ImageGallery'
import PackageTabs from './PackageTabs'
import OrderForm from './OrderForm'
import ContactButton from './ContactButton'
import SellerReplyForm from '@/components/SellerReplyForm'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const service = await getService(id)
  if (!service) return { title: 'Услуга не найдена' }
  const description = service.description.replace(/<[^>]*>/g, '').slice(0, 160)
  return {
    title: service.title,
    description: description || `${service.title} — ${service.category.name}. От ${Number(service.price).toLocaleString('ru-RU')} ₽`,
    openGraph: { title: service.title, description, images: service.images[0] ? [service.images[0]] : [] },
  }
}

const FORMAT_META: Record<string, { label: string; bg: string; textColor: string }> = {
  digital: { label: 'Инструменты', bg: '#3D5AFE', textColor: '#fff' },
  service: { label: 'Специалист',  bg: '#0F0F12', textColor: '#fff' },
  project: { label: 'Проект',      bg: '#FF6B5C', textColor: '#fff' },
}

function avg(reviews: { rating: number }[]) {
  if (!reviews.length) return null
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : 'rgba(255,255,255,0.2)', fontSize: `${size}px` }}>★</span>
      ))}
    </span>
  )
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [service, session] = await Promise.all([getService(id), getSession()])
  if (!service) notFound()

  const similar = await prisma.service.findMany({
    where: { categoryId: service.categoryId, status: 'ACTIVE', id: { not: service.id } },
    include: {
      category: true,
      seller: { select: { id: true, name: true, avatarUrl: true, innVerified: true, companyName: true } },
      reviews: { select: { rating: true } },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  const rating = avg(service.reviews)
  const sellerInitials = service.seller.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const sellerRating = avg(service.seller.reviews)
  const packages = (service.packages as ServicePackage[] | null) ?? []
  const hasPackages = packages.length > 0
  const isOwner = session?.userId === service.seller.id
  const reviewCount = service.reviews.length
  const reviewWord = reviewCount === 1 ? 'отзыв' : reviewCount < 5 ? 'отзыва' : 'отзывов'

  const fmt = FORMAT_META[service.format ?? 'service'] ?? FORMAT_META.service
  const isLightHero = true

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-hero-1 { animation: heroReveal 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .anim-hero-2 { animation: heroReveal 0.55s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
        .anim-hero-3 { animation: heroReveal 0.6s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
        .anim-hero-4 { animation: heroReveal 0.65s cubic-bezier(0.22,1,0.36,1) 0.21s both; }
        .anim-col-l  { animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
        .anim-col-r  { animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        .anim-similar { animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .review-card { transition: box-shadow 0.2s, transform 0.2s; }
        .review-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.07); }
        .seller-link { transition: opacity 0.15s; }
        .seller-link:hover { opacity: 0.8; }
        .sim-card { transition: transform 0.18s, box-shadow 0.18s; }
        .sim-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,0.1); }
        .tag-pill { transition: background 0.12s, color 0.12s; }
        .tag-pill:hover { background: var(--ink) !important; color: #fff !important; }
        .order-btn { transition: transform 0.15s, box-shadow 0.15s, background 0.15s; }
        .order-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Navbar />

        {/* ─── HERO BAND ─────────────────────────────────────────────── */}
        <section style={{ background: fmt.bg, position: 'relative', overflow: 'hidden' }}>
          {/* Subtle texture grid */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)',
          }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 28px 36px', position: 'relative' }}>
            {/* Breadcrumb */}
            <div className="anim-hero-1" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
              <Link href="/" style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textDecoration: 'none' }}>UNIT ONE</Link>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>→</span>
              <Link href="/catalog" style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textDecoration: 'none' }}>КАТАЛОГ</Link>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>→</span>
              <Link href={`/catalog?format=${service.format ?? 'service'}`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textDecoration: 'none' }}>{fmt.label.toUpperCase()}</Link>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>→</span>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {service.title.toUpperCase()}
              </span>
            </div>

            {/* Badges */}
            <div className="anim-hero-2" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <span style={{
                fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700,
                padding: '4px 12px', borderRadius: '999px',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                letterSpacing: '0.08em',
              }}>
                {fmt.label.toUpperCase()}
              </span>
              <Link href={`/catalog?category=${service.category.slug}`} style={{
                fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700,
                padding: '4px 12px', borderRadius: '999px',
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                letterSpacing: '0.08em', textDecoration: 'none',
              }}>
                {service.category.icon && <span style={{ marginRight: '4px' }}>{service.category.icon}</span>}
                {service.category.name.toUpperCase()}
              </Link>
            </div>

            {/* Title */}
            <h1 className="anim-hero-3" style={{
              fontFamily: 'var(--ff-display)', fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 64px)',
              color: '#fff', lineHeight: 0.95,
              letterSpacing: '-0.045em',
              marginBottom: '20px', maxWidth: '900px',
            }}>
              {service.title}
            </h1>

            {/* Rating + meta row */}
            <div className="anim-hero-4" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {rating ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stars rating={Math.round(Number(rating))} size={16} />
                  <span style={{ fontWeight: 800, color: '#fff', fontSize: '15px' }}>{rating}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>({reviewCount} {reviewWord})</span>
                </div>
              ) : (
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Нет отзывов</span>
              )}
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
                {service.seller.services.length} услуг от исполнителя
              </span>
            </div>

            {/* Price + CTA strip */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
              paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.15)',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>от</span>
                <span style={{
                  fontFamily: 'var(--ff-display)', fontWeight: 900,
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  color: '#fff', lineHeight: 1, letterSpacing: '-0.05em',
                }}>
                  {Number(service.price).toLocaleString('ru-RU')}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>₽</span>
              </div>
              {!isOwner && !session && (
                <Link href={`/login?next=/catalog/${service.id}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: 'var(--r-md)',
                  background: '#fff', color: fmt.bg,
                  fontSize: '14px', fontWeight: 800, textDecoration: 'none',
                  letterSpacing: '-0.01em',
                }}>
                  Войти для заказа
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              )}
              {isOwner && (
                <Link href={`/dashboard/services/${service.id}/edit`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: 'var(--r-md)',
                  background: 'rgba(255,255,255,0.12)', color: '#fff',
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                  letterSpacing: '-0.01em', border: '1.5px solid rgba(255,255,255,0.2)',
                }}>
                  Редактировать
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ─── MAIN CONTENT ──────────────────────────────────────────── */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 28px 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '36px', alignItems: 'start' }}>

            {/* ── Left ── */}
            <div className="anim-col-l" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

              {/* Gallery */}
              <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid var(--line)', marginBottom: '28px' }}>
                <ImageGallery images={service.images} alt={service.title} icon={service.category.icon} />
              </div>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
                  {service.tags.map(tag => (
                    <Link key={tag} href={`/catalog?tag=${encodeURIComponent(tag)}`}
                      className="tag-pill"
                      style={{
                        fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 600,
                        padding: '5px 12px', borderRadius: '999px',
                        background: 'var(--paper-2)', color: 'var(--muted)',
                        textDecoration: 'none', letterSpacing: '0.02em',
                      }}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Description */}
              <div style={{ paddingBottom: '28px', borderBottom: '1px solid var(--line)', marginBottom: '28px' }}>
                <p style={{
                  fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600,
                  color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px',
                }}>Описание</p>
                <div
                  style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: (service.fullDescription || service.description).replace(/<[^>]*>/g, '') }}
                />
              </div>

              {/* Reviews */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Отзывы
                    </p>
                    {rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontFamily: 'var(--ff-display)', fontWeight: 900,
                          fontSize: '48px', color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.05em',
                        }}>{rating}</span>
                        <div>
                          <div style={{ display: 'flex', gap: '1px', marginBottom: '3px' }}>
                            {[1,2,3,4,5].map(i => (
                              <span key={i} style={{ color: i <= Math.round(Number(rating)) ? '#f59e0b' : 'var(--line)', fontSize: '16px' }}>★</span>
                            ))}
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{reviewCount} {reviewWord}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {service.reviews.length === 0 ? (
                  <div style={{
                    padding: '32px', borderRadius: 'var(--r-lg)', background: 'var(--paper-2)',
                    textAlign: 'center', color: 'var(--muted)', fontSize: '14px',
                  }}>
                    Пока нет отзывов — будьте первым!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {service.reviews.map(review => {
                      const initials = review.author.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                      return (
                        <div key={review.id} className="review-card" style={{
                          background: '#fff', border: '1px solid var(--line)',
                          borderRadius: 'var(--r-lg)', padding: '20px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                              background: 'var(--blue)', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, overflow: 'hidden',
                            }}>
                              {review.author.avatarUrl
                                ? <img src={review.author.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                : initials}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)', marginBottom: '3px' }}>
                                {review.author.name}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '1px' }}>
                                  {[1,2,3,4,5].map(i => (
                                    <span key={i} style={{ color: i <= review.rating ? '#f59e0b' : 'var(--line)', fontSize: '13px' }}>★</span>
                                  ))}
                                </div>
                                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                  {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {review.comment && (
                            <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.65 }}>
                              {review.comment}
                            </p>
                          )}

                          {review.sellerReply && !isOwner && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{
                                background: 'var(--paper-2)', borderLeft: '3px solid var(--blue)',
                                borderRadius: 'var(--r-sm)', padding: '12px 14px',
                              }}>
                                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>
                                  Ответ исполнителя
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>{review.sellerReply}</p>
                              </div>
                            </div>
                          )}
                          {isOwner && <SellerReplyForm reviewId={review.id} existing={review.sellerReply} />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right ── */}
            <div className="anim-col-r" style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Order card */}
              {hasPackages ? (
                <PackageTabs packages={packages} serviceId={service.id} isLoggedIn={!!session} isOwner={isOwner} />
              ) : (
                <div style={{
                  background: '#fff', border: '1px solid var(--line)',
                  borderRadius: 'var(--r-xl)', padding: '24px',
                }}>
                  <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Стоимость
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                    <span style={{
                      fontFamily: 'var(--ff-display)', fontWeight: 900,
                      fontSize: '44px', color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.05em',
                    }}>
                      {Number(service.price).toLocaleString('ru-RU')}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>₽</span>
                  </div>

                  {isOwner ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        padding: '12px', borderRadius: 'var(--r-md)',
                        background: 'var(--paper-2)', fontSize: '13px', color: 'var(--muted)',
                        marginBottom: '10px',
                      }}>
                        Это ваше объявление
                      </div>
                      <Link href={`/dashboard/services/${service.id}/edit`} style={{
                        display: 'block', padding: '12px', borderRadius: 'var(--r-md)',
                        background: 'var(--ink)', color: '#fff',
                        fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                        textAlign: 'center',
                      }}>
                        Редактировать →
                      </Link>
                    </div>
                  ) : session ? (
                    <div>
                      <OrderForm serviceId={service.id} price={Number(service.price)} />
                    </div>
                  ) : (
                    <Link href={`/login?next=/catalog/${service.id}`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '14px 20px', borderRadius: 'var(--r-md)',
                      background: 'var(--ink)', color: '#fff',
                      fontSize: '14px', fontWeight: 800, textDecoration: 'none',
                      letterSpacing: '-0.01em',
                    }}>
                      Войти для заказа
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  )}
                </div>
              )}

              {/* Seller card */}
              <div style={{
                background: '#fff', border: '1px solid var(--line)',
                borderRadius: 'var(--r-xl)', padding: '20px',
              }}>
                <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Исполнитель
                </p>
                <Link href={`/seller/${service.seller.id}`} className="seller-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                    background: fmt.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 800, overflow: 'hidden',
                  }}>
                    {service.seller.avatarUrl
                      ? <img src={service.seller.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : sellerInitials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                        {service.seller.companyName ?? service.seller.name}
                      </p>
                      {service.seller.innVerified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      )}
                    </div>
                    {sellerRating && (
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>★ {sellerRating} · {service.seller.reviews.length} отз.</p>
                    )}
                  </div>
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { label: 'Услуг', value: service.seller.services.length },
                    { label: 'Отзывов', value: service.seller.reviews.length },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'var(--paper-2)', borderRadius: 'var(--r-md)',
                      padding: '12px', textAlign: 'center',
                    }}>
                      <p style={{
                        fontFamily: 'var(--ff-display)', fontWeight: 900,
                        fontSize: '26px', color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.04em',
                      }}>{s.value}</p>
                      <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <Link href={`/seller/${service.seller.id}`} style={{
                  display: 'block', textAlign: 'center', padding: '11px',
                  borderRadius: 'var(--r-md)', background: 'var(--paper-2)',
                  color: 'var(--ink)', fontSize: '13px', fontWeight: 700,
                  textDecoration: 'none', marginBottom: session && !isOwner ? '8px' : 0,
                  transition: 'background 0.15s',
                }}>
                  Профиль исполнителя →
                </Link>

                {session && !isOwner && (
                  <ContactButton sellerId={service.seller.id} serviceId={service.id} />
                )}
              </div>

              {/* Share */}
              <div style={{
                background: '#fff', border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)', padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>ПОДЕЛИТЬСЯ</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { label: 'TG', href: `https://t.me/share/url?url=${encodeURIComponent(`https://unit-one.ru/catalog/${service.id}`)}&text=${encodeURIComponent(service.title)}` },
                    { label: 'VK', href: `https://vk.com/share.php?url=${encodeURIComponent(`https://unit-one.ru/catalog/${service.id}`)}` },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                      padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: '11px', fontWeight: 800,
                      background: 'var(--paper-2)', color: 'var(--ink)', border: '1px solid var(--line)',
                      textDecoration: 'none', letterSpacing: '0.04em',
                      transition: 'background 0.12s',
                    }}>{s.label}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── SIMILAR ─────────────────────────────────────────────── */}
          {similar.length > 0 && (
            <div className="anim-similar" style={{ marginTop: '64px' }}>
              {/* Section header band */}
              <div style={{
                background: fmt.bg, borderRadius: 'var(--r-xl)',
                padding: '24px 28px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginBottom: '5px' }}>
                    ТАКЖЕ В КАТЕГОРИИ
                  </p>
                  <h2 style={{
                    fontFamily: 'var(--ff-display)', fontWeight: 800,
                    fontSize: '28px', color: '#fff', lineHeight: 1, letterSpacing: '-0.04em',
                  }}>
                    Похожие услуги
                  </h2>
                </div>
                <Link href={`/catalog?category=${service.category.slug}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '11px 20px', borderRadius: 'var(--r-md)',
                  background: 'rgba(255,255,255,0.12)', color: '#fff',
                  fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  letterSpacing: '-0.01em',
                }}>
                  Все в категории →
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {similar.map(s => (
                  <Link key={s.id} href={`/catalog/${s.id}`} className="sim-card" style={{
                    textDecoration: 'none', display: 'block',
                    background: '#fff', border: '1px solid var(--line)',
                    borderRadius: 'var(--r-lg)', overflow: 'hidden',
                  }}>
                    <div style={{ height: '140px', background: 'var(--paper-2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                      {s.images[0]
                        ? <img src={s.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : s.category.icon}
                    </div>
                    <div style={{ padding: '14px' }}>
                      <p style={{
                        fontSize: '13px', fontWeight: 700, color: 'var(--ink)',
                        lineHeight: 1.4, marginBottom: '10px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{s.title}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                        {s.reviews.length ? (
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            ★ {(s.reviews.reduce((a, r) => a + r.rating, 0) / s.reviews.length).toFixed(1)}
                          </span>
                        ) : <span />}
                        <span style={{
                          fontFamily: 'var(--ff-display)', fontWeight: 900,
                          fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.03em',
                        }}>
                          от {Number(s.price).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
