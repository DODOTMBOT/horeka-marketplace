'use client'

import { useTransition, useState } from 'react'
import { toggleFavorite } from '@/actions/favorites'

export default function FavoriteButton({
  serviceId,
  isFavorited: initial,
}: {
  serviceId: string
  isFavorited: boolean
}) {
  const [favorited, setFavorited] = useState(initial)
  const [pending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const res = await toggleFavorite(serviceId)
      if (res && typeof res.favorited === 'boolean') setFavorited(res.favorited)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      style={{
        position: 'absolute', top: '10px', right: '10px',
        width: '30px', height: '30px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        border: favorited ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.6)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '14px',
        transition: 'transform 0.15s, border-color 0.15s',
        opacity: pending ? 0.7 : 1,
        transform: pending ? 'scale(0.9)' : 'scale(1)',
      }}
      title={favorited ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {favorited ? '❤️' : '🤍'}
    </button>
  )
}
