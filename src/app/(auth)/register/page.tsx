'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { register } from '@/actions/auth'
import type { RegisterFormState } from '@/lib/definitions'
import { LogoWordmark } from '@/components/Logo'

const initialState: RegisterFormState = {}

type BizType = 'SELF_EMPLOYED' | 'IP' | 'COMPANY'

const BIZ_LABELS: Record<BizType, string> = {
  SELF_EMPLOYED: 'Самозанятый',
  IP: 'ИП',
  COMPANY: 'ООО',
}

function getPasswordStrength(p: string) {
  if (!p) return { score: 0, label: '', color: 'transparent' }
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Za-zА-Яа-я]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-zА-Яа-я0-9]/.test(p)) s++
  if (s <= 2) return { score: s, label: 'Слабый', color: '#ef4444' }
  if (s <= 3) return { score: s, label: 'Средний', color: '#f97316' }
  return { score: s, label: 'Надёжный', color: '#22c55e' }
}

function Field({ label, name, placeholder, type = 'text', hint, error, required }: {
  label: string; name: string; placeholder?: string; type?: string
  hint?: string; error?: string; required?: boolean
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
        {label}{required && <span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
      </label>
      <input type={type} name={name} placeholder={placeholder} style={{
        width: '100%', padding: '10px 13px', borderRadius: 'var(--r-md)', boxSizing: 'border-box',
        border: error ? '1.5px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.06)', fontSize: '13px', color: '#fff', outline: 'none',
      }} />
      {hint && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{hint}</p>}
      {error && <p style={{ fontSize: '11px', color: '#f87171', marginTop: '3px' }}>{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState)
  const [showPwd, setShowPwd] = useState(false)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER')
  const [bizType, setBizType] = useState<BizType>('SELF_EMPLOYED')

  const strength = getPasswordStrength(password)
  const isSeller = role === 'SELLER'

  const leftBg = isSeller ? 'var(--blue)' : 'var(--ink-2)'
  const accentColor = isSeller ? 'var(--lime)' : '#fff'
  const btnBg = isSeller ? 'var(--lime)' : 'var(--blue)'
  const btnColor = isSeller ? 'var(--ink)' : '#fff'
  const btnDisabledBg = 'rgba(255,255,255,0.08)'

  const needCorr = bizType === 'IP' || bizType === 'COMPANY'
  const needOgrn = bizType === 'IP' || bizType === 'COMPANY'
  const needKpp = bizType === 'COMPANY'
  const needAddress = bizType === 'COMPANY'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>

      {/* Left panel — changes color with role */}
      <div style={{
        flex: 1, position: 'relative', background: leftBg,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px', overflow: 'hidden',
        borderRight: '1px solid rgba(0,0,0,0.12)',
        transition: 'background 0.4s ease',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: isSeller
            ? 'radial-gradient(circle at 40% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)'
            : 'radial-gradient(circle at 60% 50%, rgba(61,90,254,0.2) 0%, transparent 65%)',
          transition: 'all 0.4s ease',
        }} />

        <Link href="/" style={{ position: 'relative', zIndex: 1 }}>
          <LogoWordmark size="md" dark />
        </Link>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {isSeller ? (<>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: 'clamp(28px, calc(14vw - 72px), 72px)', color: 'rgba(255,255,255,0.97)', lineHeight: 0.88, letterSpacing: '-0.05em', whiteSpace: 'nowrap' }}>СТАТЬ</p>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: 'clamp(28px, calc(14vw - 72px), 72px)', color: 'rgba(255,255,255,0.97)', lineHeight: 0.88, letterSpacing: '-0.05em', whiteSpace: 'nowrap' }}>ИСПОЛНИТЕЛЕМ</p>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(14px, calc(6.5vw - 33px), 34px)', color: 'rgba(255,255,255,0.4)', letterSpacing: '-0.04em', marginTop: '8px', whiteSpace: 'nowrap' }}>НА ПЛАТФОРМЕ</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginTop: '20px', lineHeight: 1.6, maxWidth: '280px' }}>
              Размещайте услуги, принимайте заказы и получайте оплату от тысяч клиентов HoReCa
            </p>
          </>) : (<>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: 'clamp(28px, calc(14vw - 72px), 72px)', color: 'rgba(255,255,255,0.95)', lineHeight: 0.88, letterSpacing: '-0.05em', whiteSpace: 'nowrap' }}>РЕГИСТРАЦИЯ</p>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'clamp(14px, calc(6.5vw - 33px), 34px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '-0.04em', marginTop: '8px', whiteSpace: 'nowrap' }}>НА ПЛАТФОРМЕ</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '20px', lineHeight: 1.6, maxWidth: '280px' }}>
              Найдите лучших исполнителей для вашего заведения или разместите свои услуги
            </p>
          </>)}
        </div>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>© 2025 Unit One</p>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: '520px', flexShrink: 0, background: 'var(--ink-3)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        padding: '40px 48px', overflowY: 'auto', maxHeight: '100vh',
      }}>
        <p style={{
          fontFamily: 'var(--ff-display)',
          fontWeight: 800, fontSize: '24px', color: '#fff',
          letterSpacing: '-0.04em', marginBottom: '20px',
        }}>СОЗДАТЬ АККАУНТ</p>

        {/* Role toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px',
          background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px',
          marginBottom: '24px',
        }}>
          {(['BUYER', 'SELLER'] as const).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)} style={{
              padding: '10px', borderRadius: '7px', fontSize: '13px', fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: role === r ? (r === 'SELLER' ? 'var(--blue)' : '#fff') : 'transparent',
              color: role === r ? (r === 'SELLER' ? '#fff' : 'var(--ink)') : 'rgba(255,255,255,0.35)',
            }}>
              {r === 'BUYER' ? 'Покупатель' : 'Исполнитель'}
            </button>
          ))}
        </div>

        <form action={formAction} noValidate>
          <input type="hidden" name="role" value={role} />
          {isSeller && <input type="hidden" name="businessType" value={bizType} />}

          {state.errors?.general && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', color: '#f87171', fontSize: '13px' }}>
              {state.errors.general[0]}
            </div>
          )}

          {/* Base fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Имя" name="name" placeholder="Ваше имя" required error={state.errors?.name?.[0]} />
            <Field label="Телефон" name="phone" placeholder="+7 900 000-00-00" error={undefined} />
          </div>
          <Field label="Email" name="email" type="email" placeholder="example@mail.ru" required error={state.errors?.email?.[0]} />

          {/* Password */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Пароль<span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'} name="password"
                autoComplete="new-password" placeholder="Минимум 8 символов"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '10px 44px 10px 13px', borderRadius: 'var(--r-md)', boxSizing: 'border-box',
                  border: state.errors?.password ? '1.5px solid #f87171' : '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)', fontSize: '13px', color: '#fff', outline: 'none',
                }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
              }}>
                {showPwd
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: strength.color, fontWeight: 600 }}>{strength.label}</p>
              </div>
            )}
            {state.errors?.password && <p style={{ fontSize: '11px', color: '#f87171', marginTop: '3px' }}>{state.errors.password[0]}</p>}
          </div>

          {/* Seller-only section */}
          {isSeller && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '18px', marginTop: '4px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                Данные исполнителя
              </p>

              {/* Business type */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Тип бизнеса<span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {(['SELF_EMPLOYED', 'IP', 'COMPANY'] as BizType[]).map(bt => (
                    <button key={bt} type="button" onClick={() => setBizType(bt)} style={{
                      padding: '9px 6px', borderRadius: '7px', fontSize: '12px', fontWeight: 700,
                      border: bizType === bt ? '1.5px solid var(--blue)' : '1.5px solid rgba(255,255,255,0.1)',
                      background: bizType === bt ? 'rgba(61,90,254,0.15)' : 'rgba(255,255,255,0.04)',
                      color: bizType === bt ? 'var(--blue)' : 'rgba(255,255,255,0.45)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {BIZ_LABELS[bt]}
                    </button>
                  ))}
                </div>
                {state.errors?.businessType && <p style={{ fontSize: '11px', color: '#f87171', marginTop: '3px' }}>{state.errors.businessType[0]}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field
                  label={bizType === 'COMPANY' ? 'ИНН (10 цифр)' : 'ИНН (12 цифр)'}
                  name="inn" placeholder={bizType === 'COMPANY' ? '1234567890' : '123456789012'}
                  required error={state.errors?.inn?.[0]}
                />
                <Field
                  label="Название компании"
                  name="companyName"
                  placeholder={bizType === 'SELF_EMPLOYED' ? 'Иванов Иван' : bizType === 'IP' ? 'ИП Иванов И.И.' : 'ООО «Название»'}
                />
              </div>

              {needOgrn && (
                <Field
                  label={bizType === 'IP' ? 'ОГРНИП (15 цифр)' : 'ОГРН (13 цифр)'}
                  name="ogrn"
                  placeholder={bizType === 'IP' ? '123456789012345' : '1234567890123'}
                />
              )}

              {needKpp && (
                <Field label="КПП (9 цифр)" name="kpp" placeholder="123456789" />
              )}

              {needAddress && (
                <Field label="Юридический адрес" name="legalAddress" placeholder="г. Москва, ул. Примерная, д. 1" />
              )}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', marginTop: '4px', marginBottom: '4px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  Банковские реквизиты
                </p>
              </div>

              <Field
                label="Расчётный счёт (20 цифр)" name="bankAccount"
                placeholder="40802810000000000000" required error={state.errors?.bankAccount?.[0]}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field
                  label="БИК банка (9 цифр)" name="bankBik"
                  placeholder="044525225" required error={state.errors?.bankBik?.[0]}
                />
                <Field label="Название банка" name="bankName" placeholder="Сбербанк" />
              </div>

              {needCorr && (
                <Field
                  label="Корр. счёт (20 цифр)" name="bankCorrAccount"
                  placeholder="30101810400000000225"
                />
              )}
            </div>
          )}

          <button type="submit" disabled={pending} style={{
            width: '100%', padding: '14px', borderRadius: '8px', marginTop: '8px',
            background: pending ? btnDisabledBg : btnBg,
            color: pending ? 'rgba(255,255,255,0.35)' : btnColor,
            fontSize: '14px', fontWeight: 800,
            fontFamily: 'Impact, "Arial Black", sans-serif',
            fontStyle: 'italic', letterSpacing: '0.03em', textTransform: 'uppercase',
            border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}>
            {pending ? 'СОЗДАНИЕ...' : 'ЗАРЕГИСТРИРОВАТЬСЯ →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Уже есть аккаунт?{' '}
          <Link href="/login" style={{ color: accentColor, fontWeight: 700, textDecoration: 'none', transition: 'color 0.3s' }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
