import { getDisputes } from '@/actions/disputes'
import { REASON_LABELS } from '@/lib/disputeLabels'
import Link from 'next/link'

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(diff / 3600000)
  const day = Math.floor(diff / 86400000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин назад`
  if (hr < 24) return `${hr} ч назад`
  return `${day} дн назад`
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  OPEN:      { label: 'Открыт',   bg: '#fef3c7', color: '#92400e' },
  CONFIRMED: { label: 'Подтверждён', bg: '#dcfce7', color: '#14532d' },
  REJECTED:  { label: 'Отклонён', bg: '#fee2e2', color: '#7f1d1d' },
}

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const validFilter = ['OPEN', 'CONFIRMED', 'REJECTED'].includes(filter ?? '') ? filter as 'OPEN' | 'CONFIRMED' | 'REJECTED' : undefined
  const disputes = await getDisputes(validFilter)

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Модерация
          </p>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
            Споры
          </h1>
        </div>
        <Link
          href="/admin/disputes/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.15s',
          }}
        >
          ⚙ Настройки
        </Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Все', value: '' },
          { label: 'Открытые', value: 'OPEN' },
          { label: 'Подтверждённые', value: 'CONFIRMED' },
          { label: 'Отклонённые', value: 'REJECTED' },
        ].map(tab => {
          const active = (filter ?? '') === tab.value
          return (
            <Link key={tab.value} href={tab.value ? `/admin/disputes?filter=${tab.value}` : '/admin/disputes'} style={{
              padding: '7px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
              background: active ? 'var(--ink)' : '#fff',
              color: active ? '#fff' : 'var(--muted)',
              border: `1.5px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
            }}>
              {tab.label}
            </Link>
          )
        })}
      </div>

      {disputes.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '36px', marginBottom: '12px' }}>⚖️</p>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Споров нет</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Здесь появятся споры от покупателей</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
          {disputes.map((dispute, i) => {
            const st = STATUS_STYLE[dispute.status] ?? STATUS_STYLE.OPEN
            const isLast = i === disputes.length - 1
            return (
              <Link key={dispute.id} href={`/admin/disputes/${dispute.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                  borderBottom: isLast ? 'none' : '1px solid var(--line)',
                  background: dispute.status === 'OPEN' ? 'rgba(217,119,6,0.03)' : 'transparent',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dispute.order.service.title}
                      </p>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {REASON_LABELS[dispute.reason] ?? dispute.reason} · {dispute.openedBy.name} · {timeAgo(dispute.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--ff-display)' }}>
                      {Number(dispute.order.price).toLocaleString('ru-RU')} ₽
                    </p>
                    {dispute.files.length > 0 && (
                      <p style={{ fontSize: '11px', color: 'var(--muted)' }}>📎 {dispute.files.length} файл{dispute.files.length > 1 ? 'а' : ''}</p>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
