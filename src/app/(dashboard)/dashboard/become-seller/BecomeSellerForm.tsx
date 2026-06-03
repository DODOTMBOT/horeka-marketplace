'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { becomeSeller } from '@/actions/profile'
import type { BecomeSellerState } from '@/actions/profile'

type BizType = 'SELF_EMPLOYED' | 'IP' | 'COMPANY'
const BIZ_LABELS: Record<BizType, string> = {
  SELF_EMPLOYED: 'Самозанятый',
  IP: 'ИП',
  COMPANY: 'ООО',
}

const initial: BecomeSellerState = {}

function Field({ label, name, placeholder, hint, error, required }: {
  label: string; name: string; placeholder?: string
  hint?: string; error?: string; required?: boolean
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>
      <input
        type="text" name={name} placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
          border: error ? '1.5px solid #ef4444' : '1.5px solid var(--line)',
          background: 'var(--paper)', fontSize: '14px', color: 'var(--ink)', outline: 'none',
        }}
      />
      {hint && <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>{hint}</p>}
      {error && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '3px' }}>{error}</p>}
    </div>
  )
}

export default function BecomeSellerForm() {
  const router = useRouter()
  const [state, action, pending] = useActionState(
    async (prev: BecomeSellerState, fd: FormData) => {
      const result = await becomeSeller(prev, fd)
      if (result.success) router.push('/dashboard/services/new')
      return result
    },
    initial
  )
  const [bizType, setBizType] = useState<BizType>('SELF_EMPLOYED')

  const needOgrn = bizType === 'IP' || bizType === 'COMPANY'
  const needKpp = bizType === 'COMPANY'
  const needAddress = bizType === 'COMPANY'
  const needCorr = bizType === 'IP' || bizType === 'COMPANY'

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input type="hidden" name="businessType" value={bizType} />

      {state.errors?.general && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', color: '#dc2626', fontSize: '13px' }}>
          {state.errors.general[0]}
        </div>
      )}
      {state.error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', color: '#dc2626', fontSize: '13px' }}>
          {state.error}
        </div>
      )}

      {/* Business type */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Тип бизнеса <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          {(['SELF_EMPLOYED', 'IP', 'COMPANY'] as BizType[]).map(bt => (
            <button key={bt} type="button" onClick={() => setBizType(bt)} style={{
              padding: '10px 6px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              border: bizType === bt ? '2px solid var(--ink)' : '1.5px solid var(--line)',
              background: bizType === bt ? 'var(--ink)' : '#fff',
              color: bizType === bt ? '#fff' : 'var(--muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {BIZ_LABELS[bt]}
            </button>
          ))}
        </div>
        {state.errors?.businessType && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{state.errors.businessType[0]}</p>}
      </div>

      {/* INN + company */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field
          label={bizType === 'COMPANY' ? 'ИНН (10 цифр)' : 'ИНН (12 цифр)'}
          name="inn"
          placeholder={bizType === 'COMPANY' ? '1234567890' : '123456789012'}
          required
          error={state.errors?.inn?.[0]}
        />
        <Field
          label="Название / ФИО"
          name="companyName"
          placeholder={bizType === 'SELF_EMPLOYED' ? 'Иванов Иван Иванович' : bizType === 'IP' ? 'ИП Иванов И.И.' : 'ООО «Название»'}
        />
      </div>

      {needOgrn && (
        <Field
          label={bizType === 'IP' ? 'ОГРНИП (15 цифр)' : 'ОГРН (13 цифр)'}
          name="ogrn"
          placeholder={bizType === 'IP' ? '123456789012345' : '1234567890123'}
        />
      )}
      {needKpp && <Field label="КПП (9 цифр)" name="kpp" placeholder="123456789" />}
      {needAddress && <Field label="Юридический адрес" name="legalAddress" placeholder="г. Москва, ул. Примерная, д. 1" />}

      {/* Bank */}
      <div style={{ paddingTop: '4px', borderTop: '1px solid var(--line)' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          Банковские реквизиты
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Field
            label="Расчётный счёт (20 цифр)" name="bankAccount"
            placeholder="40802810000000000000" required
            error={state.errors?.bankAccount?.[0]}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field
              label="БИК (9 цифр)" name="bankBik"
              placeholder="044525225" required
              error={state.errors?.bankBik?.[0]}
            />
            <Field label="Название банка" name="bankName" placeholder="Сбербанк" />
          </div>
          {needCorr && (
            <Field label="Корр. счёт (20 цифр)" name="bankCorrAccount" placeholder="30101810400000000225" />
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '14px', borderRadius: '12px', marginTop: '4px',
          background: pending ? 'var(--line)' : 'var(--ink)',
          color: pending ? 'var(--muted)' : 'var(--lime)',
          fontSize: '15px', fontWeight: 800, fontFamily: 'var(--ff-display)',
          letterSpacing: '-0.02em',
          border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
        }}
      >
        {pending ? 'Сохраняю...' : 'Стать исполнителем →'}
      </button>
    </form>
  )
}
