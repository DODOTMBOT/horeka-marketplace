'use client'

import { useActionState, useState } from 'react'
import { verifyInn, saveInn } from '@/actions/inn'
import type { InnVerifyState, InnSaveState } from '@/actions/inn'

const verifyInitial: InnVerifyState = {}
const saveInitial: InnSaveState = {}

const typeLabel: Record<string, string> = {
  LEGAL: 'Юридическое лицо',
  INDIVIDUAL: 'Индивидуальный предприниматель',
}

const statusLabel: Record<string, string> = {
  ACTIVE: 'Действующая',
  LIQUIDATING: 'В процессе ликвидации',
  LIQUIDATED: 'Ликвидирована',
  BANKRUPT: 'Банкрот',
  REORGANIZING: 'В процессе реорганизации',
}

export default function InnVerification({
  currentInn,
  isVerified,
  companyName,
}: {
  currentInn: string | null
  isVerified: boolean
  companyName: string | null
}) {
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyInn, verifyInitial)
  const [saveState, saveAction, savePending] = useActionState(saveInn, saveInitial)
  const [confirmed, setConfirmed] = useState(false)

  if (saveState.success || (isVerified && !confirmed)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-sm)', padding: '10px 16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>ИНН верифицирован</span>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {currentInn} &middot; {companyName ?? ''}
        </span>
        {isVerified && !saveState.success && (
          <button
            type="button"
            onClick={() => setConfirmed(true)}
            style={{
              fontSize: '12px', color: 'var(--text-muted)', background: 'none',
              border: 'none', cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Изменить
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Step 1 — enter INN */}
      {!verifyState.result && (
        <form action={verifyAction} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            name="inn"
            placeholder="ИНН (10 или 12 цифр)"
            maxLength={12}
            style={{
              flex: '1', minWidth: '200px', maxWidth: '280px',
              padding: '11px 16px',
              borderRadius: 'var(--radius-sm)',
              border: verifyState.error ? '1.5px solid #f87171' : '1.5px solid transparent',
              background: 'var(--bg)',
              boxShadow: 'var(--shadow-in)',
              fontSize: '14px', color: 'var(--text)',
            }}
          />
          <button
            type="submit"
            disabled={verifyPending}
            style={{
              padding: '11px 22px',
              borderRadius: 'var(--radius-sm)',
              background: verifyPending ? '#fdba74' : 'var(--primary)',
              color: '#fff', fontSize: '14px', fontWeight: 600,
              boxShadow: verifyPending ? 'none' : '3px 3px 8px rgba(249,115,22,0.30)',
              cursor: verifyPending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {verifyPending ? 'Проверка...' : 'Проверить'}
          </button>
          {verifyState.error && (
            <p style={{ width: '100%', color: '#dc2626', fontSize: '13px', marginTop: '2px' }}>
              {verifyState.error}
            </p>
          )}
        </form>
      )}

      {/* Step 2 — confirm result */}
      {verifyState.result && (
        <div>
          <div style={{
            background: 'var(--bg)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-in)',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
              {[
                { label: 'Наименование', value: verifyState.result.name },
                { label: 'ИНН', value: verifyState.result.inn },
                { label: 'Тип', value: typeLabel[verifyState.result.type] ?? verifyState.result.type },
                { label: 'Статус', value: statusLabel[verifyState.result.status] ?? verifyState.result.status },
                { label: 'ОГРН', value: verifyState.result.ogrn || '—' },
                { label: 'Адрес', value: verifyState.result.address || '—' },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                    {f.label}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <form action={saveAction} style={{ display: 'inline-flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="hidden" name="inn" value={verifyState.result.inn} />
              <input type="hidden" name="name" value={verifyState.result.name} />
              <input type="hidden" name="type" value={verifyState.result.type} />
              <button
                type="submit"
                disabled={savePending}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-sm)',
                  background: savePending ? '#fdba74' : 'var(--primary)',
                  color: '#fff', fontSize: '14px', fontWeight: 600,
                  boxShadow: savePending ? 'none' : '3px 3px 8px rgba(249,115,22,0.30)',
                  cursor: savePending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {savePending ? 'Сохранение...' : 'Подтвердить'}
              </button>
            </form>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '14px', fontWeight: 600,
                color: 'var(--text-muted)',
                border: 'none', cursor: 'pointer',
              }}
            >
              Ввести другой
            </button>
            {saveState.error && (
              <p style={{ color: '#dc2626', fontSize: '13px' }}>{saveState.error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
