import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

import { AccentTitle } from '@/components/sections/accent-title'
import { HeroCarousel } from '@/components/sections/hero-carousel'
import { ValuesMarquee } from '@/components/sections/values-marquee'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import type { homeDefaults } from '@/content/pages'

type Hero = (typeof homeDefaults)['hero']

const AVATAR_GRADIENTS = [0, 1, 2, 3].map(
  (i) =>
    `linear-gradient(135deg, oklch(${0.55 + i * 0.05} 0.18 calc(var(--brand-hue) - ${25 - i * 15}) / 0.85), oklch(${0.65 + i * 0.04} 0.15 calc(var(--brand-hue) + ${i * 10}) / 0.65))`
)

/** Hero de l'accueil : texte rendu serveur, seul le carrousel de photos est interactif. */
export function HeroSection({ hero }: { hero: Hero }) {
  const rating = siteConfig.rating

  return (
    <section className="relative isolate overflow-hidden border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <HeroCarousel images={hero.images}>
          <div className="animate-fade-up mx-auto max-w-3xl text-center">
            <p className="font-display text-xs font-semibold tracking-[0.22em] text-white/70 uppercase">{hero.eyebrow}</p>

            <h1 className="mt-6 pb-1 font-display text-4xl leading-[1.15] font-semibold tracking-[-0.035em] text-balance text-white sm:text-5xl lg:text-6xl">
              <AccentTitle title={hero.title} accentClassName="text-primary-on-dark" />
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-white/75 sm:text-xl">
              {hero.description}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="group/cta relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-primary)] transition-all hover:shadow-[var(--shadow-primary-hover)] active:translate-y-px"
              >
                <span aria-hidden className="bg-brand-gradient absolute inset-0" />
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                <span className="relative">{hero.button1}</span>
                <ArrowRight
                  aria-hidden
                  className="relative size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5"
                />
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-xl border-white/25 bg-white/10 px-5 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link href="/services">{hero.button2}</Link>
              </Button>
            </div>

            {rating && (
              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5">
                <div className="flex -space-x-2" aria-hidden>
                  {AVATAR_GRADIENTS.map((background, i) => (
                    <div key={i} className="size-7 rounded-full ring-2 ring-black/30" style={{ background }} />
                  ))}
                </div>
                <p className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-0.5 text-amber-300" aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </span>
                  <span className="font-medium text-white">{rating.value}/5</span>
                  <span className="text-white/70">
                    · {rating.count} sur {rating.source}
                  </span>
                </p>
              </div>
            )}
          </div>
        </HeroCarousel>
      </div>

      <ValuesMarquee variant="dark" />
    </section>
  )
}
