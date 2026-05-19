import DashboardNav from '@/components/DashboardNav'
import { getNotifications, markAllRead } from '@/actions/notifications'
import Link from 'next/link'

const typeIcon: Record<string, string> = {
  ORDER_NEW: '🛍️',
  ORDER_STATUS: '📦',
  REVIEW_NEW: '⭐',
  MESSAGE_NEW: '💬',
}

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

export default async function NotificationsPage() {
  const notifications = await getNotifications()
  const unread = notifications.filter(n => !n.read)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active="notifications" />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
              Уведомления
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              {unread.length > 0 ? `${unread.length} непрочитанных` : 'Все прочитаны'}
            </p>
          </div>
          {unread.length > 0 && (
            <form action={markAllRead}>
              <button type="submit" style={{
                padding: '8px 18px', borderRadius: '50px',
                background: 'transparent', border: '1.5px solid var(--border)',
                fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)',
                cursor: 'pointer',
              }}>
                Прочитать все
              </button>
            </form>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '60px 32px',
            textAlign: 'center', boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔔</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              Нет уведомлений
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Здесь появятся уведомления о заказах и отзывах
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map(n => {
              const inner = (
                <div style={{
                  background: n.read ? '#fff' : 'var(--primary-light)',
                  border: `1px solid ${n.read ? 'var(--border)' : '#fed7aa'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'background 0.15s',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: n.read ? 'var(--bg)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0,
                    border: '1px solid var(--border)',
                  }}>
                    {typeIcon[n.type] ?? '🔔'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: n.read ? 500 : 700, color: 'var(--text)' }}>
                        {n.title}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.5 }}>
                      {n.body}
                    </p>
                  </div>
                  {!n.read && (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: 'var(--primary)', flexShrink: 0, marginTop: '4px',
                    }} />
                  )}
                </div>
              )

              return n.link ? (
                <Link key={n.id} href={n.link} style={{ textDecoration: 'none' }}>{inner}</Link>
              ) : (
                <div key={n.id}>{inner}</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
