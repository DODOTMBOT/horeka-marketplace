import { getNotifications, markAllRead } from '@/actions/notifications'
import Link from 'next/link'

const TYPE_ICON: Record<string, string> = {
  ORDER_NEW: '🛍️', ORDER_STATUS: '📦', REVIEW_NEW: '⭐', MESSAGE_NEW: '💬',
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  const hr  = Math.floor(diff / 3600000)
  const day = Math.floor(diff / 86400000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин назад`
  if (hr < 24)  return `${hr} ч назад`
  return `${day} дн назад`
}

export default async function NotificationsPage() {
  const notifications = await getNotifications()
  const unread = notifications.filter(n => !n.read)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 36px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {unread.length > 0 ? `${unread.length} непрочитанных` : 'Все прочитаны'}
          </p>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
            Уведомления
          </h1>
        </div>
        {unread.length > 0 && (
          <form action={markAllRead}>
            <button type="submit" style={{
              padding: '9px 18px', borderRadius: '9px',
              background: 'transparent', border: '1.5px solid var(--line)',
              fontSize: '13px', fontWeight: 600, color: 'var(--muted)', cursor: 'pointer',
            }}>
              Прочитать все
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '36px', marginBottom: '12px' }}>🔔</p>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Нет уведомлений</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>Здесь появятся уведомления о заказах и отзывах</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
          {notifications.map((n, i) => {
            const isLast = i === notifications.length - 1
            const inner = (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px',
                borderBottom: isLast ? 'none' : '1px solid var(--line)',
                background: n.read ? 'transparent' : 'rgba(61,90,254,0.03)',
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: n.read ? 'var(--paper-2)' : 'var(--paper-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                }}>
                  {TYPE_ICON[n.type] ?? '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: n.read ? 500 : 700, color: 'var(--ink)', lineHeight: 1.4 }}>
                      {n.title}
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.5 }}>{n.body}</p>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            )
            return n.link
              ? <Link key={n.id} href={n.link} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
              : <div key={n.id}>{inner}</div>
          })}
        </div>
      )}
    </div>
  )
}
