'use client'

import { useTransition } from 'react'

type Action = () => Promise<{ error?: string }>

const variants = {
  default: { bg: '#f9fafb', color: '#374151', border: '#e5e7eb' },
  danger:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  success: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  warning: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  primary: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
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
        padding: size === 'xs' ? '3px 8px' : '4px 10px',
        borderRadius: '4px',
        fontSize: size === 'xs' ? '11px' : '12px',
        fontWeight: 600,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.5 : 1,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}
    >
      {pending ? '...' : label}
    </button>
  )
}
