import AdminNav from '../AdminNav'
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
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Финансы</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Статистика по завершённым заказам</p>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Общий оборот', value: `${totalRevenue.toLocaleString('ru-RU')} ₽`, sub: 'завершённые заказы', accent: '#f97316' },
              { label: 'Завершено заказов', value: completedOrders.toLocaleString('ru-RU'), sub: 'всего', accent: '#16a34a' },
              { label: 'Средний чек', value: `${Math.round(avgOrder).toLocaleString('ru-RU')} ₽`, sub: 'на заказ', accent: '#2563eb' },
            ].map(c => (
              <div key={c.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c.accent }} />
                <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{c.label}</p>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-0.5px' }}>{c.value}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{c.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', alignItems: 'start' }}>
            {/* Chart */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Выручка за 30 дней</p>
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
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Топ услуг по выручке</p>
              </div>
              {topSellers.length === 0 ? (
                <p style={{ padding: '20px', fontSize: '12px', color: '#9ca3af' }}>Нет данных</p>
              ) : topSellers.map((t, i) => {
                const revenue = Number(t._sum.price ?? 0)
                const maxRev = Number(topSellers[0]._sum.price ?? 1)
                return (
                  <div key={String(t.serviceId)} style={{ padding: '12px 16px', borderBottom: i < topSellers.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {i + 1}. {t.service?.title ?? 'Удалена'}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>{(t.service?.seller?.companyName || t.service?.seller?.name) ?? '—'} · {t._count} зак.</p>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', flexShrink: 0, marginLeft: '8px' }}>
                        {revenue.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(revenue / maxRev) * 100}%`, background: '#f97316', borderRadius: '2px' }} />
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
