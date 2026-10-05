import { ChevronRight, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { AccentTitle } from '@/components/sections/accent-title'
import { CtaSection } from '@/components/sections/cta-section'
import { SectionTitle } from '@/components/ui/section-title'
import type { aboutDefaults, homeDefaults } from '@/content/pages'
import { NamedIcon } from '@/components/ui/named-icon'

type About = typeof aboutDefaults

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

function AboutHero({ hero, stats }: { hero: About['hero']; stats: About['stats'] }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/60 bg-surface-tint">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="pt-24 sm:pt-28">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
                <Home className="size-3" aria-hidden />
                <span>Accueil</span>
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="size-3 text-muted-foreground/50" aria-hidden />
              <span aria-current="page" className="font-medium text-foreground">
                À propos
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid items-center gap-12 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-20 lg:pb-28">
          <div className="animate-fade-up">
            <p className="font-display text-xs font-semibold tracking-[0.22em] text-primary uppercase">{hero.eyebrow}</p>
            <h1 className="mt-6 pb-1 font-display text-4xl leading-[1.15] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-5xl lg:text-[56px]">
              <AccentTitle title={hero.title} />
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {hero.description}
            </p>

            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {stats.map((s, i) => (
                <li key={s.label} className="animate-fade-up" style={delay(300 + i * 60)}>
                  <p className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-scale-in relative" style={delay(150)}>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-3xl"
              style={{ background: 'radial-gradient(ellipse at center, oklch(0.55 0.2 var(--brand-hue) / 0.3) 0%, transparent 70%)' }}
            />
            <div className="relative overflow-hidden rounded-2xl bg-background/40 p-1.5 shadow-[0_30px_60px_-20px_oklch(0.2_0.02_264/0.3)] ring-1 ring-border/60 backdrop-blur-xl">
              <div aria-hidden className="gradient-ring rounded-2xl [--ring-alpha:0.4]" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl lg:aspect-[3/4]">
                <Image
                  src={hero.image}
                  alt={hero.title}
                  fill
                  sizes="(min-width: 1024px) 500px, 100vw"
                  preload
                  className="object-cover"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
              </div>
            </div>

            <div
              className="animate-scale-in absolute -bottom-4 -left-4 hidden rounded-2xl bg-background/90 px-4 py-3 shadow-[0_20px_40px_-12px_oklch(0.2_0.02_264/0.25)] ring-1 ring-border/60 backdrop-blur-xl sm:block lg:-bottom-6 lg:-left-6"
              style={delay(500)}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="size-7 rounded-full ring-2 ring-background"
                      style={{
                        background: `linear-gradient(135deg, oklch(${0.55 + i * 0.05} 0.18 calc(var(--brand-hue) - ${25 - i * 15}) / 0.8), oklch(${0.65 + i * 0.04} 0.15 calc(var(--brand-hue) + ${i * 10}) / 0.6))`,
                      }}
                    />
                  ))}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">{hero.badgeTitle}</p>
                  <p className="text-muted-foreground">{hero.badgeText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ValuesTimeline({ values }: { values: About['values'] }) {
  return (
    <div className="relative mx-auto mt-14 max-w-4xl">
      <div aria-hidden className="absolute top-0 left-4 h-full w-px bg-border md:left-1/2 md:-translate-x-1/2" />
      <div
        aria-hidden
        className="fill-y-on-scroll absolute top-0 left-4 h-full w-px bg-gradient-to-b from-primary via-primary to-primary-deep md:left-1/2 md:-translate-x-1/2"
      />

      <ul className="space-y-12 md:space-y-16">
        {values.map((v, i) => {
          const right = i % 2 === 1
          return (
            <li key={v.title || i} className="relative">
              <div className="reveal-scale absolute top-6 left-4 z-10 -translate-x-1/2 md:left-1/2">
                <span className="relative flex size-10 items-center justify-center rounded-full bg-background shadow-[0_0_20px_oklch(0.55_0.2_var(--brand-hue)/0.4)] ring-1 ring-primary/30">
                  <span aria-hidden className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 to-primary/5" />
                  <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  <NamedIcon name={v.iconName} className="relative size-4 text-primary" aria-hidden />
                </span>
              </div>

              <div
                className={`${right ? 'reveal-right' : 'reveal-left'} ml-14 md:ml-0 md:w-[calc(50%-2.5rem)] ${
                  right ? 'md:ml-[calc(50%+2.5rem)]' : 'md:mr-[calc(50%+2.5rem)]'
                }`}
                style={{ '--reveal-distance': '20px' } as CSSProperties}
              >
                <div className="group relative overflow-hidden rounded-2xl bg-card/80 p-6 shadow-[0_8px_24px_-12px_oklch(0.2_0.02_264/0.15)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_oklch(0.2_0.02_264/0.25)]">
                  <div aria-hidden className="gradient-ring rounded-2xl" />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-primary/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[11px] font-bold tracking-[0.2em] text-primary">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                    </div>
                    <h3 className="mt-3 font-display text-xl leading-tight tracking-[-0.01em] text-foreground">{v.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{v.description}</p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Corps de la page À propos (route /a-propos et aperçu de l'admin). */
export function AboutPage({ about, cta }: { about: About; cta: (typeof homeDefaults)['cta'] }) {
  return (
    <>
      <AboutHero hero={about.hero} stats={about.stats} />
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <SectionTitle eyebrow={about.valuesIntro.eyebrow} title={about.valuesIntro.title} />
          <ValuesTimeline values={about.values} />
        </div>
      </section>
      <CtaSection cta={cta} />
    </>
  )
}
