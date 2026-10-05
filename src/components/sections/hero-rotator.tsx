'use client'

import { useEffect, useState } from 'react'

import { cx } from '@/lib/cx'

const INTERVAL = 5000

/**
 * Seule partie interactive du hero : fait tourner les photos (rendues côté
 * serveur, marquées data-hero-slide) et affiche les indicateurs. Aucune image
 * n'est rendue ici, donc aucun code next/image envoyé au navigateur.
 */
export function HeroRotator({ count }: { count: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const slides = document.querySelectorAll<HTMLElement>('[data-hero-slide]')
    slides.forEach((slide, i) => {
      slide.dataset.active = String(i === current)
    })
  }, [current])

  useEffect(() => {
    if (count <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setCurrent((prev) => (prev + 1) % count), INTERVAL)
    return () => clearInterval(id)
  }, [count])

  if (count <= 1) return null

  return (
    <div className="mt-12 flex justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Afficher la photo ${i + 1}`}
          aria-pressed={i === current}
          onClick={() => setCurrent(i)}
          className={cx(
            'h-1 rounded-full transition-all duration-500',
            i === current ? 'w-8 bg-white' : 'w-4 bg-white/35 hover:bg-white/55'
          )}
        />
      ))}
    </div>
  )
}
