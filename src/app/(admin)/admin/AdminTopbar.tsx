export default function AdminTopbar({
  title,
  subtitle,
  actions,
  alert,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  alert?: React.ReactNode
}) {
  return (
    <div style={{
      padding: '16px 28px',
      background: 'var(--paper)',
      borderBottom: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap',
      fontFamily: 'var(--ff-display)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: '22px', fontWeight: 800,
              color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.1,
            }}>
              {title}
            </h1>
            {alert}
          </div>
          {subtitle && (
            <p style={{
              fontSize: '12px', color: 'var(--muted)',
              marginTop: '2px', fontWeight: 500, letterSpacing: '-0.01em',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}
