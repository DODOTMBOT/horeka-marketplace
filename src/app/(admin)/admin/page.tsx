import Link from 'next/link'
import AdminNav from './AdminNav'
import AdminTopbar from './AdminTopbar'
import { getAdminStats } from '@/actions/admin'

function MetricCard({
  label, value, sub, accent = 'var(--blue)',
}: {
  label: string
  value: string | number
  sub?: string
  accent?: string
}) {
  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: '16px',
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--ff-display)',
    }}>
      <div style={{
        position: 'absolute', top: '20px', right: '20px',
        width: '8px', height: '8px', borderRadius: '50%',
        background: accent,
      }} />
      <p style={{
        fontFamily: 'var(--ff-mono)',
        fontSize: '9px', fontWeight: 700, color: 'var(--muted)',
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--ff-display)', fontWeight: 800,
        fontSize: '30px', color: 'var(--ink)',
        lineHeight: 1, letterSpacing: '-0.04em',
      }}>
        {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
      </p>
      {sub && (
        <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '7px', fontWeight: 500, letterSpacing: '-0.01em' }}>{sub}</p>
      )}
    </div>
  )
}

function BarChart({ data }: { data: { day: string; count: number }[] }) {
  if (!data.length) return (
    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Нет данных за период</p>
    </div>
  )

  const show = data.slice(-30)
  const max = Math.max(...show.map(d => d.count), 1)
  const total = show.reduce((s, d) => s + d.count, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '100px' }}>
        {show.map((d, i) => {
          const h = Math.max(2, (d.count / max) * 92)
          const isMax = d.count === max
          return (
            <div key={i} title={`${d.day}: ${d.count} чел.`} style={{
              flex: 1, borderRadius: '3px 3px 0 0',
              background: isMax ? 'var(--blue)' : 'var(--line)',
              height: `${h}px`, cursor: 'default',
              transition: 'background 0.15s',
            }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--muted)' }}>{show[0]?.day}</span>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--ink)', fontWeight: 700 }}>{total} рег. за 30 дней</span>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'var(--muted)' }}>{show[show.length - 1]?.day}</span>
      </div>
    </div>
  )
}

const quickNavItems = [
  {
    href: '/admin/users',
    label: 'Пользователи',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    accent: '#8b5cf6',
  },
  {
    href: '/admin/services',
    label: 'Услуги',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    accent: 'var(--blue)',
  },
  {
    href: '/admin/orders',
    label: 'Заказы',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    accent: '#16a34a',
  },
  {
    href: '/admin/moderation',
    label: 'Модерация',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    accent: 'var(--coral)',
  },
]

export default async function AdminDashboard() {
  const s = await getAdminStats()

  const conversionRate = s.totalUsers > 0 ? ((s.totalSellers / s.totalUsers) * 100).toFixed(1) : '0'
  const completionRate = s.totalOrders > 0 ? ((s.completedOrders / s.totalOrders) * 100).toFixed(1) : '0'
  const avgRevenue = s.completedOrders > 0 ? Math.round(s.revenue / s.completedOrders) : 0

  const hasDisputes = s.disputedOrders > 0

  return (
    <>
      <style>{`
        .admin-qnav:hover { border-color: var(--ink) !important; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.07); }
        .admin-qnav { transition: all 0.18s cubic-bezier(0.22,1,0.36,1); }
        .admin-status-row { transition: background 0.12s; border-radius: 8px; }
        .admin-status-row:hover { background: var(--paper-2); }
      `}</style>
      <AdminNav active="/admin" />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--paper-2)', fontFamily: 'var(--ff-display)' }}>
        <AdminTopbar
          title="Дашборд"
          subtitle="Реальное время · Все данные из базы"
          alert={hasDisputes ? (
            <Link href="/admin/orders?status=DISPUTED" style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '5px 12px', borderRadius: '999px',
              background: 'var(--coral-soft)', border: '1px solid var(--coral)',
              textDecoration: 'none',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--coral)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--coral)', letterSpacing: '0.04em' }}>
                {s.disputedOrders} {s.disputedOrders === 1 ? 'спор' : 'спора'}
              </span>
            </Link>
          ) : undefined}
        />

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Primary metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            <MetricCard label="Пользователей" value={s.totalUsers} sub={`${s.totalSellers} прод. · ${s.totalBuyers} пок.`} accent="var(--ink)" />
            <MetricCard label="Конверсия" value={`${conversionRate}%`} sub="в продавца" accent="#8b5cf6" />
            <MetricCard label="Услуг" value={s.totalServices} sub={`${s.activeServices} акт. · ${s.draftServices} черн.`} accent="var(--blue)" />
            <MetricCard label="Выполнено" value={`${completionRate}%`} sub={`${s.completedOrders} из ${s.totalOrders}`} accent="#16a34a" />
            <MetricCard label="Выручка" value={`${s.revenue.toLocaleString('ru-RU')} ₽`} sub={`Ср. чек: ${avgRevenue.toLocaleString('ru-RU')} ₽`} accent="var(--lime)" />
          </div>

          {/* Chart + status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div style={{
              background: 'var(--paper)', border: '1px solid var(--line)',
              borderRadius: '16px', padding: '20px 24px',
            }}>
              <p style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: '9px', fontWeight: 700, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '18px',
              }}>
                Регистрации пользователей · 30 дней
              </p>
              <BarChart data={s.newUsers} />
            </div>

            <div style={{
              background: 'var(--paper)', border: '1px solid var(--line)',
              borderRadius: '16px', padding: '20px 24px',
            }}>
              <p style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: '9px', fontWeight: 700, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px',
              }}>
                Состояние платформы
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { label: 'Конверсия продавцов', value: `${conversionRate}%`, ok: Number(conversionRate) > 10 },
                  { label: 'Выполнение заказов',  value: `${completionRate}%`, ok: Number(completionRate) > 70 },
                  { label: 'Активные услуги',     value: `${s.activeServices} / ${s.totalServices}`, ok: s.activeServices > 0 },
                  { label: 'Споры',               value: s.disputedOrders === 0 ? 'Нет' : `${s.disputedOrders} откр.`, ok: s.disputedOrders === 0 },
                  { label: 'Черновики',           value: `${s.draftServices}`, ok: true },
                ].map(row => (
                  <div key={row.label} className="admin-status-row" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: row.ok ? '#16a34a' : 'var(--coral)', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <MetricCard label="Все заказы" value={s.totalOrders} accent="var(--muted)" />
            <MetricCard label="Завершённые" value={s.completedOrders} accent="#16a34a" />
            <MetricCard label="Споры" value={s.disputedOrders} sub={hasDisputes ? 'Требуют решения' : 'Нет активных'} accent={hasDisputes ? 'var(--coral)' : 'var(--line)'} />
            <MetricCard label="Активных услуг" value={s.activeServices} accent="var(--blue)" />
          </div>

          {/* Quick nav */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {quickNavItems.map(item => (
              <Link key={item.href} href={item.href} className="admin-qnav" style={{
                background: 'var(--paper)', border: '1px solid var(--line)',
                borderRadius: '16px', padding: '18px 20px',
                textDecoration: 'none', display: 'block',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--paper-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px', color: item.accent,
                }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '3px' }}>{item.label}</p>
                <p style={{
                  fontFamily: 'var(--ff-mono)',
                  fontSize: '10px', fontWeight: 700, color: 'var(--muted)',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px',
                }}>
                  Открыть
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </p>
              </Link>
            ))}
          </div>

        </div>
      </main>
    </>
  )
}
