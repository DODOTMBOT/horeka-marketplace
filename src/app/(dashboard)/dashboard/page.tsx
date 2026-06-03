import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getDashboardStats } from '@/actions/orders'
import InnVerification from './InnVerification'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isSeller = session.role === 'SELLER' || session.role === 'ADMIN'

  const [user, stats, recentOrders, recentReviews] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        inn: true, innVerified: true, companyName: true, role: true,
        avatarUrl: true, phone: true, createdAt: true, businessType: true,
      },
    }),
    getDashboardStats(),
    isSeller
      ? prisma.order.findMany({
          where: { service: { sellerId: session.userId } },
          include: { service: { select: { title: true } }, buyer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 6,
        })
      : prisma.order.findMany({
          where: { buyerId: session.userId },
          include: { service: { select: { title: true, seller: { select: { name: true, companyName: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 6,
        }),
    isSeller
      ? prisma.review.findMany({
          where: { service: { sellerId: session.userId } },
          include: {
            service: { select: { title: true } },
            author: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 4,
        })
      : prisma.review.findMany({
          where: { authorId: session.userId },
          include: {
            service: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 4,
        }),
  ])

  const initials = session.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    PENDING:     { label: 'Ожидает оплаты', color: '#b45309', bg: '#fef3c7', dot: '#d97706' },
    ACTIVE:      { label: 'Активен',        color: '#1d4ed8', bg: '#dbeafe', dot: '#3b82f6' },
    IN_PROGRESS: { label: 'В работе',       color: '#6d28d9', bg: '#ede9fe', dot: '#8b5cf6' },
    COMPLETED:   { label: 'Завершён',       color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
    CANCELLED:   { label: 'Отменён',        color: '#b91c1c', bg: '#fee2e2', dot: '#ef4444' },
    DISPUTED:    { label: 'Спор',           color: '#c2410c', bg: '#ffedd5', dot: '#f97316' },
  }

  const BIZ_LABELS: Record<string, string> = {
    SELF_EMPLOYED: 'Самозанятый', IP: 'ИП', COMPANY: 'ООО',
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Greeting */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2px' }}>
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
            Привет, {session.name.split(' ')[0]}
          </h1>
        </div>
        {isSeller && (
          <Link href="/dashboard/services/new" style={{
            padding: '9px 20px', borderRadius: '10px',
            background: 'var(--ink)', color: 'var(--lime)',
            fontSize: '13px', fontWeight: 800, textDecoration: 'none',
            letterSpacing: '-0.01em', flexShrink: 0,
            fontFamily: 'var(--ff-display)',
          }}>
            + Добавить услугу
          </Link>
        )}
      </div>

      {/* 2-col grid — stretch so both columns are same height */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'stretch' }}>

        {/* ── LEFT: Profile ── */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Avatar + Name + role */}
          <div style={{ padding: '28px 20px 18px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
            {/* Avatar */}
            <div style={{ marginBottom: '14px' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt=""
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--line)', display: 'inline-block' }} />
              ) : (
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--ink)', border: '3px solid var(--line)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '24px', color: 'var(--lime)',
                }}>
                  {initials}
                </div>
              )}
            </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '17px', color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {session.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                background: isSeller ? '#dbeafe' : 'var(--paper-2)',
                color: isSeller ? '#1d4ed8' : 'var(--muted)',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                {isSeller ? (user?.businessType ? BIZ_LABELS[user.businessType] ?? 'Исполнитель' : 'Исполнитель') : 'Покупатель'}
              </span>
              {user?.innVerified && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  padding: '3px 10px', borderRadius: '999px',
                  background: '#dcfce7', color: '#15803d',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  ✓ ИНН
                </span>
              )}
            </div>
            {memberSince && (
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '5px' }}>
                На платформе с {memberSince}
              </p>
            )}
          </div>
          </div>

          {/* Contacts */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {[
              { lbl: 'Email', val: session.email, mono: true },
              { lbl: 'Телефон', val: user?.phone ?? null },
              ...(user?.companyName ? [{ lbl: 'Компания', val: user.companyName }] : []),
            ].map(({ lbl, val, mono }) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                  {lbl}
                </span>
                <span style={{
                  fontSize: '13px', color: val ? 'var(--ink)' : 'var(--muted)',
                  fontWeight: val ? 500 : 400,
                  fontFamily: mono ? 'var(--ff-mono)' : 'inherit',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '170px', textAlign: 'right',
                }}>
                  {val ?? 'Не указан'}
                </span>
              </div>
            ))}

            {/* INN row */}
            {user?.inn && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ИНН
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '13px', fontWeight: 600,
                  color: user.innVerified ? '#15803d' : '#b45309',
                  fontFamily: 'var(--ff-mono)',
                }}>
                  {user.inn}
                  <span style={{ fontFamily: 'var(--ff-display)', fontSize: '11px' }}>{user.innVerified ? '✓' : '⏳'}</span>
                </span>
              </div>
            )}
          </div>

          {/* INN Verification (if not done) */}
          {!user?.innVerified && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Верификация ИНН
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                Подтвердите ИНН — повышает доверие и открывает выплаты
              </p>
              <InnVerification
                currentInn={user?.inn ?? null}
                isVerified={user?.innVerified ?? false}
                companyName={user?.companyName ?? null}
              />
            </div>
          )}

          {/* Spacer — pushes edit button to bottom */}
          <div style={{ flex: 1 }} />

          {/* Edit button */}
          <div style={{ padding: '16px 20px' }}>
            <Link href="/dashboard/profile" style={{
              display: 'block', textAlign: 'center',
              padding: '10px', borderRadius: '10px',
              border: '1.5px solid var(--line)',
              color: 'var(--ink)', fontSize: '13px', fontWeight: 700,
              textDecoration: 'none', background: 'var(--paper-2)',
            }}>
              Редактировать профиль
            </Link>
          </div>
        </div>

        {/* ── RIGHT column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Orders block */}
          <div style={{
            background: '#fff', borderRadius: '20px',
            border: '1px solid var(--line)', overflow: 'hidden',
            flex: '1',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: '1px solid var(--line)',
            }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                {isSeller ? 'Входящие заказы' : 'Мои заказы'}
              </p>
              <Link href={isSeller ? '/dashboard/orders/incoming' : '/dashboard/orders'} style={{
                padding: '6px 14px', borderRadius: '8px',
                background: 'var(--paper-2)', border: '1px solid var(--line)',
                color: 'var(--ink)', fontSize: '12px', fontWeight: 700,
                textDecoration: 'none',
              }}>
                Все заказы →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>📬</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Заказов пока нет</p>
                <Link href={isSeller ? '/dashboard/services/new' : '/catalog'} style={{
                  display: 'inline-block', marginTop: '12px', fontSize: '13px',
                  color: 'var(--blue)', fontWeight: 600, textDecoration: 'none',
                }}>
                  {isSeller ? 'Добавить услугу →' : 'Перейти в каталог →'}
                </Link>
              </div>
            ) : (
              <div>
                {recentOrders.map((order, i) => {
                  const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
                  const isLast = i === recentOrders.length - 1
                  const counterpart = isSeller
                    ? (order as { buyer: { name: string } }).buyer?.name
                    : ((order as { service: { seller: { companyName: string | null; name: string } } }).service.seller?.companyName
                        ?? (order as { service: { seller: { name: string } } }).service.seller?.name)

                  return (
                    <Link key={order.id} href={`/dashboard/orders/${order.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '13px 24px', textDecoration: 'none',
                      borderBottom: isLast ? 'none' : '1px solid var(--line)',
                      background: 'transparent',
                    }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: st.dot, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '1px' }}>
                          {order.service.title}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {counterpart} · {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'var(--ff-display)', fontSize: '14px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '3px' }}>
                          {Number(order.price).toLocaleString('ru-RU')} ₽
                        </p>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
                          background: st.bg, color: st.color,
                          fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
                        }}>
                          {st.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Stats + Reviews */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Stats */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--line)', padding: '20px 24px' }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                Статистика
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { num: String(stats?.orders ?? 0),   lbl: 'Заказов',   accent: 'var(--blue)' },
                  { num: String(stats?.reviews ?? 0),  lbl: 'Отзывов',   accent: '#7c3aed' },
                  ...(isSeller ? [
                    { num: String(stats?.services ?? 0), lbl: 'Услуг',     accent: '#0f766e' },
                    { num: stats?.rating ? `${stats.rating}` : '—', lbl: 'Рейтинг', accent: '#d97706' },
                  ] : [
                    { num: String((stats as { completed?: number })?.completed ?? 0), lbl: 'Завершено', accent: '#15803d' },
                    { num: String((stats as { pending?: number })?.pending ?? 0),     lbl: 'В ожидании', accent: '#d97706' },
                  ]),
                ].map(({ num, lbl, accent }) => (
                  <div key={lbl} style={{
                    background: 'var(--paper-2)', borderRadius: '12px', padding: '14px 16px',
                  }}>
                    <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '28px', color: accent, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {num}
                    </p>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {lbl}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(isSeller ? [
                  { href: '/dashboard/services',       label: 'Мои услуги' },
                  { href: '/dashboard/orders/incoming', label: 'Входящие заказы' },
                ] : [
                  { href: '/catalog',           label: 'Каталог услуг' },
                  { href: '/dashboard/orders',  label: 'Мои заказы' },
                ]).map(({ href, label }) => (
                  <Link key={href} href={href} style={{
                    fontSize: '12px', fontWeight: 600, color: 'var(--blue)',
                    textDecoration: 'none', padding: '3px 0',
                  }}>
                    → {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid var(--line)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  Отзывы
                </p>
                {stats?.rating && (
                  <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: '#d97706' }}>
                    ★ {stats.rating}
                  </span>
                )}
              </div>

              {!isSeller && recentReviews.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '12px' }}>
                  <p style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                    Отзывы можно оставить после завершения заказа
                  </p>
                  <Link href="/dashboard/orders" style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>
                    К заказам →
                  </Link>
                </div>
              ) : recentReviews.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '12px' }}>
                  <p style={{ fontSize: '24px', marginBottom: '8px' }}>💬</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>Отзывов пока нет</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentReviews.map(r => {
                    const rAny = r as unknown as { author?: { name: string; avatarUrl: string | null }; service: { title: string } }
                    const displayName = isSeller
                      ? rAny.author?.name
                      : rAny.service.title
                    const avatarUrl = isSeller
                      ? rAny.author?.avatarUrl ?? null
                      : null
                    const nameInitials = displayName ? displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() : '?'
                    return (
                      <div key={r.id} style={{
                        background: 'var(--paper-2)', borderRadius: '10px', padding: '12px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: r.comment ? '6px' : '0' }}>
                          {avatarUrl ? (
                            <img src={avatarUrl} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
                          ) : (
                            <div style={{
                              width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                              background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '9px', fontWeight: 800, color: 'var(--lime)', fontFamily: 'var(--ff-display)',
                            }}>
                              {nameInitials}
                            </div>
                          )}
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayName}
                          </span>
                          <span style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                        </div>
                        {r.comment && (
                          <p style={{
                            fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          }}>
                            {r.comment}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  <Link href="/dashboard/profile" style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none', textAlign: 'center', paddingTop: '2px' }}>
                    Все отзывы →
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
