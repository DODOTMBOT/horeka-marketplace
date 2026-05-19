import { Fragment } from 'react'
import AdminNav from '../AdminNav'
import { getAdminOrders, resolveDispute } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'

const statusStyle: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:   { label: 'Ожидает',   color: '#d97706', dot: '#f59e0b' },
  ACTIVE:    { label: 'В работе',  color: '#2563eb', dot: '#3b82f6' },
  COMPLETED: { label: 'Завершён',  color: '#16a34a', dot: '#16a34a' },
  CANCELLED: { label: 'Отменён',   color: '#6b7280', dot: '#9ca3af' },
  DISPUTED:  { label: 'Спор',      color: '#dc2626', dot: '#dc2626' },
}

const tabs = [
  { value: 'ALL', label: 'Все' },
  { value: 'DISPUTED', label: 'Споры' },
  { value: 'PENDING', label: 'Ожидают' },
  { value: 'ACTIVE', label: 'В работе' },
  { value: 'COMPLETED', label: 'Завершены' },
  { value: 'CANCELLED', label: 'Отменены' },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const orders = await getAdminOrders(params.status)
  const activeTab = params.status ?? 'ALL'
  const disputed = orders.filter(o => o.status === 'DISPUTED')

  return (
    <>
      <AdminNav active="/admin/orders" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

        {/* Topbar */}
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Заказы</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{orders.length} записей</p>
          </div>
          {disputed.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>
                {disputed.length} {disputed.length === 1 ? 'спор требует решения' : 'спора требуют решения'}
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: '20px 28px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', width: 'fit-content' }}>
            {tabs.map((tab, i) => {
              const isActive = activeTab === tab.value
              const isDisputed = tab.value === 'DISPUTED'
              return (
                <Link key={tab.value} href={`/admin/orders${tab.value !== 'ALL' ? `?status=${tab.value}` : ''}`} style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#111827' : 'transparent',
                  color: isActive ? '#fff' : isDisputed && disputed.length > 0 ? '#dc2626' : '#6b7280',
                  textDecoration: 'none',
                  borderRight: i < tabs.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  whiteSpace: 'nowrap',
                }}>
                  {isDisputed && disputed.length > 0 && !isActive && (
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#dc2626' }} />
                  )}
                  {tab.label}
                </Link>
              )
            })}
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['ID', 'Услуга', 'Покупатель', 'Продавец', 'Сумма', 'Статус', 'Дата (МСК)', 'Действия'].map(h => (
                    <th key={h} style={{
                      padding: '9px 14px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#6b7280',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      background: '#f9fafb', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const ss = statusStyle[order.status]
                  const isDisputed = order.status === 'DISPUTED'
                  return (
                    <Fragment key={order.id}>
                      <tr style={{
                        borderBottom: isDisputed ? 'none' : (i < orders.length - 1 ? '1px solid #f3f4f6' : 'none'),
                        background: isDisputed ? '#fff9f9' : '#fff',
                      }}>
                        <td style={{ padding: '10px 14px', fontSize: '11px', fontFamily: 'monospace', color: '#9ca3af', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.id}
                        </td>
                        <td style={{ padding: '10px 14px', maxWidth: '180px' }}>
                          <Link href={`/catalog/${order.service.id}`} target="_blank" style={{
                            fontWeight: 500, color: '#111827', textDecoration: 'none',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {order.service.title}
                          </Link>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 500, color: '#111827' }}>{order.buyer.name ?? '—'}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{order.buyer.email}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 500, color: '#111827' }}>{order.service.seller.name ?? '—'}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{order.service.seller.email}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                          {Number(order.price).toLocaleString('ru-RU')} ₽
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ss.dot, flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: ss.color }}>{ss.label}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}{' '}
                          <span style={{ color: '#d1d5db' }}>
                            {new Date(order.createdAt).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {isDisputed ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <ActionButton
                                label="Завершить"
                                action={async () => {
                                  'use server'
                                  return resolveDispute(order.id, 'COMPLETED')
                                }}
                                confirm="Завершить в пользу продавца?"
                                variant="success"
                                size="xs"
                              />
                              <ActionButton
                                label="Отменить"
                                action={async () => {
                                  'use server'
                                  return resolveDispute(order.id, 'CANCELLED')
                                }}
                                confirm="Отменить в пользу покупателя?"
                                variant="danger"
                                size="xs"
                              />
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#d1d5db' }}>—</span>
                          )}
                        </td>
                      </tr>

                      {/* Dispute detail panel */}
                      {isDisputed && (
                        <tr style={{ borderBottom: i < orders.length - 1 ? '1px solid #f3f4f6' : 'none', background: '#fff9f9' }}>
                          <td colSpan={8} style={{ padding: '0 14px 12px 14px' }}>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: order.disputeConversation ? '1fr 1fr' : '1fr',
                              gap: '12px',
                            }}>
                              {/* Reason */}
                              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px 14px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#dc2626', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                                  Причина спора
                                </p>
                                <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
                                  {order.disputeReason ?? (
                                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Покупатель не указал причину</span>
                                  )}
                                </p>
                              </div>

                              {/* Messages */}
                              {order.disputeConversation && (
                                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px 14px' }}>
                                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Переписка — {order.disputeConversation.messages.length} сообщений
                                  </p>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                                    {order.disputeConversation.messages.length === 0 ? (
                                      <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Сообщений пока нет</p>
                                    ) : order.disputeConversation.messages.map(msg => (
                                      <div key={msg.id} style={{ display: 'flex', gap: '6px', fontSize: '12px' }}>
                                        <span style={{ fontWeight: 700, color: '#374151', flexShrink: 0 }}>{msg.sender.name}:</span>
                                        <span style={{ color: '#6b7280', lineHeight: 1.5 }}>{msg.body}</span>
                                        <span style={{ color: '#d1d5db', flexShrink: 0, marginLeft: 'auto' }}>
                                          {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      Заказов не найдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
