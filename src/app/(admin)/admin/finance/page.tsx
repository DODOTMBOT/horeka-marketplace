import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminFinance } from '@/actions/admin'

function BarChart({ data }: { data: { day: Date; revenue: number; count: number }[] }) {
  if (!data.length) return <p style={{ fontSize: '13px', color: '#9ca3af', padding: '20px' }}>Нет данных за последние 30 дней</p>
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', padding: '0 4px' }}>
      {data.map((d, i) => {
        const h = Math.max((d.revenue / max) * 100, 2)
        const isLast = i === data.length - 1
        return (
          <div key={i} title={`${new Date(d.day).toLocaleDateString('ru-RU')}: ${d.revenue.toLocaleString('ru-RU')} ₽ (${d.count} зак.)`}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default' }}>
            <div style={{
              width: '100%', height: `${h}%`,
              background: isLast ? '#f97316' : '#e5e7eb',
              borderRadius: '3px 3px 0 0', minHeight: '3px',
              transition: 'background 0.2s',
            }} />
          </div>
        )
      })}
    </div>
  )
}

export default async function AdminFinancePage() {
  const { totalRevenue, completedOrders, avgOrder, topSellers, byDay } = await getAdminFinance()

  return (
    <>
      <AdminNav active="/admin/finance" />
      <main className="admin-main">
        <AdminTopbar title="Финансы" subtitle="Статистика по завершённым заказам" />

        <div style={{ padding: '20px 28px' }}>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Общий оборот', value: `${totalRevenue.toLocaleString('ru-RU')} ₽`, sub: 'завершённые заказы', accent: 'var(--primary)' },
              { label: 'Завершено заказов', value: completedOrders.toLocaleString('ru-RU'), sub: 'всего', accent: '#16a34a' },
              { label: 'Средний чек', value: `${Math.round(avgOrder).toLocaleString('ru-RU')} ₽`, sub: 'на заказ', accent: '#2563eb' },
            ].map(c => (
              <div key={c.label} style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: '6px', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: c.accent }} />
                <p style={{ fontSize: '9px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>{c.label}</p>
                <p className="admin-metric-num" style={{ fontSize: '28px' }}>{c.value}</p>
                <p style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>{c.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '10px', alignItems: 'start' }}>
            {/* Chart */}
            <div className="admin-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '9px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Выручка за 30 дней</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {byDay.length > 0
                    ? `${byDay.reduce((s, d) => s + d.revenue, 0).toLocaleString('ru-RU')} ₽`
                    : '—'
                  }
                </p>
              </div>
              <BarChart data={byDay} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#d1d5db' }}>
                {byDay.length > 0 && <>
                  <span>{new Date(byDay[0].day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                  <span>{new Date(byDay[byDay.length - 1].day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                </>}
              </div>
            </div>

            {/* Top sellers */}
            <div className="admin-card">
              <div style={{ padding: '14px 16px', borderBottom: '2px solid #111' }}>
                <p style={{ fontSize: '9px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Топ услуг по выручке</p>
              </div>
              {topSellers.length === 0 ? (
                <p style={{ padding: '20px', fontSize: '12px', color: '#aaa' }}>Нет данных</p>
              ) : topSellers.map((t, i) => {
                const revenue = Number(t._sum.price ?? 0)
                const maxRev = Number(topSellers[0]._sum.price ?? 1)
                return (
                  <div key={String(t.serviceId)} style={{ padding: '12px 16px', borderBottom: i < topSellers.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {i + 1}. {t.service?.title ?? 'Удалена'}
                        </p>
                        <p style={{ fontSize: '10px', color: '#aaa' }}>{(t.service?.seller?.companyName || t.service?.seller?.name) ?? '—'} · {t._count} зак.</p>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#111', flexShrink: 0, marginLeft: '8px', fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic' }}>
                        {revenue.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div style={{ height: '3px', background: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(revenue / maxRev) * 100}%`, background: '#111', borderRadius: '2px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
