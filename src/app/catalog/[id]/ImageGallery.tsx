'use client'

import { useState } from 'react'

export default function ImageGallery({ images, alt, icon }: { images: string[]; alt: string; icon: string | null }) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div style={{
        height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '80px', background: 'var(--paper-2)',
      }}>
        {icon ?? '📦'}
      </div>
    )
  }

  return (
    <div>
      {/* Main image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '420px', background: 'var(--paper-2)' }}>
        <img
          key={active}
          src={images[active]}
          alt={alt}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            animation: 'imgReveal 0.3s ease both',
          }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive(i => (i - 1 + images.length) % images.length)}
              style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(15,15,18,0.6)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer', color: '#fff', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,15,18,0.85)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,15,18,0.6)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)' }}
            >‹</button>
            <button
              onClick={() => setActive(i => (i + 1) % images.length)}
              style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(15,15,18,0.6)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer', color: '#fff', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,15,18,0.85)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,15,18,0.6)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)' }}
            >›</button>

            {/* Dot indicators */}
            <div style={{
              position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '5px', alignItems: 'center',
              background: 'rgba(15,15,18,0.45)', backdropFilter: 'blur(8px)',
              padding: '5px 10px', borderRadius: '999px',
            }}>
              {images.map((_, i) => (
                <span key={i} onClick={() => setActive(i)} style={{
                  width: i === active ? '20px' : '6px', height: '6px',
                  borderRadius: '3px', cursor: 'pointer',
                  background: i === active ? 'var(--lime)' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                }} />
              ))}
            </div>
          </>
        )}

        {/* Counter badge */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'rgba(15,15,18,0.55)', backdropFilter: 'blur(8px)',
            borderRadius: 'var(--r-sm)', padding: '4px 10px',
            fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 700,
            color: '#fff', letterSpacing: '0.04em',
          }}>
            {active + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto', background: 'var(--paper-2)' }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: '72px', height: '54px', flexShrink: 0, cursor: 'pointer',
                borderRadius: 'var(--r-sm)', overflow: 'hidden',
                border: `2px solid ${i === active ? 'var(--ink)' : 'transparent'}`,
                opacity: i === active ? 1 : 0.5,
                transition: 'all 0.15s',
                transform: i === active ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes imgReveal {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
