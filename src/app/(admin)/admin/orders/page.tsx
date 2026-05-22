import { Fragment } from 'react'
import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminOrders, resolveDispute } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'

const statusStyle: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:   { label: 'Ожидает',  color: '#d97706', dot: '#f59e0b' },
  ACTIVE:    { label: 'В работе', color: '#2563eb', dot: '#3b82f6' },
  COMPLETED: { label: 'Завершён', color: '#16a34a', dot: '#16a34a' },
  CANCELLED: { label: 'Отменён',  color: '#888',    dot: '#ccc' },
  DISPUTED:  { label: 'Спор',     color: '#dc2626', dot: '#dc2626' },
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
      <main className="admin-main">
        <AdminTopbar
          title="Заказы"
          subtitle={`${orders.length} записей`}
          alert={disputed.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 10px', borderRadius: '3px', background: '#fef2f2', border: '1.5px solid #fecaca' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#dc2626' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>{disputed.length} спор{disputed.length > 1 ? 'а' : ''}</span>
            </div>
          ) : undefined}
          actions={
            <a href="/api/admin/export?type=orders" style={{
              padding: '7px 14px', borderRadius: '4px', border: '1.5px solid #e0e0e0',
              fontSize: '12px', fontWeight: 700, color: '#555', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '5px', background: '#fff',
            }}>↓ CSV</a>
          }
        />

        <div style={{ padding: '20px 28px' }}>
          <div className="admin-tabs" style={{ marginBottom: '16px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.value
              const isDisputed = tab.value === 'DISPUTED'
              return (
                <Link key={tab.value}
                  href={`/admin/orders${tab.value !== 'ALL' ? `?status=${tab.value}` : ''}`}
                  className={`admin-tab${isActive ? ' active' : ''}`}
                  style={{ color: isActive ? '#fff' : isDisputed && disputed.length > 0 ? '#dc2626' : '#888' }}
                >
                  {isDisputed && disputed.length > 0 && !isActive && (
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#dc2626' }} />
                  )}
                  {tab.label}
                </Link>
              )
            })}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['ID', 'Услуга', 'Покупатель', 'Продавец', 'Сумма', 'Статус', 'Дата', 'Действия'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const ss = statusStyle[order.status]
                  const isDisputed = order.status === 'DISPUTED'
                  return (
                    <Fragment key={order.id}>
                      <tr style={{ background: isDisputed ? '#fffafa' : undefined }}>
                        <td style={{ fontSize: '10px', fontFamily: 'monospace', color: '#bbb', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.id}
                        </td>
                        <td style={{ maxWidth: '180px' }}>
                          <Link href={`/catalog/${order.service.id}`} target="_blank" style={{
                            fontWeight: 600, color: '#111', textDecoration: 'none',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {order.service.title}
                          </Link>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{order.buyer.name ?? '—'}</div>
                          <div style={{ fontSize: '10px', color: '#aaa' }}>{order.buyer.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{order.service.seller.name ?? '—'}</div>
                          <div style={{ fontSize: '10px', color: '#aaa' }}>{order.service.seller.email}</div>
                        </td>
                        <td style={{ fontWeight: 800, color: '#111', whiteSpace: 'nowrap', fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic', fontSize: '15px' }}>
                          {Number(order.price).toLocaleString('ru-RU')} ₽
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ss.dot, flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: ss.color }}>{ss.label}</span>
                          </div>
                        </td>
                        <td style={{ color: '#bbb', fontSize: '11px', whiteSpace: 'nowrap' }}>
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}{' '}
                          <span style={{ color: '#ddd' }}>
                            {new Date(order.createdAt).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td>
                          {isDisputed ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <ActionButton label="Завершить" action={async () => { 'use server'; return resolveDispute(order.id, 'COMPLETED') }} confirm="Завершить в пользу продавца?" variant="success" size="xs" />
                              <ActionButton label="Отменить" action={async () => { 'use server'; return resolveDispute(order.id, 'CANCELLED') }} confirm="Отменить в пользу покупателя?" variant="danger" size="xs" />
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#ddd' }}>—</span>
                          )}
                        </td>
                      </tr>
                      {isDisputed && (
                        <tr style={{ background: '#fffafa' }}>
                          <td colSpan={8} style={{ padding: '0 14px 12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: order.disputeConversation ? '1fr 1fr' : '1fr', gap: '10px' }}>
                              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '4px', padding: '12px 14px' }}>
                                <p style={{ fontSize: '9px', fontWeight: 800, color: '#dc2626', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Причина спора</p>
                                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>
                                  {order.disputeReason ?? <span style={{ color: '#aaa', fontStyle: 'italic' }}>Покупатель не указал причину</span>}
                                </p>
                              </div>
                              {order.disputeConversation && (
                                <div style={{ background: '#fafafa', border: '1.5px solid #e8e8e8', borderRadius: '4px', padding: '12px 14px' }}>
                                  <p style={{ fontSize: '9px', fontWeight: 800, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Переписка — {order.disputeConversation.messages.length} сообщений
                                  </p>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                                    {order.disputeConversation.messages.length === 0
                                      ? <p style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>Сообщений пока нет</p>
                                      : order.disputeConversation.messages.map(msg => (
                                        <div key={msg.id} style={{ display: 'flex', gap: '6px', fontSize: '12px' }}>
                                          <span style={{ fontWeight: 700, color: '#333', flexShrink: 0 }}>{msg.sender.name}:</span>
                                          <span style={{ color: '#666', lineHeight: 1.5 }}>{msg.body}</span>
                                          <span style={{ color: '#ddd', flexShrink: 0, marginLeft: 'auto' }}>
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
                  <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#bbb', fontSize: '13px' }}>Заказов не найдено</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
