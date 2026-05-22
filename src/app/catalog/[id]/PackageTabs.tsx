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
      background: '#fff', border: '1.5px solid #ebebeb',
      borderRadius: '8px', overflow: 'hidden',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #ebebeb' }}>
        {packages.map((p, i) => (
          <button
            key={p.tier}
            type="button"
            onClick={() => setActive(i)}
            style={{
              flex: 1, padding: '12px 8px',
              fontSize: '11px', fontWeight: 800,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: active === i ? '#111' : '#aaa',
              background: active === i ? '#fff' : '#fafafa',
              borderBottom: active === i ? '2px solid #111' : '2px solid transparent',
              borderRight: i < packages.length - 1 ? '1px solid #ebebeb' : 'none',
              transition: 'all 0.15s', cursor: 'pointer', border: 'none',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: active === i ? '#111' : 'transparent',
            }}
          >
            {TIER_LABELS[p.tier] ?? p.tier}
          </button>
        ))}
      </div>

      <div style={{ padding: '22px' }}>
        <p style={{ fontSize: '10px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          {TIER_LABELS[pkg.tier] ?? pkg.tier}
        </p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '8px', letterSpacing: '-0.2px' }}>{pkg.name}</p>
        <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginBottom: '16px' }}>{pkg.description}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', borderRadius: '4px', padding: '10px 14px', marginBottom: '18px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Срок выполнения
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#111', marginLeft: 'auto' }}>{pkg.deliveryDays} дней</span>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Стоимость</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginTop: '4px' }}>
            <span style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontStyle: 'italic', fontSize: '38px', fontWeight: 900,
              color: '#111', lineHeight: 1, letterSpacing: '-1px',
            }}>
              {Number(pkg.price).toLocaleString('ru-RU')}
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#111' }}>₽</span>
          </div>
        </div>

        {isOwner ? (
          <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>Это ваша услуга</p>
        ) : isLoggedIn ? (
          <OrderForm serviceId={serviceId} price={pkg.price} packageTier={pkg.tier} packageName={pkg.name || TIER_LABELS[pkg.tier] || pkg.tier} />
        ) : (
          <Link href="/login" className="nike-btn-orange">
            Войдите для заказа
          </Link>
        )}
      </div>
    </div>
  )
}
