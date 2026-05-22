'use client'

import { useActionState, useState } from 'react'
import { replyToReview, type ReplyState } from '@/actions/reviews'

export default function SellerReplyForm({ reviewId, existing }: { reviewId: string; existing?: string | null }) {
  const [editing, setEditing] = useState(!existing)
  const [state, action, pending] = useActionState<ReplyState, FormData>(replyToReview, {})

  if (existing && !editing && !state.success) {
    return (
      <div style={{ marginTop: '12px', paddingLeft: '46px' }}>
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '8px', padding: '12px 14px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', marginBottom: '6px' }}>
            Ответ исполнителя
          </p>
          <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{existing}</p>
          <button
            onClick={() => setEditing(true)}
            style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Изменить ответ
          </button>
        </div>
      </div>
    )
  }

  if (state.success) {
    return (
      <div style={{ marginTop: '12px', paddingLeft: '46px' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px' }}>
          <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>✓ Ответ сохранён</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '12px', paddingLeft: '46px' }}>
      <form action={action}>
        <input type="hidden" name="reviewId" value={reviewId} />
        <textarea
          name="reply"
          defaultValue={existing ?? ''}
          rows={3}
          placeholder="Напишите ответ на отзыв..."
          style={{
            width: '100%', padding: '10px 12px', borderRadius: '8px',
            border: '1.5px solid #e5e7eb', fontSize: '13px', resize: 'vertical',
            fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box',
            background: '#f9fafb',
          }}
        />
        {state.error && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{state.error}</p>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="submit" disabled={pending} style={{
            padding: '7px 16px', borderRadius: '6px',
            background: '#16a34a', color: '#fff', fontSize: '13px', fontWeight: 600,
            border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}>
            {pending ? 'Сохраняем...' : 'Опубликовать ответ'}
          </button>
          {existing && (
            <button type="button" onClick={() => setEditing(false)} style={{
              padding: '7px 12px', borderRadius: '6px', fontSize: '13px',
              background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer', color: '#6b7280',
            }}>
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
