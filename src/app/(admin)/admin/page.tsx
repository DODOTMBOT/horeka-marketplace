import Link from 'next/link'
import AdminNav from './AdminNav'
import { getAdminStats } from '@/actions/admin'

function MetricCard({
  label, value, sub, trend, accentColor = '#f97316',
}: {
  label: string
  value: string | number
  sub?: string
  trend?: { value: string; positive: boolean }
  accentColor?: string
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px', background: accentColor, opacity: 0.7,
      }} />
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <p style={{ fontSize: '26px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
        </p>
        {trend && (
          <span style={{
            fontSize: '11px', fontWeight: 600,
            color: trend.positive ? '#16a34a' : '#dc2626',
          }}>
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      {sub && (
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>{sub}</p>
      )}
    </div>
  )
}

function BarChart({ data }: { data: { day: string; count: number }[] }) {
  if (!data.length) return (
    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9ca3af', fontSize: '13px' }}>Нет данных за период</p>
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
          return (
            <div
              key={i}
              title={`${d.day}: ${d.count} чел.`}
              style={{
                flex: 1, borderRadius: '2px 2px 0 0',
                background: d.count === max ? '#f97316' : '#e5e7eb',
                height: `${h}px`,
                cursor: 'default',
                transition: 'background 0.1s',
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{show[0]?.day}</span>
        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
          {total} регистраций за 30 дней
        </span>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{show[show.length - 1]?.day}</span>
      </div>
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</p>
      {action && (
        <Link href={action.href} style={{ fontSize: '12px', color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
          {action.label} →
        </Link>
      )}
    </div>
  )
}

export default async function AdminDashboard() {
  const s = await getAdminStats()

  const conversionRate = s.totalUsers > 0 ? ((s.totalSellers / s.totalUsers) * 100).toFixed(1) : '0'
  const completionRate = s.totalOrders > 0 ? ((s.completedOrders / s.totalOrders) * 100).toFixed(1) : '0'
  const avgRevenue = s.completedOrders > 0 ? Math.round(s.revenue / s.completedOrders) : 0

  return (
    <>
      <AdminNav active="/admin" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

        {/* Topbar */}
        <div style={{
          padding: '16px 28px',
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>
              Обзор платформы
            </h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
              Реальное время · Все данные из базы
            </p>
          </div>
          {s.disputedOrders > 0 && (
            <Link href="/admin/orders?status=DISPUTED" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '6px',
              background: '#fef2f2', border: '1px solid #fecaca',
              textDecoration: 'none',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', flexShrink: 0, animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>
                {s.disputedOrders} {s.disputedOrders === 1 ? 'активный спор' : 'активных спора'}
              </span>
            </Link>
          )}
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Primary metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            <MetricCard label="Пользователей" value={s.totalUsers} sub={`${s.totalSellers} продавцов · ${s.totalBuyers} покупателей`} />
            <MetricCard label="Конверсия в продавца" value={`${conversionRate}%`} sub="от всех зарегистрированных" accentColor="#8b5cf6" />
            <MetricCard label="Услуг на платформе" value={s.totalServices} sub={`${s.activeServices} активных · ${s.draftServices} черновиков`} accentColor="#2563eb" />
            <MetricCard label="Выполнено заказов" value={`${completionRate}%`} sub={`${s.completedOrders} из ${s.totalOrders}`} accentColor="#16a34a" />
            <MetricCard label="Выручка платформы" value={`${s.revenue.toLocaleString('ru-RU')} ₽`} sub={`Средний чек: ${avgRevenue.toLocaleString('ru-RU')} ₽`} accentColor="#f97316" />
          </div>

          {/* Secondary metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <MetricCard label="Все заказы" value={s.totalOrders} accentColor="#374151" />
            <MetricCard label="Завершённые" value={s.completedOrders} accentColor="#16a34a" />
            <MetricCard label="Споры" value={s.disputedOrders} sub={s.disputedOrders > 0 ? 'Требуют решения' : 'Нет активных'} accentColor={s.disputedOrders > 0 ? '#dc2626' : '#9ca3af'} />
            <MetricCard label="Активных услуг" value={s.activeServices} accentColor="#2563eb" />
          </div>

          {/* Chart + breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>

            {/* Registration chart */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px 22px' }}>
              <SectionHeader title="Регистрации пользователей" />
              <BarChart data={s.newUsers} />
            </div>

            {/* Platform health */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px 22px' }}>
              <SectionHeader title="Состояние платформы" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { label: 'Конверсия продавцов', value: `${conversionRate}%`, ok: Number(conversionRate) > 10 },
                  { label: 'Выполнение заказов', value: `${completionRate}%`, ok: Number(completionRate) > 70 },
                  { label: 'Активные услуги', value: `${s.activeServices} / ${s.totalServices}`, ok: s.activeServices > 0 },
                  { label: 'Споры', value: s.disputedOrders === 0 ? 'Нет' : `${s.disputedOrders} откр.`, ok: s.disputedOrders === 0 },
                  { label: 'Черновики', value: `${s.draftServices}`, ok: true },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.ok ? '#16a34a' : '#dc2626', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#374151' }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick nav */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { href: '/admin/users', label: 'Управление пользователями', desc: `${s.totalUsers} записей`, color: '#8b5cf6' },
              { href: '/admin/services', label: 'Модерация услуг', desc: `${s.activeServices} активных`, color: '#2563eb' },
              { href: '/admin/orders', label: 'Все заказы', desc: `${s.totalOrders} заказов`, color: '#16a34a' },
              { href: '/admin/reviews', label: 'Модерация отзывов', desc: 'Управление контентом', color: '#f97316' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px 18px',
                textDecoration: 'none',
                display: 'block',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: item.color }} />
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>{item.desc}</p>
                <p style={{ fontSize: '11px', color: item.color, fontWeight: 600, marginTop: '8px' }}>Открыть →</p>
              </Link>
            ))}
          </div>

        </div>
      </main>
    </>
  )
}
