import { ArrowRight, CalendarDays } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import type { homeDefaults } from '@/content/pages'

type Cta = (typeof homeDefaults)['cta']

function ScrollColumn({ images, direction, seconds }: { images: string[]; direction: 'up' | 'down'; seconds: number }) {
  // Deux copies à la suite + translation de 50 % : boucle sans couture.
  const doubled = [...images, ...images]
  return (
    <div className="w-[130px] shrink-0 lg:w-[150px]">
      <div
        className={`flex flex-col gap-3 ${direction === 'up' ? 'animate-marquee-up' : 'animate-marquee-down'}`}
        style={{ '--marquee-duration': `${seconds}s` } as CSSProperties}
      >
        {doubled.map((src, i) => (
          <div key={`${direction}-${i}`} className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-2xl">
            <Image src={src} alt="" fill sizes="150px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Bloc de conversion. Deux voies, jamais plus : le formulaire (page Contact)
 * et, s'il est configuré, le lien de rendez-vous (siteConfig.appointmentUrl).
 * Pas de téléphone, d'e-mail ni de WhatsApp ici : le pied de page s'en charge.
 */
export function CtaSection({ cta }: { cta: Cta }) {
  const half = Math.ceil(cta.images.length / 2)
  const appointmentUrl = siteConfig.appointmentUrl

  return (
    <section className="bg-surface-tint">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="reveal relative overflow-hidden rounded-[2rem] border border-border/80 bg-white shadow-[var(--shadow-lg)] dark:bg-zinc-900">
          <div className="relative flex min-h-[420px] items-stretch sm:min-h-[460px]">
            <div className="relative z-10 flex flex-1 flex-col justify-center space-y-6 p-10 sm:p-14">
              <p className="font-display text-xs font-semibold tracking-[0.22em] text-primary uppercase">{cta.eyebrow}</p>
              <h2 className="max-w-xl font-display text-3xl tracking-tight text-balance text-foreground sm:text-4xl">
                {cta.title}
              </h2>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">{cta.description}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="group" asChild>
                  <Link href="/contact#formulaire">
                    {cta.button}
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                {appointmentUrl && (
                  <Button size="lg" variant="outline" className="group" asChild>
                    <a href={appointmentUrl} target="_blank" rel="noopener noreferrer">
                      <CalendarDays aria-hidden />
                      {cta.appointmentButton}
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="relative hidden w-[300px] shrink-0 overflow-hidden md:block lg:w-[340px]" aria-hidden>
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-white to-transparent dark:from-zinc-900" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-white to-transparent dark:from-zinc-900" />
              <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-white to-transparent dark:from-zinc-900" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="flex translate-x-[10%] -rotate-6 gap-3" style={{ height: '140%', marginTop: '-20%' }}>
                  <ScrollColumn images={cta.images.slice(0, half)} direction="up" seconds={40} />
                  <ScrollColumn images={cta.images.slice(half)} direction="down" seconds={45} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
