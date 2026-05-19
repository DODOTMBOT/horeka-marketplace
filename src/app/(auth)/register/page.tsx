'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { register } from '@/actions/auth'
import type { RegisterFormState } from '@/lib/definitions'

const initialState: RegisterFormState = {}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'transparent' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Za-zА-Яа-я]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-zА-Яа-я0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Слабый', color: '#ef4444' }
  if (score <= 3) return { score, label: 'Средний', color: '#f97316' }
  return { score, label: 'Надёжный', color: '#22c55e' }
}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER')

  const strength = getPasswordStrength(password)

  return (
    <div style={{ width: '100%', maxWidth: '480px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>HoReCa Hub</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Создайте аккаунт</p>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-out)', padding: '36px 32px',
      }}>
        {/* Role switcher */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '8px', marginBottom: '28px',
          background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-in)', padding: '5px',
        }}>
          {(['BUYER', 'SELLER'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                padding: '10px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: role === r ? 'var(--primary)' : 'transparent',
                color: role === r ? '#fff' : 'var(--text-muted)',
                boxShadow: role === r ? '2px 2px 6px rgba(249,115,22,0.30)' : 'none',
              }}
            >
              {r === 'BUYER' ? 'Покупатель' : 'Поставщик'}
            </button>
          ))}
        </div>

        <form action={formAction} noValidate>
          <input type="hidden" name="role" value={role} />

          {/* General error */}
          {state.errors?.general && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px',
              marginBottom: '20px', color: '#dc2626', fontSize: '13px',
            }}>
              {state.errors.general[0]}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px' }}>
              Имя
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Ваше имя"
              style={inputStyle(!!state.errors?.name)}
            />
            {state.errors?.name && <FieldError msg={state.errors.name[0]} />}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="example@mail.ru"
              style={inputStyle(!!state.errors?.email)}
            />
            {state.errors?.email && <FieldError msg={state.errors.email[0]} />}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px' }}>
              Телефон <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(необязательно)</span>
            </label>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="+7 900 000-00-00"
              style={inputStyle(!!state.errors?.phone)}
            />
            {state.errors?.phone && <FieldError msg={state.errors.phone[0]} />}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px' }}>
              Пароль
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="Минимум 8 символов"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle(!!state.errors?.password), paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none', padding: 0,
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Strength bar */}
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: i <= strength.score ? strength.color : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: strength.color, fontWeight: 500 }}>{strength.label}</p>
              </div>
            )}
            {state.errors?.password && <FieldError msg={state.errors.password[0]} />}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            style={{
              width: '100%', padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: pending ? '#fdba74' : 'var(--primary)',
              color: '#fff', fontSize: '15px', fontWeight: 600,
              boxShadow: pending ? 'none' : '3px 3px 8px rgba(249,115,22,0.35), -1px -1px 4px rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
              cursor: pending ? 'not-allowed' : 'pointer',
            }}
          >
            {pending ? 'Создание аккаунта...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Уже есть аккаунт?{' '}
        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Войти
        </Link>
      </p>
    </div>
  )
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: hasError ? '1.5px solid #f87171' : '1.5px solid transparent',
    background: 'var(--bg)',
    boxShadow: 'var(--shadow-in)',
    fontSize: '14px',
    color: 'var(--text)',
    transition: 'border-color 0.2s',
  }
}

function FieldError({ msg }: { msg: string }) {
  return <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>{msg}</p>
}
