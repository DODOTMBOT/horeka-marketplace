'use client'

import { useTransition } from 'react'

type Action = () => Promise<{ error?: string }>

const variants = {
  default: { bg: '#f5f5f5', color: '#555',    border: '#e0e0e0' },
  danger:  { bg: '#fff',    color: '#dc2626', border: '#fecaca' },
  success: { bg: '#fff',    color: '#16a34a', border: '#bbf7d0' },
  warning: { bg: '#fff',    color: '#d97706', border: '#fde68a' },
  primary: { bg: '#111',    color: '#fff',    border: '#111'    },
}

export function ActionButton({
  label, action, confirm: confirmMsg, variant = 'default', size = 'sm',
}: {
  label: string
  action: Action
  confirm?: string
  variant?: keyof typeof variants
  size?: 'sm' | 'xs'
}) {
  const [pending, startTransition] = useTransition()
  const c = variants[variant]

  const handleClick = () => {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    startTransition(async () => {
      const res = await action()
      if (res?.error) alert(res.error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      style={{
        padding: size === 'xs' ? '3px 8px' : '5px 11px',
        borderRadius: '3px',
        fontSize: size === 'xs' ? '10px' : '12px',
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        border: `1.5px solid ${c.border}`,
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.5 : 1,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      {pending ? '...' : label}
    </button>
  )
}
