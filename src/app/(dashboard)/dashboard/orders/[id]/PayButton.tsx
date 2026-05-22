'use client'

import { useState } from 'react'

export default function PayButton({ orderId, amount }: { orderId: string; amount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ orderId }),
        cache: 'no-store',
      })
      const text = await res.text()
      let data: { error?: string; paymentUrl?: string }
      try {
        data = JSON.parse(text)
      } catch {
        setError(`Ошибка сервера (${res.status})`)
        setLoading(false)
        console.error('Non-JSON response:', text.slice(0, 300))
        return
      }
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }
      window.location.href = data.paymentUrl!
    } catch {
      setError('Не удалось подключиться к платёжной системе')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-sm)',
          background: loading ? '#9ca3af' : '#f97316',
          color: '#fff',
          fontSize: '15px',
          fontWeight: 700,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(249,115,22,0.35)',
          transition: 'all 0.18s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Переход к оплате...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Оплатить {amount.toLocaleString('ru-RU')} ₽
          </>
        )}
      </button>
      {error && (
        <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', textAlign: 'center' }}>{error}</p>
      )}
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center', lineHeight: 1.4 }}>
        Безопасная оплата через Т-Банк
      </p>
    </div>
  )
}
