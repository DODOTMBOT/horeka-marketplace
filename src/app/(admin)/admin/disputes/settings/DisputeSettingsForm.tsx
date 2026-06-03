'use client'

import { useActionState } from 'react'
import { saveDisputeSettings, type DisputeSettingsState } from '@/actions/disputeSettings'
import type { DisputeConfig } from '@/lib/disputeConfig'

const init: DisputeSettingsState = {}

function Field({
  label, name, value, hint, unit, min, max
}: {
  label: string; name: string; value: number; hint: string; unit: string; min: number; max: number
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', alignItems: 'start', gap: '24px', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '14px', color: '#fff', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{hint}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="number" name={name} defaultValue={value} min={min} max={max}
          style={{
            width: '80px', padding: '8px 10px', borderRadius: '6px', textAlign: 'right',
            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
            color: '#fff', fontSize: '14px', fontWeight: 600, outline: 'none',
          }}
        />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{unit}</span>
      </div>
    </div>
  )
}

export default function DisputeSettingsForm({ config }: { config: DisputeConfig }) {
  const [state, action, pending] = useActionState(saveDisputeSettings, init)

  return (
    <form action={action}>
      {state.error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '13px' }}>
          {state.error}
        </div>
      )}
      {state.success && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#4ade80', fontSize: '13px' }}>
          Настройки сохранены
        </div>
      )}

      <div style={{ background: 'var(--ink-3)', borderRadius: '12px', padding: '0 24px' }}>

        <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Сроки
          </p>
        </div>

        <Field
          label="Задержка перед открытием спора"
          name="disputeDelayHours"
          value={config.disputeDelayHours}
          hint="Сколько часов должно пройти после оплаты, прежде чем покупатель сможет открыть спор. Установите 0, чтобы убрать задержку."
          unit="часов"
          min={0} max={8760}
        />

        <Field
          label="Автозавершение заказа"
          name="autoCompleteHours"
          value={config.autoCompleteHours}
          hint="Если исполнитель отметил работу выполненной, а покупатель не открыл спор за это время — заказ завершается автоматически."
          unit="часов"
          min={1} max={8760}
        />

        <Field
          label="Обещанное время рассмотрения спора"
          name="reviewHours"
          value={config.reviewHours}
          hint="Срок, который показывается покупателю в уведомлении после открытия спора. Не влияет на реальный SLA, только на текст сообщения."
          unit="часов"
          min={1} max={720}
        />

        <div style={{ padding: '16px 0 8px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Требования к спору
          </p>
        </div>

        <Field
          label="Минимальная длина описания"
          name="minDescriptionLength"
          value={config.minDescriptionLength}
          hint="Минимальное количество символов в тексте, который покупатель обязан написать при открытии спора."
          unit="символов"
          min={10} max={500}
        />

        <Field
          label="Максимум файлов к спору"
          name="maxFiles"
          value={config.maxFiles}
          hint="Сколько файлов (фото, скриншотов) покупатель может приложить к спору."
          unit="файлов"
          min={1} max={20}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: '11px 28px', borderRadius: '8px',
            background: pending ? 'rgba(255,255,255,0.08)' : 'var(--blue)',
            color: pending ? 'rgba(255,255,255,0.35)' : '#fff',
            fontSize: '13px', fontWeight: 700, border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
          }}
        >
          {pending ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </form>
  )
}
