import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDispute } from '@/actions/disputes'
import { REASON_LABELS } from '@/lib/disputeLabels'
import ResolveForm from './ResolveForm'

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  OPEN:      { label: 'Открыт',      bg: '#fef3c7', color: '#92400e' },
  CONFIRMED: { label: 'Подтверждён', bg: '#dcfce7', color: '#14532d' },
  REJECTED:  { label: 'Отклонён',    bg: '#fee2e2', color: '#7f1d1d' },
}

const LOG_LABELS: Record<string, string> = {
  PENDING: 'Создан', ACTIVE: 'Оплачен', IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершён', CANCELLED: 'Отменён', DISPUTED: 'Спор открыт',
}

export default async function AdminDisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dispute = await getDispute(id)
  if (!dispute) notFound()

  const order = dispute.order
  const st = STATUS_STYLE[dispute.status] ?? STATUS_STYLE.OPEN

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 36px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
        <Link href="/admin/disputes" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Споры</Link>
        <span>›</span>
        <span style={{ color: 'var(--ink)' }}>Спор #{id.slice(-6).toUpperCase()}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: 700, background: st.bg, color: st.color }}>
              {st.label}
            </span>
            <p style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
              {order.service.title}
            </p>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Открыт {new Date(dispute.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '24px', color: 'var(--ink)', letterSpacing: '-0.03em' }}>
          {Number(order.price).toLocaleString('ru-RU')} ₽
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Dispute details */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #fde68a', padding: '24px' }}>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Суть спора
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Причина</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#d97706' }}>{REASON_LABELS[dispute.reason] ?? dispute.reason}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Описание</p>
                <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6 }}>{dispute.description}</p>
              </div>
              {dispute.files.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Доказательства</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dispute.files.map(f => (
                      <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                        background: 'var(--paper-2)', borderRadius: '8px', textDecoration: 'none',
                      }}>
                        <span style={{ fontSize: '18px' }}>
                          {f.name.endsWith('.pdf') ? '📄' : f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? '🖼️' : '📎'}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{(f.size / 1024).toFixed(0)} КБ</p>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginLeft: 'auto' }}>
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat history */}
          {order.disputeConversation && order.disputeConversation.messages.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '24px' }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                Переписка сторон
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.disputeConversation.messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--lime)', fontSize: '11px', fontWeight: 800, overflow: 'hidden',
                    }}>
                      {msg.sender.avatarUrl
                        ? <img src={msg.sender.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : msg.sender.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>{msg.sender.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {new Date(msg.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5, background: 'var(--paper-2)', padding: '8px 12px', borderRadius: '8px' }}>
                        {msg.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order log */}
          {order.logs.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '24px' }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                История заказа
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {order.logs.map((log, i) => (
                  <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === order.logs.length - 1 ? 'var(--blue)' : 'var(--line)', marginTop: '5px' }} />
                      {i < order.logs.length - 1 && <div style={{ width: '1px', background: 'var(--line)', flex: 1, minHeight: '16px', marginTop: '4px' }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < order.logs.length - 1 ? '4px' : 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                        {LOG_LABELS[log.toStatus] ?? log.toStatus}
                      </p>
                      {log.note && <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{log.note}</p>}
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                        {new Date(log.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Parties */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '20px' }}>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '14px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Стороны
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
                  Покупатель
                </p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{order.buyer.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{order.buyer.email}</p>
                {order.buyer.phone && <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{order.buyer.phone}</p>}
              </div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
                  Исполнитель
                </p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                  {order.service.seller.companyName ?? order.service.seller.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{order.service.seller.email}</p>
                {order.service.seller.phone && <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{order.service.seller.phone}</p>}
              </div>
            </div>
          </div>

          {/* Order info */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '20px' }}>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '14px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Заказ
            </p>
            {[
              { label: 'Номер', value: `#${order.id.slice(-6).toUpperCase()}` },
              { label: 'Сумма', value: `${Number(order.price).toLocaleString('ru-RU')} ₽` },
              { label: 'Оплачен', value: order.paidAt ? new Date(order.paidAt).toLocaleDateString('ru-RU') : '—' },
              { label: 'Начало работы', value: order.workStartedAt ? new Date(order.workStartedAt).toLocaleDateString('ru-RU') : '—' },
              { label: 'Спор открыт', value: dispute.createdAt ? new Date(dispute.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{item.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '12px' }}>
              <Link href={`/dashboard/orders/${order.id}`} target="_blank" style={{
                display: 'block', textAlign: 'center', padding: '9px', borderRadius: '9px',
                border: '1.5px solid var(--line)', fontSize: '12px', fontWeight: 600,
                color: 'var(--muted)', textDecoration: 'none',
              }}>
                Открыть заказ →
              </Link>
            </div>
          </div>

          {/* Resolve */}
          {dispute.status === 'OPEN' ? (
            <ResolveForm disputeId={dispute.id} />
          ) : (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '20px' }}>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '14px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                Решение
              </p>
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: 700, background: st.bg, color: st.color }}>
                {st.label}
              </span>
              {dispute.resolution && (
                <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, marginTop: '10px' }}>{dispute.resolution}</p>
              )}
              {dispute.resolvedBy && (
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                  Модератор: {dispute.resolvedBy.name} · {dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleDateString('ru-RU') : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
