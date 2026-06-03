import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrder } from '@/actions/orders'
import OrderActions from './OrderActions'
import ReviewForm from './ReviewForm'
import PayButton from './PayButton'

import { REASON_LABELS } from '@/lib/disputeLabels'
import { getDisputeConfig } from '@/lib/disputeConfig'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string; desc: string }> = {
  PENDING:     { label: 'Ожидает оплаты',       color: '#d97706', bg: '#fffbeb', dot: '#d97706', desc: 'Оплатите заказ, чтобы передать исполнителю' },
  ACTIVE:      { label: 'Ожидает исполнителя',  color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6', desc: 'Оплачен — исполнитель должен выйти на связь в течение 48 ч' },
  IN_PROGRESS: { label: 'В работе',             color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6', desc: 'Исполнитель работает над заказом' },
  COMPLETED:   { label: 'Завершён',             color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e', desc: 'Заказ успешно выполнен' },
  CANCELLED:   { label: 'Отменён',              color: '#dc2626', bg: '#fef2f2', dot: '#ef4444', desc: 'Заказ отменён' },
  DISPUTED:    { label: 'Спор',                 color: '#d97706', bg: '#fffbeb', dot: '#f59e0b', desc: 'Открыт спор — ожидайте решения модератора' },
}

const LOG_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Создан', ACTIVE: 'Оплачен', IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершён', CANCELLED: 'Отменён', DISPUTED: 'Спор открыт',
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
  const [session, order, disputeCfg] = await Promise.all([getSession(), getOrder(id), getDisputeConfig()])

  if (!session) redirect('/login')
  if (!order) notFound()

  const isBuyer = order.buyerId === session.userId
  const isSeller = order.service.sellerId === session.userId
  if (!isBuyer && !isSeller && session.role !== 'ADMIN') redirect('/dashboard')

  const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
  const sellerInitials = order.service.seller.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const buyerInitials = order.buyer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
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
            {order.status === 'COMPLETED' && <span style={{ fontSize: '20px', color: '#fff' }}>✓</span>}
            {order.status === 'PENDING' && <span style={{ fontSize: '20px', color: '#fff' }}>⏳</span>}
            {order.status === 'ACTIVE' && <span style={{ fontSize: '20px', color: '#fff' }}>📬</span>}
            {order.status === 'IN_PROGRESS' && <span style={{ fontSize: '20px', color: '#fff' }}>⚙</span>}
            {order.status === 'CANCELLED' && <span style={{ fontSize: '20px', color: '#fff' }}>✕</span>}
            {order.status === 'DISPUTED' && <span style={{ fontSize: '20px', color: '#fff' }}>⚖</span>}
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

            {/* Digital files — shown to buyer after completion */}
            {isBuyer && order.status === 'COMPLETED' && (() => {
              const files = order.service.digitalFiles as { name: string; url: string; size: number }[] | null
              if (!files?.length) return null
              return (
                <div style={{
                  background: 'var(--blue-soft)',
                  border: '1.5px solid var(--blue)',
                  borderRadius: 'var(--r-lg)',
                  padding: '20px 24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.02em' }}>Ваши файлы готовы</p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{files.length} {files.length === 1 ? 'файл' : 'файла'} · доступны после оплаты</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {files.map((f, i) => (
                      <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: '#fff', borderRadius: 'var(--r-sm)',
                        padding: '12px 16px', border: '1px solid var(--line)',
                        textDecoration: 'none', transition: 'border-color 0.15s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <span style={{ fontSize: '20px', flexShrink: 0 }}>
                            {f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.zip') ? '🗜️' : f.name.endsWith('.xlsx') ? '📊' : '📝'}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{(f.size / 1024).toFixed(0)} КБ</p>
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })()}

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

            {/* Dispute info block */}
            {order.dispute && (
              <div style={{
                background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px' }}>⚖️</span>
                  <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '14px', color: '#92400e', letterSpacing: '-0.02em' }}>
                    Спор {order.dispute.status === 'OPEN' ? 'на рассмотрении' : order.dispute.status === 'CONFIRMED' ? '— подтверждён' : '— отклонён'}
                  </p>
                  <span style={{
                    marginLeft: 'auto', fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 700,
                    background: order.dispute.status === 'OPEN' ? '#fef3c7' : order.dispute.status === 'CONFIRMED' ? '#dcfce7' : '#fee2e2',
                    color: order.dispute.status === 'OPEN' ? '#92400e' : order.dispute.status === 'CONFIRMED' ? '#14532d' : '#7f1d1d',
                  }}>
                    {order.dispute.status === 'OPEN' ? 'Открыт' : order.dispute.status === 'CONFIRMED' ? 'Возврат' : 'Отклонён'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '6px' }}>
                  <strong>Причина:</strong> {REASON_LABELS[order.dispute.reason] ?? order.dispute.reason}
                </p>
                <p style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.6, marginBottom: order.dispute.resolution ? '10px' : 0 }}>
                  {order.dispute.description}
                </p>
                {order.dispute.resolution && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Решение модератора</p>
                    <p style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.5 }}>{order.dispute.resolution}</p>
                  </div>
                )}
                {order.dispute.files.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {order.dispute.files.map(f => (
                      <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: '12px', color: '#2563eb', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        📎 {f.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order log */}
            {order.logs.length > 0 && (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-out)', padding: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                  История заказа
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {order.logs.map((log, i) => {
                    const isLast = i === order.logs.length - 1
                    return (
                      <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLast ? 'var(--blue)' : 'var(--line)', marginTop: '5px' }} />
                          {!isLast && <div style={{ width: '1px', background: 'var(--line)', flex: 1, minHeight: '16px', marginTop: '4px' }} />}
                        </div>
                        <div style={{ flex: 1, paddingBottom: isLast ? 0 : '4px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                            {LOG_STATUS_LABELS[log.toStatus] ?? log.toStatus}
                          </p>
                          {log.note && <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{log.note}</p>}
                          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                            {new Date(log.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <OrderActions
              orderId={order.id}
              currentStatus={order.status}
              isBuyer={isBuyer}
              isSeller={isSeller}
              paidAt={order.paidAt}
              workStartedAt={order.workStartedAt}
              disputeDelayHours={disputeCfg.disputeDelayHours}
              autoCompleteHours={disputeCfg.autoCompleteHours}
              minDescriptionLength={disputeCfg.minDescriptionLength}
            />
          </div>
        </div>
      </main>
  )
}
