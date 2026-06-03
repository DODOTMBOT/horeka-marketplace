import { getDisputeConfig } from '@/lib/disputeConfig'
import DisputeSettingsForm from './DisputeSettingsForm'
import Link from 'next/link'

export default async function DisputeSettingsPage() {
  const config = await getDisputeConfig()

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <Link
          href="/admin/disputes"
          style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          ← Споры
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '22px', color: '#fff', letterSpacing: '-0.03em' }}>
          НАСТРОЙКИ СПОРОВ
        </h1>
      </div>

      <div style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '16px', flexShrink: 0 }}>⚙️</span>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          Изменения применяются немедленно для всех новых споров. Уже открытые споры и заказы в процессе не затрагиваются.
        </p>
      </div>

      <DisputeSettingsForm config={config} />
    </div>
  )
}
