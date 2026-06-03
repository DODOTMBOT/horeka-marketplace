'use client'

import Link from 'next/link'

const CLOUDS = [
  {
    title: 'Маркетплейс услуг',
    desc: 'Специалисты по меню, сервису, автоматизации и всему, что нужно заведению',
    href: '/catalog',
    cta: 'Открыть каталог',
    bg: 'var(--ink)',
    color: '#fff',
    ctaBg: 'var(--lime)',
    ctaColor: 'var(--ink)',
    anim: 'cloudFloat1',
    duration: '9s',
    delay: '0s',
    br: '40px 28px 44px 32px',
  },
  {
    title: 'Вакансии и резюме',
    desc: 'Работа в ресторанах, отелях и кафе. Найдите команду или новое место',
    href: '/jobs',
    cta: 'Смотреть вакансии',
    bg: 'var(--lime)',
    color: 'var(--ink)',
    ctaBg: 'var(--ink)',
    ctaColor: 'var(--lime)',
    anim: 'cloudFloat2',
    duration: '12s',
    delay: '-3s',
    br: '28px 44px 32px 40px',
  },
  {
    title: 'Поставщики',
    desc: 'Продукты, оборудование и расходники с прямыми контактами поставщиков',
    href: '/suppliers',
    cta: 'Найти поставщика',
    bg: '#fff',
    color: 'var(--ink)',
    ctaBg: 'var(--blue)',
    ctaColor: '#fff',
    anim: 'cloudFloat3',
    duration: '10.5s',
    delay: '-6s',
    br: '44px 32px 28px 40px',
  },
]

export default function CloudSections() {
  return (
    <section style={{ background: 'var(--paper)', padding: '56px 28px 72px' }}>
      <style>{`
        @keyframes cloudFloat1 {
          0%   { transform: translate(0px, 0px) rotate(-0.4deg); }
          20%  { transform: translate(7px, -9px) rotate(0.5deg); }
          45%  { transform: translate(4px, 5px) rotate(-0.3deg); }
          70%  { transform: translate(-6px, -4px) rotate(0.4deg); }
          100% { transform: translate(0px, 0px) rotate(-0.4deg); }
        }
        @keyframes cloudFloat2 {
          0%   { transform: translate(0px, 0px) rotate(0.3deg); }
          30%  { transform: translate(-8px, 6px) rotate(-0.5deg); }
          60%  { transform: translate(5px, -7px) rotate(0.4deg); }
          100% { transform: translate(0px, 0px) rotate(0.3deg); }
        }
        @keyframes cloudFloat3 {
          0%   { transform: translate(0px, 0px) rotate(-0.2deg); }
          25%  { transform: translate(6px, 8px) rotate(0.4deg); }
          55%  { transform: translate(-7px, 3px) rotate(-0.4deg); }
          80%  { transform: translate(4px, -6px) rotate(0.2deg); }
          100% { transform: translate(0px, 0px) rotate(-0.2deg); }
        }
        .cloud-card {
          will-change: transform;
          transition: box-shadow 0.25s, scale 0.25s;
        }
        .cloud-card:hover {
          animation-play-state: paused;
          scale: 1.025;
          box-shadow: 0 24px 60px rgba(0,0,0,0.14);
        }
      `}</style>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        alignItems: 'center',
      }}>
        {CLOUDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="cloud-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: c.bg,
              borderRadius: c.br,
              padding: '40px 36px',
              textDecoration: 'none',
              animation: `${c.anim} ${c.duration} ease-in-out ${c.delay} infinite`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
              minHeight: '260px',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{
                fontFamily: 'var(--ff-display)',
                fontWeight: 800,
                fontSize: '26px',
                color: c.color,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                marginBottom: '12px',
              }}>
                {c.title}
              </h2>
              <p style={{
                fontSize: '14px',
                color: c.color,
                opacity: 0.6,
                lineHeight: 1.55,
                maxWidth: '260px',
              }}>
                {c.desc}
              </p>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              marginTop: '32px',
              padding: '11px 20px',
              borderRadius: '999px',
              background: c.ctaBg,
              color: c.ctaColor,
              fontSize: '13px',
              fontWeight: 700,
              width: 'fit-content',
              letterSpacing: '-0.01em',
            }}>
              {c.cta}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
