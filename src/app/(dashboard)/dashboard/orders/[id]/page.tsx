import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrder } from '@/actions/orders'
import DashboardNav from '@/components/DashboardNav'
import OrderActions from './OrderActions'
import ReviewForm from './ReviewForm'
import PayButton from './PayButton'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  PENDING:   { label: 'Ожидает принятия', color: '#d97706', bg: '#fffbeb', desc: 'Исполнитель ещё не принял заказ' },
  ACTIVE:    { label: 'В работе',         color: '#2563eb', bg: '#eff6ff', desc: 'Исполнитель выполняет заказ' },
  COMPLETED: { label: 'Завершён',         color: '#16a34a', bg: '#f0fdf4', desc: 'Заказ успешно выполнен' },
  CANCELLED: { label: 'Отменён',          color: '#dc2626', bg: '#fef2f2', desc: 'Заказ отменён' },
  DISPUTED:  { label: 'Спор',             color: '#7c3aed', bg: '#f5f3ff', desc: 'Открыт спор' },
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ payment?: string }>
}) {
  const { id } = await params
  const { payment } = await searchParams
  const [session, order] = await Promise.all([getSession(), getOrder(id)])

  if (!session) redirect('/login')
  if (!order) notFound()

  const isBuyer = order.buyerId === session.userId
  const isSeller = order.service.sellerId === session.userId
  if (!isBuyer && !isSeller && session.role !== 'ADMIN') redirect('/dashboard')

  const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
  const sellerInitials = order.service.seller.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const buyerInitials = order.buyer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active={isBuyer ? 'orders' : 'incoming'} />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', display: 'flex', gap: '8px' }}>
          <Link href={isBuyer ? '/dashboard/orders' : '/dashboard/orders/incoming'}>
            {isBuyer ? 'Мои заказы' : 'Входящие заказы'}
          </Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>Заказ #{id.slice(-6).toUpperCase()}</span>
        </div>

        {/* Status banner */}
        <div style={{
          background: st.bg, borderRadius: 'var(--radius)',
          border: `1px solid ${st.color}30`, padding: '20px 24px',
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
            background: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {order.status === 'COMPLETED' && <span style={{ fontSize: '20px' }}>✓</span>}
            {order.status === 'PENDING' && <span style={{ fontSize: '20px', color: '#fff' }}>⏳</span>}
            {order.status === 'ACTIVE' && <span style={{ fontSize: '20px', color: '#fff' }}>⚙</span>}
            {order.status === 'CANCELLED' && <span style={{ fontSize: '20px', color: '#fff' }}>✕</span>}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '16px', color: st.color }}>{st.label}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{st.desc}</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', flexShrink: 0 }}>
            {Number(order.price).toLocaleString('ru-RU')} ₽
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Service */}
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-out)', padding: '24px',
            }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Услуга
              </p>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '10px', flexShrink: 0,
                  background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', fontSize: '24px',
                }}>
                  {order.service.images[0]
                    ? <img src={order.service.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : order.service.category.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '3px' }}>
                    {order.service.title}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.service.category.name}</p>
                </div>
                <Link href={`/catalog/${order.service.id}`} style={{
                  marginLeft: 'auto', padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)', boxShadow: 'var(--shadow-sm)',
                  fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                  flexShrink: 0,
                }}>
                  Открыть
                </Link>
              </div>
            </div>

            {/* Comment */}
            {order.comment && (
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-out)', padding: '24px',
              }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Комментарий к заказу
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  «{order.comment}»
                </p>
              </div>
            )}

            {/* Review form / existing review */}
            {isBuyer && order.status === 'COMPLETED' && (
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-out)', padding: '24px',
              }}>
                {order.review ? (
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                      Ваш отзыв
                    </p>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {[1,2,3,4,5].map(i => (
                        <span key={i} style={{ color: i <= order.review!.rating ? '#f59e0b' : '#d1d9e0', fontSize: '18px' }}>★</span>
                      ))}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>{order.review.comment}</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                      Оставьте отзыв
                    </p>
                    <ReviewForm orderId={order.id} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Seller */}
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-out)', padding: '20px',
            }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Поставщик
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px',
                }}>
                  {sellerInitials}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
                      {order.service.seller.companyName ?? order.service.seller.name}
                    </p>
                    {order.service.seller.innVerified && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer (visible to seller) */}
            {isSeller && (
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-out)', padding: '20px',
              }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Покупатель
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: '#64748b', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px',
                  }}>
                    {buyerInitials}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{order.buyer.name}</p>
                    {order.buyer.phone && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.buyer.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-out)', padding: '20px',
            }}>
              {[
                { label: 'Номер заказа', value: `#${id.slice(-6).toUpperCase()}` },
                { label: 'Дата', value: new Date(order.createdAt).toLocaleDateString('ru-RU') },
                { label: 'Сумма', value: `${Number(order.price).toLocaleString('ru-RU')} ₽` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Payment */}
            {isBuyer && !order.paid && order.status === 'PENDING' && (
              <div style={{
                background: 'var(--surface)', borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-out)', padding: '20px',
              }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                  Оплата
                </p>
                {payment === 'success' ? (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <p style={{ fontSize: '24px', marginBottom: '6px' }}>✅</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>Оплата прошла!</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Заказ передан исполнителю</p>
                  </div>
                ) : payment === 'fail' ? (
                  <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <p style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>Оплата не прошла</p>
                    <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>Попробуйте ещё раз</p>
                  </div>
                ) : null}
                {payment !== 'success' && (
                  <PayButton orderId={order.id} amount={Number(order.price)} />
                )}
              </div>
            )}

            {isBuyer && order.paid && (
              <div style={{
                background: '#f0fdf4', borderRadius: 'var(--radius)',
                border: '1px solid #bbf7d0', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>Оплачено</p>
                  <p style={{ fontSize: '12px', color: '#4ade80' }}>{Number(order.price).toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <OrderActions orderId={order.id} currentStatus={order.status} isBuyer={isBuyer} isSeller={isSeller} />
          </div>
        </div>
      </main>
    </div>
  )
}
