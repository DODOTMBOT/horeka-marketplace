'use client'

import { useTransition, useState } from 'react'
import { startWork, completeWork, updateOrderStatus } from '@/actions/orders'
import { openDispute } from '@/actions/disputes'

const REASONS = [
  { value: 'NO_CONTACT', label: 'Исполнитель не вышел на связь' },
  { value: 'SERVICE_NOT_PROVIDED', label: 'Услуга не оказана' },
  { value: 'SELLER_DISAPPEARED', label: 'Исполнитель пропал' },
]

function PrimaryBtn({ onClick, disabled, children, color = 'var(--ink)' }: {
  onClick: () => void; disabled: boolean; children: React.ReactNode; color?: string
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '12px 16px', borderRadius: '10px',
      background: color, color: '#fff', fontSize: '14px', fontWeight: 700,
      border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1, marginBottom: '8px',
      fontFamily: 'var(--ff-display)', letterSpacing: '-0.01em',
    }}>
      {children}
    </button>
  )
}

function GhostBtn({ onClick, disabled, children }: {
  onClick: () => void; disabled: boolean; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '11px 16px', borderRadius: '10px',
      background: 'transparent', color: 'var(--muted)', fontSize: '13px', fontWeight: 600,
      border: '1.5px solid var(--line)', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1, marginBottom: '8px',
    }}>
      {children}
    </button>
  )
}

export default function OrderActions({
  orderId, currentStatus, isBuyer, isSeller, paidAt, workStartedAt,
  disputeDelayHours = 48, autoCompleteHours = 48, minDescriptionLength = 20,
}: {
  orderId: string
  currentStatus: string
  isBuyer: boolean
  isSeller: boolean
  paidAt: Date | null
  workStartedAt: Date | null
  disputeDelayHours?: number
  autoCompleteHours?: number
  minDescriptionLength?: number
}) {
  const [pending, startTransition] = useTransition()
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<{ url: string; name: string; size: number }[]>([])
  const [uploading, setUploading] = useState(false)
  const [disputeError, setDisputeError] = useState('')
  const [disputeSuccess, setDisputeSuccess] = useState(false)

  const now = Date.now()
  const disputeDelayMs = disputeDelayHours * 3600000
  const autoCompleteMs = autoCompleteHours * 3600000

  const canOpenDisputeNow = disputeDelayHours === 0 || (paidAt ? (now - new Date(paidAt).getTime()) >= disputeDelayMs : false)
  const workAutoCompletePassed = workStartedAt ? (now - new Date(workStartedAt).getTime()) >= autoCompleteMs : false

  const hoursUntilDispute = paidAt && disputeDelayHours > 0
    ? Math.max(0, Math.ceil((disputeDelayMs - (now - new Date(paidAt).getTime())) / 3600000))
    : 0

  const hoursUntilAutoComplete = workStartedAt
    ? Math.max(0, Math.ceil((autoCompleteMs - (now - new Date(workStartedAt).getTime())) / 3600000))
    : autoCompleteHours

  const run = (fn: () => Promise<{ error?: string }>) => {
    startTransition(async () => {
      const r = await fn()
      if (r?.error) alert(r.error)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    if (!picked.length) return
    setUploading(true)
    try {
      const uploaded: { url: string; name: string; size: number }[] = []
      for (const file of picked) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', 'disputes')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) uploaded.push({ url: data.url, name: file.name, size: file.size })
      }
      setFiles(prev => [...prev, ...uploaded])
    } finally {
      setUploading(false)
    }
  }

  const handleOpenDispute = async () => {
    if (!reason) { setDisputeError('Выберите причину'); return }
    if (description.trim().length < minDescriptionLength) {
      setDisputeError(minDescriptionLength > 1 ? `Опишите ситуацию подробнее (мин. ${minDescriptionLength} символов)` : 'Опишите ситуацию')
      return
    }
    setDisputeError('')
    const fd = new FormData()
    fd.append('orderId', orderId)
    fd.append('reason', reason)
    fd.append('description', description)
    files.forEach(f => {
      fd.append('fileUrl', f.url)
      fd.append('fileName', f.name)
      fd.append('fileSize', String(f.size))
    })
    startTransition(async () => {
      const result = await openDispute(undefined as never, fd)
      if (result?.error) setDisputeError(result.error)
      else setDisputeSuccess(true)
    })
  }

  // ── SELLER ────────────────────────────────────────────────────────────────

  if (isSeller) {
    if (currentStatus === 'ACTIVE') {
      return (
        <div>
          <PrimaryBtn onClick={() => run(() => startWork(orderId))} disabled={pending} color="#2563eb">
            {pending ? '...' : '▶ Начать работу'}
          </PrimaryBtn>
          <p style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
            {autoCompleteHours < 8760 ? `После нажатия запустится таймер — ${autoCompleteHours} ч до автозавершения` : 'Исполнитель подтвердит выполнение'}
          </p>
        </div>
      )
    }

    if (currentStatus === 'IN_PROGRESS') {
      return (
        <div>
          <PrimaryBtn onClick={() => run(() => completeWork(orderId))} disabled={pending} color="#16a34a">
            {pending ? '...' : '✓ Заказ выполнен'}
          </PrimaryBtn>
          <p style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
            {autoCompleteHours >= 8760
              ? 'Ожидание подтверждения покупателем'
              : workAutoCompletePassed
                ? `Автозавершение: ${autoCompleteHours} ч прошло`
                : `Автозавершение через ~${hoursUntilAutoComplete} ч (если нет спора)`}
          </p>
        </div>
      )
    }

    return null
  }

  // ── BUYER ─────────────────────────────────────────────────────────────────

  if (isBuyer) {
    if (currentStatus === 'PENDING') {
      return (
        <GhostBtn onClick={() => run(() => updateOrderStatus(orderId, 'CANCELLED'))} disabled={pending}>
          Отменить заказ
        </GhostBtn>
      )
    }

    if (currentStatus === 'ACTIVE' || currentStatus === 'IN_PROGRESS') {
      if (disputeSuccess) {
        return (
          <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '20px', marginBottom: '6px' }}>⚖️</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>Спор открыт</p>
            <p style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
              Модератор рассмотрит ситуацию в течение 24 часов
            </p>
          </div>
        )
      }

      if (showDisputeForm) {
        return (
          <div style={{ background: '#fff', border: '1.5px solid #fed7aa', borderRadius: '14px', padding: '18px' }}>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '14px', color: 'var(--ink)', marginBottom: '14px', letterSpacing: '-0.02em' }}>
              Открыть спор
            </p>

            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
              Причина
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {REASONS.map(r => (
                <label key={r.value} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '8px', border: `1.5px solid ${reason === r.value ? '#d97706' : 'var(--line)'}`,
                  background: reason === r.value ? '#fffbeb' : '#fff',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--ink)',
                }}>
                  <input type="radio" name="reason" value={r.value} checked={reason === r.value}
                    onChange={() => setReason(r.value)} style={{ accentColor: '#d97706' }} />
                  {r.label}
                </label>
              ))}
            </div>

            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
              Описание ситуации
            </p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Подробно опишите: что обещал исполнитель, что пошло не так, как давно нет контакта..."
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1.5px solid var(--line)', fontSize: '13px', lineHeight: 1.5,
                resize: 'vertical', boxSizing: 'border-box', outline: 'none',
                fontFamily: 'inherit', marginBottom: '12px',
              }}
            />

            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
              Файлы / скриншоты
            </p>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px',
              borderRadius: '8px', border: '1.5px dashed var(--line)', cursor: 'pointer',
              fontSize: '12px', color: 'var(--muted)',
              marginBottom: files.length ? '8px' : '14px',
            }}>
              <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*,.pdf,.xlsx,.docx" />
              {uploading ? 'Загрузка...' : '+ Прикрепить файлы'}
            </label>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                {files.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: '12px', color: 'var(--muted)', padding: '5px 8px',
                    background: 'var(--paper-2)', borderRadius: '6px',
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', flexShrink: 0, paddingLeft: '8px' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {disputeError && (
              <p style={{ fontSize: '12px', color: '#dc2626', marginBottom: '10px' }}>{disputeError}</p>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleOpenDispute}
                disabled={pending || uploading || !reason || description.trim().length < minDescriptionLength}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  background: '#d97706', color: '#fff', fontWeight: 700, fontSize: '13px',
                  border: 'none', cursor: 'pointer',
                  opacity: (pending || uploading || !reason || description.trim().length < 20) ? 0.55 : 1,
                }}
              >
                {pending ? '...' : 'Отправить спор'}
              </button>
              <button
                onClick={() => { setShowDisputeForm(false); setReason(''); setDescription(''); setFiles([]); setDisputeError('') }}
                style={{
                  padding: '11px 14px', borderRadius: '10px',
                  background: 'transparent', color: 'var(--muted)',
                  border: '1.5px solid var(--line)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        )
      }

      return (
        <div>
          {!canOpenDisputeNow ? (
            <div style={{ background: 'var(--paper-2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                Спор можно открыть через <strong style={{ color: 'var(--ink)' }}>{hoursUntilDispute} ч</strong> после оплаты, если исполнитель не вышел на связь
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowDisputeForm(true)}
              style={{
                width: '100%', padding: '11px', borderRadius: '10px',
                background: 'transparent', color: '#d97706',
                border: '1.5px solid #fed7aa', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', marginBottom: '8px',
              }}
            >
              ⚠ Открыть спор
            </button>
          )}
        </div>
      )
    }
  }

  return null
}
