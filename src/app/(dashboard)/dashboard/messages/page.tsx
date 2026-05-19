import DashboardNav from '@/components/DashboardNav'
import { getConversations } from '@/actions/messages'
import { getSession } from '@/lib/session'
import Link from 'next/link'

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(diff / 3600000)
  const day = Math.floor(diff / 86400000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин`
  if (hr < 24) return `${hr} ч`
  return `${day} дн`
}

export default async function MessagesPage() {
  const [conversations, session] = await Promise.all([
    getConversations(),
    getSession(),
  ])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active="messages" />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            Сообщения
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            {conversations.length} {conversations.length === 1 ? 'диалог' : conversations.length < 5 ? 'диалога' : 'диалогов'}
          </p>
        </div>

        {conversations.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '60px 32px',
            textAlign: 'center', boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>💬</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              Нет сообщений
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Начните диалог со страницы услуги
            </p>
            <Link href="/catalog" style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: '50px',
              background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '14px',
            }}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conversations.map(conv => {
              const other = conv.participants.find(p => p.userId !== session?.userId)
              const lastMsg = conv.messages[0]
              const displayName = other?.user.companyName ?? other?.user.name ?? 'Пользователь'
              const initials = (other?.user.name ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

              return (
                <Link key={conv.id} href={`/dashboard/messages/${conv.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card-hover" style={{
                    background: '#fff', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--primary)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px',
                      overflow: 'hidden',
                    }}>
                      {other?.user.avatarUrl
                        ? <img src={other.user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {displayName}
                        </p>
                        {lastMsg && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                            {timeAgo(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>
                      {conv.service && (
                        <p style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.service.title}
                        </p>
                      )}
                      {lastMsg && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lastMsg.body}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
