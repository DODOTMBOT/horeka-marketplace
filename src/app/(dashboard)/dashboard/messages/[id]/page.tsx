import { getConversation } from '@/actions/messages'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ChatInput from './ChatInput'

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [conversation, session] = await Promise.all([
    getConversation(id),
    getSession(),
  ])

  if (!conversation || !session) notFound()

  const other = conversation.participants.find(p => p.userId !== session.userId)
  const displayName = other?.user.companyName ?? other?.user.name ?? 'Пользователь'
  const initials = (other?.user.name ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  // Group messages by date
  let lastDate = ''

  return (
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '24px 24px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          borderBottom: 'none',
        }}>
          <Link href="/dashboard/messages" style={{
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '16px', textDecoration: 'none',
            flexShrink: 0,
          }}>
            ←
          </Link>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'var(--primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {other?.user.avatarUrl
              ? <img src={other.user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : initials}
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{displayName}</p>
            {conversation.service && (
              <Link href={`/catalog/${conversation.service.id}`} style={{ fontSize: '12px', color: 'var(--primary)' }}>
                {conversation.service.title}
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderTop: '1px solid var(--border)',
          flex: 1,
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '2px',
          minHeight: '400px', maxHeight: '520px', overflowY: 'auto',
        }}>
          {conversation.messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Начните диалог</p>
            </div>
          )}
          {conversation.messages.map((msg, i) => {
            const isMine = msg.senderId === session.userId
            const msgDate = formatDate(msg.createdAt)
            const showDate = msgDate !== lastDate
            lastDate = msgDate

            return (
              <div key={msg.id}>
                {showDate && (
                  <div style={{ textAlign: 'center', margin: '12px 0 8px' }}>
                    <span style={{
                      fontSize: '11px', color: 'var(--text-muted)',
                      background: 'var(--bg)', padding: '3px 10px', borderRadius: '50px',
                    }}>
                      {msgDate}
                    </span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  marginBottom: '4px',
                }}>
                  <div style={{
                    maxWidth: '72%',
                    background: isMine ? 'var(--primary)' : 'var(--bg)',
                    color: isMine ? '#fff' : 'var(--text)',
                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                    fontSize: '14px', lineHeight: 1.5,
                    border: isMine ? 'none' : '1px solid var(--border)',
                  }}>
                    <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.body}</p>
                    <p style={{
                      fontSize: '10px', marginTop: '4px', textAlign: 'right',
                      opacity: isMine ? 0.75 : 1,
                      color: isMine ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                    }}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div style={{
          border: '1px solid var(--border)', borderTop: 'none',
          borderRadius: '0 0 var(--radius) var(--radius)',
          overflow: 'hidden', marginBottom: '24px',
        }}>
          <ChatInput conversationId={id} />
        </div>
      </div>
  )
}
