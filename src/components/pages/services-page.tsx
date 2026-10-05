import Image from 'next/image'
import type { CSSProperties } from 'react'

import { CtaSection } from '@/components/sections/cta-section'
import { PremiumHero } from '@/components/sections/premium-hero'
import type { ServiceItem, homeDefaults, servicesDefaults } from '@/content/pages'
import { NamedIcon } from '@/components/ui/named-icon'

const stagger = (i: number) => ({ '--stagger': i }) as CSSProperties

function ServiceRow({ service, index }: { service: ServiceItem; index: number }) {
  const reversed = index % 2 === 1

  return (
    <article
      id={`service-${index + 1}`}
      className={`grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-12 ${reversed ? 'lg:[&>*:first-child]:order-2' : ''}`}
    >
      <div
        className={`${reversed ? 'reveal-right' : 'reveal-left'} parallax-scope group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_20px_50px_-20px_oklch(0.2_0.02_264/0.25)] ring-1 ring-border/60 transition-transform duration-500 hover:-translate-y-1`}
        style={{ '--reveal-distance': '60px' } as CSSProperties}
      >
        {service.image && (
          <div className="parallax-y-scoped absolute inset-x-0 -inset-y-10" style={{ '--parallax': '40px' } as CSSProperties}>
            <Image
              src={service.image}
              alt={service.title}
              fill
              sizes="(min-width: 1152px) 540px, (min-width: 1024px) 50vw, 100vw"
              loading={index < 2 ? 'eager' : 'lazy'}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </div>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent" />
        <span
          aria-hidden
          className="absolute top-5 left-5 rounded-full bg-background/90 px-3 py-1 font-display text-[11px] font-bold tracking-[0.18em] text-foreground backdrop-blur-sm"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="max-w-xl">
        <span
          className={`${reversed ? 'reveal-left' : 'reveal-right'} inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20`}
          style={stagger(0)}
        >
          <NamedIcon name={service.iconName} className="size-5" aria-hidden />
        </span>
        <h2
          className={`${reversed ? 'reveal-left' : 'reveal-right'} mt-5 font-display text-[28px] leading-tight font-semibold tracking-[-0.02em] text-foreground sm:text-3xl lg:text-4xl`}
          style={stagger(1)}
        >
          {service.title}
        </h2>
        <p className="reveal mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg" style={stagger(2)}>
          {service.description}
        </p>
        {service.points.length > 0 && (
          <ul className="mt-6 space-y-2.5">
            {service.points.map((p, i) => (
              <li key={p} className="reveal-left flex items-center gap-3 text-sm text-foreground/80" style={stagger(3 + i)}>
                <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <svg viewBox="0 0 12 12" fill="none" className="size-3">
                    <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

/** Corps de la page Services (route /services et aperçu de l'admin). */
export function ServicesPage({ services, cta }: { services: typeof servicesDefaults; cta: (typeof homeDefaults)['cta'] }) {
  const { hero } = services
  return (
    <>
      <PremiumHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        breadcrumb="Services"
        backgroundImage={hero.image}
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
          {services.kpis.map((kpi, i, arr) => (
            <li key={kpi.label} className="flex items-center gap-x-8">
              <span className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-semibold tracking-tight text-white">{kpi.value}</span>
                <span className="text-white/70">{kpi.label}</span>
              </span>
              {i < arr.length - 1 && <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline" aria-hidden />}
            </li>
          ))}
        </ul>
      </PremiumHero>

      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="space-y-16 lg:space-y-20">
            {services.services.map((s, i) => (
              <ServiceRow key={s.title || i} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection cta={cta} />
    </>
  )
}
