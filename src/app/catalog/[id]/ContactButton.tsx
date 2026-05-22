'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateConversation } from '@/actions/messages'

export default function ContactButton({ sellerId, serviceId }: { sellerId: string; serviceId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const res = await getOrCreateConversation(sellerId, serviceId)
      if ('conversationId' in res) {
        router.push(`/dashboard/messages/${res.conversationId}`)
      }
    })
  }

  return (
    <button onClick={handleClick} disabled={pending} style={{
      display: 'block', width: '100%', textAlign: 'center',
      padding: '10px', borderRadius: 'var(--radius-sm)',
      background: pending ? 'var(--border)' : 'var(--bg)',
      border: '1.5px solid var(--border)',
      fontSize: '13px', fontWeight: 600, color: 'var(--text)',
      cursor: pending ? 'not-allowed' : 'pointer',
      marginTop: '8px',
      transition: 'background 0.15s',
    }}>
      {pending ? 'Открываем чат...' : '💬 Написать исполнителю'}
    </button>
  )
}
