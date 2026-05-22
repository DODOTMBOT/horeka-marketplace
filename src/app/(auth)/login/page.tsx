'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'
import type { LoginFormState } from '@/lib/definitions'
import { LogoWordmark } from '@/components/Logo'

const initialState: LoginFormState = {}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>

      {/* Left — hero panel */}
      <div style={{
        flex: 1, position: 'relative', background: 'var(--ink-2)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px', overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 60% 50%, rgba(61,90,254,0.18) 0%, transparent 65%)',
        }} />

        {/* Logo */}
        <Link href="/" style={{ position: 'relative', zIndex: 1 }}>
          <LogoWordmark size="md" dark />
        </Link>

        {/* Big title */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: 'var(--ff-display)',
            fontWeight: 800,
            fontSize: 'clamp(52px, 7vw, 92px)',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 0.88, letterSpacing: '-0.05em',
          }}>ВОЙТИ</p>
          <p style={{
            fontFamily: 'var(--ff-display)',
            fontWeight: 700,
            fontSize: 'clamp(28px, 3.8vw, 48px)',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '-0.04em', marginTop: '6px',
          }}>В АККАУНТ</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '24px', lineHeight: 1.6, maxWidth: '280px' }}>
            Платформа для профессионалов HoReCa — услуги, вакансии и поставщики в одном месте
          </p>
        </div>

        {/* Bottom */}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>
          © 2025 Unit One
        </p>
      </div>

      {/* Right — form panel */}
      <div style={{
        width: '460px', flexShrink: 0,
        background: 'var(--ink-3)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '56px 48px',
      }}>
        <p style={{
          fontFamily: 'var(--ff-display)',
          fontWeight: 800, fontSize: '26px',
          color: '#fff', letterSpacing: '-0.04em',
          marginBottom: '32px',
        }}>ВОЙТИ</p>

        <form action={formAction} noValidate>
          {state.errors?.general && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
              color: '#f87171', fontSize: '13px',
            }}>
              {state.errors.general[0]}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email" name="email" autoComplete="email" placeholder="example@mail.ru"
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 'var(--r-md)',
                border: state.errors?.email ? '1.5px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)', fontSize: '14px',
                color: '#fff', boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            {state.errors?.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '5px' }}>{state.errors.email[0]}</p>}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
              Пароль
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} name="password"
                autoComplete="current-password" placeholder="Введите пароль"
                style={{
                  width: '100%', padding: '13px 48px 13px 16px', borderRadius: 'var(--r-md)',
                  border: state.errors?.password ? '1.5px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)', fontSize: '14px',
                  color: '#fff', boxSizing: 'border-box', outline: 'none',
                }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
              }}>
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {state.errors?.password && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '5px' }}>{state.errors.password[0]}</p>}
          </div>

          <button type="submit" disabled={pending} style={{
            width: '100%', padding: '14px',
            borderRadius: 'var(--r-md)',
            background: pending ? 'rgba(255,255,255,0.08)' : 'var(--blue)',
            color: pending ? 'rgba(255,255,255,0.35)' : '#fff',
            fontSize: '14px', fontWeight: 800,
            fontFamily: 'var(--ff-display)',
            letterSpacing: '-0.01em',
            border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}>
            {pending ? 'ВХОД...' : 'ВОЙТИ →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Нет аккаунта?{' '}
          <Link href="/register" style={{ color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
