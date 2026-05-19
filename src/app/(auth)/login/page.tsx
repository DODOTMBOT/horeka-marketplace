'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'
import type { LoginFormState } from '@/lib/definitions'

const initialState: LoginFormState = {}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>HoReCa Hub</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Войдите в аккаунт</p>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-out)',
        padding: '36px 32px',
      }}>
        <form action={formAction} noValidate>
          {/* General error */}
          {state.errors?.general && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#dc2626',
              fontSize: '13px',
            }}>
              {state.errors.general[0]}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="example@mail.ru"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: state.errors?.email ? '1.5px solid #f87171' : '1.5px solid transparent',
                background: 'var(--bg)',
                boxShadow: 'var(--shadow-in)',
                fontSize: '14px',
                color: 'var(--text)',
                transition: 'border-color 0.2s',
              }}
            />
            {state.errors?.email && (
              <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
              Пароль
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Введите пароль"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: state.errors?.password ? '1.5px solid #f87171' : '1.5px solid transparent',
                  background: 'var(--bg)',
                  boxShadow: 'var(--shadow-in)',
                  fontSize: '14px',
                  color: 'var(--text)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  padding: 0,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
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
            {state.errors?.password && (
              <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>{state.errors.password[0]}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: pending ? '#fdba74' : 'var(--primary)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              boxShadow: pending ? 'none' : '3px 3px 8px rgba(249,115,22,0.35), -1px -1px 4px rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
              cursor: pending ? 'not-allowed' : 'pointer',
            }}
          >
            {pending ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Нет аккаунта?{' '}
        <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
