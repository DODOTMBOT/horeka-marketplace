'use client'

import { useActionState, useState } from 'react'
import { createReview } from '@/actions/reviews'
import type { CreateReviewState } from '@/actions/reviews'

const initial: CreateReviewState = {}

export default function ReviewForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(createReview, initial)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)

  if (state.success) {
    return (
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center',
      }}>
        <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '15px' }}>✓ Отзыв опубликован</p>
      </div>
    )
  }

  return (
    <form action={action}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="rating" value={rating} />

      {/* Stars */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            style={{
              fontSize: '28px', cursor: 'pointer',
              color: i <= (hovered || rating) ? '#f59e0b' : '#d1d9e0',
              transition: 'color 0.1s',
            }}
          >
            ★
          </span>
        ))}
        {rating > 0 && (
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '4px' }}>
            {['', 'Плохо', 'Ниже среднего', 'Нормально', 'Хорошо', 'Отлично'][rating]}
          </span>
        )}
      </div>

      <textarea
        name="comment"
        placeholder="Расскажите о вашем опыте с поставщиком..."
        rows={4}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
          border: 'none', background: 'var(--bg)', boxShadow: 'var(--shadow-in)',
          fontSize: '14px', color: 'var(--text)', resize: 'vertical', marginBottom: '12px',
        }}
      />

      {state.error && (
        <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        style={{
          padding: '11px 24px', borderRadius: 'var(--radius-sm)',
          background: pending || rating === 0 ? '#fdba74' : 'var(--primary)',
          color: '#fff', fontSize: '14px', fontWeight: 700,
          cursor: pending || rating === 0 ? 'not-allowed' : 'pointer',
          boxShadow: pending || rating === 0 ? 'none' : '3px 3px 8px rgba(249,115,22,0.30)',
        }}
      >
        {pending ? 'Публикую...' : 'Опубликовать отзыв'}
      </button>
    </form>
  )
}
