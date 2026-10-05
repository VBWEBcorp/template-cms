'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

const BUTTON =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-all outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px sm:size-11 dark:border-input dark:bg-input/30'

/** Boutons précédent / suivant d'un défilement horizontal rendu côté serveur (cible par id). */
export function ScrollerButtons({ targetId, step = 360 }: { targetId: string; step?: number }) {
  const slide = (dir: -1 | 1) =>
    document.getElementById(targetId)?.scrollBy({ left: dir * step, behavior: 'smooth' })

  return (
    <div className="flex shrink-0 gap-2">
      <button type="button" className={BUTTON} aria-label="Photo précédente" aria-controls={targetId} onClick={() => slide(-1)}>
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button type="button" className={BUTTON} aria-label="Photo suivante" aria-controls={targetId} onClick={() => slide(1)}>
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  )
}

/** Barre de progression du même défilement. */
export function ScrollerProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const track = document.getElementById(targetId)
    if (!track) return
    const update = () => {
      const max = track.scrollWidth - track.clientWidth
      setProgress(max > 0 ? track.scrollLeft / max : 0)
    }
    update()
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      track.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [targetId])

  return (
    <div className="mt-6 flex justify-center" aria-hidden>
      <div className="h-1 w-32 overflow-hidden rounded-full bg-border">
        <div
          className="h-full origin-left rounded-full bg-primary/60 transition-transform duration-150"
          style={{ transform: `scaleX(${Math.max(progress, 0.02)})` }}
        />
      </div>
    </div>
  )
}
