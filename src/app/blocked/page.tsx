import { logout } from '@/actions/auth'

export default function BlockedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f5f7',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '48px 40px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center',
        border: '1px solid #fecaca',
      }}>
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '50%',
          background: '#fef2f2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '28px',
        }}>
          🚫
        </div>

        <h1 style={{
          fontSize: '22px', fontWeight: 800,
          color: '#1e1f2e', marginBottom: '12px',
          letterSpacing: '-0.4px',
        }}>
          Аккаунт заблокирован
        </h1>

        <p style={{
          fontSize: '14px', color: 'var(--text-muted)',
          lineHeight: 1.6, marginBottom: '32px',
        }}>
          Ваш аккаунт был заблокирован администратором платформы.
          Если вы считаете, что это ошибка, обратитесь в поддержку.
        </p>

        <form action={logout}>
          <button type="submit" style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: '10px',
            background: '#dc2626',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}>
            Выйти из аккаунта
          </button>
        </form>
      </div>
    </div>
  )
}
