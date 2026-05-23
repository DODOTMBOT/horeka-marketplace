import { getConversations } from '@/actions/messages'
import { getSession } from '@/lib/session'
import Link from 'next/link'

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  const hr  = Math.floor(diff / 3600000)
  const day = Math.floor(diff / 86400000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин`
  if (hr < 24)  return `${hr} ч`
  return `${day} дн`
}

export default async function MessagesPage() {
  const [conversations, session] = await Promise.all([getConversations(), getSession()])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 36px' }}>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {conversations.length} {conversations.length === 1 ? 'диалог' : conversations.length < 5 ? 'диалога' : 'диалогов'}
        </p>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
          Сообщения
        </h1>
      </div>

      {conversations.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '36px', marginBottom: '12px' }}>💬</p>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Нет сообщений</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>Начните диалог со страницы услуги</p>
          <Link href="/catalog" style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--ink)', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', overflow: 'hidden' }}>
          {conversations.map((conv, i) => {
            const other = conv.participants.find(p => p.userId !== session?.userId)
            const lastMsg = conv.messages[0]
            const displayName = other?.user.companyName ?? other?.user.name ?? 'Пользователь'
            const initials = (other?.user.name ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
            const isLast = i === conversations.length - 1

            return (
              <Link key={conv.id} href={`/dashboard/messages/${conv.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
                  borderBottom: isLast ? 'none' : '1px solid var(--line)',
                  transition: 'background 0.12s',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--lime)', fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '13px',
                    overflow: 'hidden',
                  }}>
                    {other?.user.avatarUrl
                      ? <img src={other.user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                      </p>
                      {lastMsg && (
                        <span style={{ fontSize: '11px', color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(lastMsg.createdAt)}</span>
                      )}
                    </div>
                    {conv.service && (
                      <p style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 600, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.service.title}
                      </p>
                    )}
                    {lastMsg && (
                      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lastMsg.body}
                      </p>
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
