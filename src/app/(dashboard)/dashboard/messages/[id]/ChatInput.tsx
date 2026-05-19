'use client'

import { useRef, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sendMessage } from '@/actions/messages'

export default function ChatInput({ conversationId }: { conversationId: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  // Poll for new messages every 5 seconds, only when tab is visible
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) router.refresh()
    }, 5000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = ref.current?.value?.trim()
    if (!body) return

    startTransition(async () => {
      await sendMessage(conversationId, body)
      if (ref.current) ref.current.value = ''
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      padding: '16px',
      borderTop: '1px solid var(--border)',
      background: '#fff',
      display: 'flex', gap: '10px', alignItems: 'flex-end',
    }}>
      <textarea
        ref={ref}
        placeholder="Написать сообщение... (Enter — отправить, Shift+Enter — новая строка)"
        onKeyDown={handleKeyDown}
        rows={2}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid var(--border)',
          background: 'var(--bg)',
          fontSize: '14px', color: 'var(--text)',
          resize: 'none', lineHeight: 1.5,
        }}
      />
      <button type="submit" disabled={pending} style={{
        padding: '10px 20px', borderRadius: '50px',
        background: pending ? 'var(--border)' : 'var(--primary)',
        color: '#fff', fontWeight: 700, fontSize: '14px',
        border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s',
      }}>
        {pending ? '...' : '→'}
      </button>
    </form>
  )
}
