'use client'

import Image from 'next/image'
import { type ReactNode, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const INTERVAL = 5000

/**
 * Seule partie interactive du hero : le fondu entre les photos et les
 * indicateurs. Le texte (children) est rendu côté serveur et passé tel quel.
 */
export function HeroCarousel({ images, children }: { images: string[]; children: ReactNode }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setCurrent((prev) => (prev + 1) % images.length), INTERVAL)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <>
      <div className="absolute inset-0 -z-10" aria-hidden>
        {images.map((src, i) => (
          <div
            key={src + i}
            className={cn(
              'absolute inset-0 transition-opacity duration-[1200ms] ease-[var(--ease-out-soft)]',
              i === current ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="100vw"
              preload={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={cn('object-cover', i === current && i !== 0 && 'animate-ken-burns')}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>

      {children}

      {images.length > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Afficher la photo ${i + 1}`}
              aria-pressed={i === current}
              onClick={() => setCurrent(i)}
              className={cn(
                'h-1 rounded-full transition-all duration-500',
                i === current ? 'w-8 bg-white' : 'w-4 bg-white/35 hover:bg-white/55'
              )}
            />
          ))}
        </div>
      )}
    </>
  )
}
