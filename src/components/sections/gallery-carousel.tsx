import Image from 'next/image'

import { ScrollerButtons, ScrollerProgress } from '@/components/sections/scroller-controls'

const TRACK_ID = 'galerie-accueil'

/**
 * Carrousel photo de l'accueil : défilement natif aimanté (doigt, molette,
 * clavier), rendu côté serveur ; seuls les boutons et la barre de progression
 * sont des îlots client.
 */
export function GalleryCarousel({ eyebrow, title, images }: { eyebrow: string; title: string; images: string[] }) {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="font-display text-xs font-semibold tracking-[0.22em] text-primary uppercase">{eyebrow}</p>
            <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">{title}</h2>
          </div>
          <ScrollerButtons targetId={TRACK_ID} />
        </div>

        <div
          id={TRACK_ID}
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

        <ScrollerProgress targetId={TRACK_ID} />
      </div>
    </section>
  )
}
