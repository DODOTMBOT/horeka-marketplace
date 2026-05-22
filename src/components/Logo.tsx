export function LogoMark({ size = 32 }: { size?: number }) {
  const s = size / 64
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="28" height="60" rx="9" fill="#3D5AFE" />
      <rect x="34" y="2" width="28" height="60" rx="9" fill="#D7FF3A" />
      {/* U — white strokes inside blue rect */}
      <path d="M11 14 V39 Q11 50 16 50 Q21 50 21 39 V14"
        stroke="#F6F4ED" strokeWidth={4.5 * s * (64 / size)} fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* 1 — serif numeral inside lime rect */}
      <path d="M41 27 L48 17"
        stroke="#0F0F12" strokeWidth={4.5 * s * (64 / size)}
        strokeLinecap="round" />
      <path d="M48 17 V47"
        stroke="#0F0F12" strokeWidth={4.5 * s * (64 / size)}
        strokeLinecap="round" />
      <path d="M42 47 H54"
        stroke="#0F0F12" strokeWidth={4.5 * s * (64 / size)}
        strokeLinecap="round" />
    </svg>
  )
}

type WordmarkSize = 'sm' | 'md' | 'lg'
const SIZES: Record<WordmarkSize, { icon: number; text: number; badge: number; pr: number; gap: number }> = {
  sm: { icon: 22, text: 14, badge: 9,  pr: 6,  gap: 7  },
  md: { icon: 28, text: 18, badge: 11, pr: 8,  gap: 9  },
  lg: { icon: 40, text: 26, badge: 14, pr: 10, gap: 12 },
}

export function LogoWordmark({ size = 'md', dark = false }: { size?: WordmarkSize; dark?: boolean }) {
  const s = SIZES[size]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: `${s.gap}px` }}>
      <LogoMark size={s.icon} />
      <span style={{
        fontFamily: 'var(--ff-display)',
        fontWeight: 800,
        fontSize: `${s.text}px`,
        color: dark ? '#F6F4ED' : '#0F0F12',
        letterSpacing: '-0.04em',
        lineHeight: 1,
      }}>unit one</span>
    </div>
  )
}
