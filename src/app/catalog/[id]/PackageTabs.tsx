'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ServicePackage } from '@/actions/services'
import OrderForm from './OrderForm'

const TIER_LABELS: Record<string, string> = {
  basic: 'Базовый',
  standard: 'Стандарт',
  premium: 'Премиум',
}

export default function PackageTabs({
  packages,
  serviceId,
  isLoggedIn,
  isOwner,
}: {
  packages: ServicePackage[]
  serviceId: string
  isLoggedIn: boolean
  isOwner?: boolean
}) {
  const [active, setActive] = useState(0)
  const pkg = packages[active]

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-out)', overflow: 'hidden', marginBottom: '20px',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {packages.map((p, i) => (
          <button
            key={p.tier}
            type="button"
            onClick={() => setActive(i)}
            style={{
              flex: 1, padding: '12px 8px',
              fontSize: '13px', fontWeight: 600,
              color: active === i ? 'var(--primary)' : 'var(--text-muted)',
              background: active === i ? '#fff3eb' : 'transparent',
              borderBottom: active === i ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {TIER_LABELS[p.tier] ?? p.tier}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{pkg.name}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>{pkg.description}</p>

        <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-in)', padding: '12px', textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Срок выполнения</p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{pkg.deliveryDays} дней</p>
        </div>

        <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
          {Number(pkg.price).toLocaleString('ru-RU')} ₽
        </p>

        {isOwner ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Это ваша услуга</p>
        ) : isLoggedIn ? (
          <OrderForm serviceId={serviceId} price={pkg.price} packageTier={pkg.tier} packageName={TIER_LABELS[pkg.tier]} />
        ) : (
          <Link href="/login" style={{
            display: 'block', textAlign: 'center',
            padding: '14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 700,
            boxShadow: '4px 4px 12px rgba(249,115,22,0.35)',
          }}>
            Войдите для заказа
          </Link>
        )}
      </div>
    </div>
  )
}
