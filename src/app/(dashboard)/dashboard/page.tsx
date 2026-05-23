import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getDashboardStats } from '@/actions/orders'
import InnVerification from './InnVerification'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user, stats, recentOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { inn: true, innVerified: true, companyName: true, role: true, avatarUrl: true, phone: true, createdAt: true },
    }),
    getDashboardStats(),
    session.role === 'SELLER' || session.role === 'ADMIN'
      ? prisma.order.findMany({
          where: { service: { sellerId: session.userId } },
          include: { service: { select: { title: true } }, buyer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      : prisma.order.findMany({
          where: { buyerId: session.userId },
          include: { service: { select: { title: true, seller: { select: { name: true, companyName: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
  ])

  const isSeller = session.role === 'SELLER' || session.role === 'ADMIN'
  const initials = session.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
    PENDING:   { label: 'Ожидает',  color: '#92400e', dot: '#d97706' },
    ACTIVE:    { label: 'В работе', color: '#1e40af', dot: '#3b82f6' },
    COMPLETED: { label: 'Завершён', color: '#14532d', dot: '#22c55e' },
    CANCELLED: { label: 'Отменён',  color: '#7f1d1d', dot: '#ef4444' },
    DISPUTED:  { label: 'Спор',     color: '#4c1d95', dot: '#8b5cf6' },
  }

  const card = (children: React.ReactNode) => (
    <div style={{
      background: '#fff', borderRadius: '16px',
      border: '1px solid var(--line, #DEDACB)',
      padding: '24px',
    }}>
      {children}
    </div>
  )

  const label = (text: string) => (
    <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted, #7A7568)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
      {text}
    </p>
  )

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted, #7A7568)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 800, color: 'var(--ink, #0F0F12)', letterSpacing: '-0.03em' }}>
            Привет, {session.name.split(' ')[0]} 👋
          </h1>
        </div>
        {isSeller && (
          <Link href="/dashboard/services/new" style={{
            padding: '10px 22px', borderRadius: '10px',
            background: 'var(--ink, #0F0F12)', color: '#fff',
            fontSize: '13px', fontWeight: 700, textDecoration: 'none',
            letterSpacing: '-0.01em', flexShrink: 0,
          }}>
            + Добавить услугу
          </Link>
        )}
      </div>

      {/* Top grid: profile + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Profile card */}
        {card(
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--ink, #0F0F12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '20px', color: 'var(--lime, #D7FF3A)',
                }}>
                  {initials}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '17px', color: 'var(--ink, #0F0F12)', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                  {session.name}
                </h2>
                <span style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
                  background: isSeller ? 'var(--ink, #0F0F12)' : 'var(--paper-2, #ECE9DD)',
                  color: isSeller ? 'var(--lime, #D7FF3A)' : 'var(--muted, #7A7568)',
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {isSeller ? 'Исполнитель' : 'Покупатель'}
                </span>
              </div>
              <Link href="/dashboard/profile" style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: '8px',
                border: '1.5px solid var(--line, #DEDACB)',
                fontSize: '12px', fontWeight: 600, color: 'var(--muted, #7A7568)',
                textDecoration: 'none',
              }}>
                Изменить
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  {label('Email')}
                  <p style={{ fontSize: '13px', color: 'var(--ink, #0F0F12)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.email}</p>
                </div>
                <div>
                  {label('Телефон')}
                  <p style={{ fontSize: '13px', color: user?.phone ? 'var(--ink, #0F0F12)' : 'var(--muted, #7A7568)', fontWeight: 500 }}>
                    {user?.phone ?? 'Не указан'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {user?.companyName && (
                  <div>
                    {label('Компания')}
                    <p style={{ fontSize: '13px', color: 'var(--ink, #0F0F12)', fontWeight: 500 }}>{user.companyName}</p>
                  </div>
                )}
                <div>
                  {label('Дата регистрации')}
                  <p style={{ fontSize: '13px', color: 'var(--ink, #0F0F12)', fontWeight: 500 }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--line, #DEDACB)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: user?.innVerified ? '#22c55e' : '#d97706',
                }} />
                <span style={{ fontSize: '12px', color: 'var(--muted, #7A7568)' }}>
                  ИНН {user?.innVerified ? `верифицирован — ${user.inn}` : (user?.inn ? `на проверке — ${user.inn}` : 'не указан')}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Stats card */}
        {card(
          <>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink, #0F0F12)', letterSpacing: '-0.02em', marginBottom: '20px' }}>
              Статистика
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { num: String(stats?.orders ?? 0), label: 'Заказов' },
                { num: String(stats?.reviews ?? 0), label: 'Отзывов' },
                ...(isSeller ? [
                  { num: String(stats?.services ?? 0), label: 'Услуг активных' },
                  { num: stats?.rating ? `★ ${stats.rating}` : '—', label: 'Рейтинг' },
                ] : []),
              ].map(({ num, label: lbl }) => (
                <div key={lbl} style={{
                  background: 'var(--paper-2, #ECE9DD)', borderRadius: '12px',
                  padding: '16px 18px',
                }}>
                  <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '28px', color: 'var(--ink, #0F0F12)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {num}
                  </p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted, #7A7568)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {lbl}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line, #DEDACB)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(isSeller ? [
                { href: '/dashboard/services', label: 'Мои услуги →' },
                { href: '/dashboard/orders/incoming', label: 'Входящие заказы →' },
              ] : [
                { href: '/catalog', label: 'Перейти в каталог →' },
                { href: '/dashboard/orders', label: 'Мои заказы →' },
              ]).map(({ href, label: lbl }) => (
                <Link key={href} href={href} style={{
                  fontSize: '13px', fontWeight: 600, color: 'var(--blue, #3D5AFE)',
                  textDecoration: 'none', padding: '4px 0',
                }}>
                  {lbl}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent activity */}
      <div style={{ marginBottom: '16px' }}>
        {card(
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink, #0F0F12)', letterSpacing: '-0.02em' }}>
                {isSeller ? 'Последние входящие заказы' : 'Последние заказы'}
              </p>
              <Link href={isSeller ? '/dashboard/orders/incoming' : '/dashboard/orders'} style={{
                fontSize: '12px', fontWeight: 600, color: 'var(--muted, #7A7568)', textDecoration: 'none',
              }}>
                Все заказы →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--muted, #7A7568)', padding: '20px 0', textAlign: 'center' }}>
                Заказов пока нет
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentOrders.map((order, i) => {
                  const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
                  const isLast = i === recentOrders.length - 1
                  const counterpart = isSeller
                    ? (order as { buyer: { name: string } }).buyer?.name
                    : ((order as { service: { seller: { companyName: string | null; name: string } } }).service.seller.companyName ?? (order as { service: { seller: { name: string } } }).service.seller.name)

                  return (
                    <Link key={order.id} href={`/dashboard/orders/${order.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '12px 0', textDecoration: 'none',
                      borderBottom: isLast ? 'none' : '1px solid var(--line, #DEDACB)',
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink, #0F0F12)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.service.title}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--muted, #7A7568)', marginTop: '2px' }}>
                          {counterpart} · {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink, #0F0F12)', fontFamily: 'var(--ff-display)', letterSpacing: '-0.02em' }}>
                          {Number(order.price).toLocaleString('ru-RU')} ₽
                        </p>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: st.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {st.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* INN verification if not verified */}
      {!user?.innVerified && (
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1.5px solid var(--line, #DEDACB)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }} />
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink, #0F0F12)', letterSpacing: '-0.02em' }}>
              Верификация ИНН
            </p>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
              Не выполнена
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted, #7A7568)', marginBottom: '16px', lineHeight: 1.6 }}>
            Верификация подтверждает вашу регистрацию в ФНС и повышает доверие покупателей.
          </p>
          <InnVerification
            currentInn={user?.inn ?? null}
            isVerified={user?.innVerified ?? false}
            companyName={user?.companyName ?? null}
          />
        </div>
      )}
    </div>
  )
}
