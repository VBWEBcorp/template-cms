'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

const CARD_WIDTH = 340
const GAP = 20

/**
 * Carrousel photo de l'accueil : défilement natif avec aimantation (glisser au
 * doigt, molette, clavier), boutons et barre de progression. Aucune bibliothèque.
 */
export function GalleryCarousel({ eyebrow, title, images }: { eyebrow: string; title: string; images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const track = trackRef.current
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
  }, [])

  const slide = (dir: -1 | 1) => trackRef.current?.scrollBy({ left: dir * (CARD_WIDTH + GAP), behavior: 'smooth' })

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="font-display text-xs font-semibold tracking-[0.22em] text-primary uppercase">{eyebrow}</p>
            <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">{title}</h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-full sm:size-11"
              aria-label="Photo précédente"
              onClick={() => slide(-1)}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-full sm:size-11"
              aria-label="Photo suivante"
              onClick={() => slide(1)}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>

        <div
          ref={trackRef}
          role="region"
          aria-label="Galerie photos"
          tabIndex={0}
          className="scrollbar-hide mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth focus-visible:outline-2 focus-visible:outline-ring"
        >
          {images.map((src, i) => (
            <div key={src + i} className="w-[min(340px,80vw)] shrink-0 snap-start">
              <div className="group overflow-hidden rounded-2xl border border-border/80 bg-card/70 shadow-[var(--shadow-sm)] ring-1 ring-foreground/5 transition-shadow duration-300 hover:shadow-[var(--shadow-md)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={src}
                    alt={`${title} : photo ${i + 1}`}
                    fill
                    sizes="(min-width: 640px) 340px, 80vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center" aria-hidden>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-border">
            <div
              className="h-full origin-left rounded-full bg-primary/60 transition-transform duration-150"
              style={{ transform: `scaleX(${Math.max(progress, 0.02)})` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
