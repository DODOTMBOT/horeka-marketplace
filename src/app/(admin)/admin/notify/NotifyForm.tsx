'use client'

import { useActionState } from 'react'
import { sendAdminNotification } from '@/actions/admin'

type User = { id: string; name: string; email: string }

export function NotifyForm({ users }: { users: User[] }) {
  const [state, action, pending] = useActionState(sendAdminNotification, {})

  const inputStyle = {
    padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '6px',
    fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' as const,
  }

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
          Получатель
        </label>
        <select name="target" required style={{ ...inputStyle, background: '#fff' }}>
          <option value="ALL">Все пользователи</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
          Заголовок
        </label>
        <input name="title" required placeholder="Например: Важное обновление" style={inputStyle} />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
          Текст уведомления
        </label>
        <textarea name="body" required rows={4} placeholder="Текст сообщения..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
      </div>

      {state.error && (
        <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', color: '#dc2626' }}>
          {state.error}
        </div>
      )}
      {state.success && (
        <div style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
          Уведомление отправлено
        </div>
      )}

      <button type="submit" disabled={pending} style={{
        padding: '10px', borderRadius: '6px', background: '#111827', color: '#fff',
        border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
        opacity: pending ? 0.6 : 1,
      }}>
        {pending ? 'Отправка...' : 'Отправить уведомление'}
      </button>
    </form>
  )
}
