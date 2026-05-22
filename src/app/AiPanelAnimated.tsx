'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Phase = 'idle' | 'typing-user' | 'ai-thinking' | 'typing-ai' | 'done'

const START_DELAY  = 700
const CHAR_DELAY   = 42
const AI_CHAR_DELAY = 28
const THINK_TIME   = 1600
const LOOP_PAUSE   = 5000

const USER_MSG = 'Не могу никак выйти в прибыль, сможете помочь определить проблему?'
const AI_MSG   = 'Конечно! У нас множество инструментов и специалистов, готовых решить Вашу проблему.'

export default function AiPanelAnimated() {
  const [phase, setPhase]     = useState<Phase>('idle')
  const [userText, setUserText] = useState('')
  const [aiText, setAiText]   = useState('')
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>

    function reset() {
      setPhase('idle'); setUserText(''); setAiText(''); setShowCta(false)
    }

    function typeString(
      str: string,
      delay: number,
      setter: (s: string) => void,
      onDone: () => void
    ) {
      let i = 0
      const tick = setInterval(() => {
        i++
        setter(str.slice(0, i))
        if (i >= str.length) { clearInterval(tick); onDone() }
      }, delay)
      return tick
    }

    function run() {
      reset()
      t = setTimeout(() => {
        setPhase('typing-user')
        typeString(USER_MSG, CHAR_DELAY, setUserText, () => {
          t = setTimeout(() => {
            setPhase('ai-thinking')
            t = setTimeout(() => {
              setPhase('typing-ai')
              typeString(AI_MSG, AI_CHAR_DELAY, setAiText, () => {
                t = setTimeout(() => {
                  setShowCta(true)
                  setPhase('done')
                  t = setTimeout(run, LOOP_PAUSE)
                }, 300)
              })
            }, THINK_TIME)
          }, 400)
        })
      }, START_DELAY)
    }

    run()
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @keyframes msgSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ctaIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        .typing-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.5); }
        .typing-dot:nth-child(1) { animation: dotBounce 1.1s ease-in-out infinite 0s; }
        .typing-dot:nth-child(2) { animation: dotBounce 1.1s ease-in-out infinite 0.18s; }
        .typing-dot:nth-child(3) { animation: dotBounce 1.1s ease-in-out infinite 0.36s; }
        @keyframes cursorBlink { 0%,49%{opacity:1}50%,100%{opacity:0} }
        .cursor { display:inline-block; width:2px; height:15px; background:rgba(255,255,255,0.7); border-radius:1px; vertical-align:middle; margin-left:2px; animation:cursorBlink 0.65s steps(1) infinite; }
        .ai-cursor { display:inline-block; width:2px; height:15px; background:var(--blue); border-radius:1px; vertical-align:middle; margin-left:2px; animation:cursorBlink 0.65s steps(1) infinite; }
      `}</style>

      <div style={{
        background: '#141418',
        borderRadius: '24px',
        padding: '28px',
        width: '420px',
        flexShrink: 0,
        boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 2 12 12"/><path d="m22 2-5 5"/><path d="m22 2-5 0"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 600,
              color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em',
            }}>
              UNIT.AI · ASSISTANT
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '24px' }} />

        {/* Min height so panel doesn't collapse during idle */}
        <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* User bubble */}
          {phase !== 'idle' && (
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              animation: 'msgSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '4px 16px 16px 16px',
                padding: '13px 16px', flex: 1,
              }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.55, margin: 0, fontFamily: 'var(--ff-display)' }}>
                  {userText}
                  {phase === 'typing-user' && <span className="cursor" />}
                </p>
              </div>
            </div>
          )}

          {/* AI thinking */}
          {phase === 'ai-thinking' && (
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              animation: 'msgSlideIn 0.3s ease both',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 2 12 12"/>
                </svg>
              </div>
              <div style={{
                background: 'rgba(61,90,254,0.15)',
                border: '1px solid rgba(61,90,254,0.25)',
                borderRadius: '16px 4px 16px 16px',
                padding: '13px 18px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          {/* AI response */}
          {(phase === 'typing-ai' || phase === 'done') && (
            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              animation: 'msgSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 2 12 12"/>
                </svg>
              </div>
              <div style={{
                background: 'rgba(61,90,254,0.15)',
                border: '1px solid rgba(61,90,254,0.25)',
                borderRadius: '16px 4px 16px 16px',
                padding: '13px 16px', flex: 1,
              }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55, margin: 0, fontFamily: 'var(--ff-display)' }}>
                  {aiText}
                  {phase === 'typing-ai' && <span className="ai-cursor" />}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        {showCta && (
          <div style={{ marginTop: '20px', animation: 'ctaIn 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>
            <Link href="/catalog" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
              padding: '15px 24px', borderRadius: '14px',
              background: 'var(--lime)', color: 'var(--ink)',
              fontSize: '14px', fontWeight: 800, textDecoration: 'none',
              letterSpacing: '-0.02em', fontFamily: 'var(--ff-display)',
            }}>
              Подобрать решение
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
