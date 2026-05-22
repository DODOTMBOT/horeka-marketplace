import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminPayouts } from '@/actions/admin'
import PayoutsClient from './PayoutsClient'

export default async function AdminPayoutsPage() {
  const { pending, done, pendingTotal } = await getAdminPayouts()

  return (
    <>
      <AdminNav active="/admin/payouts" />
      <main className="admin-main">
        <AdminTopbar
          title="Выплаты"
          subtitle="Завершённые заказы — переводы исполнителям"
          alert={pending.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 10px', borderRadius: '3px', background: '#fef2f2', border: '1.5px solid #fecaca' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#dc2626' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626' }}>{pending.length} ожидает</span>
            </div>
          ) : undefined}
        />

        <div style={{ padding: '20px 28px' }}>
          <PayoutsClient
            initialPending={pending as any}
            initialDone={done as any}
            pendingTotal={pendingTotal}
          />
        </div>
      </main>
    </>
  )
}
