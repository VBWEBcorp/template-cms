import { ChevronRight, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { AccentTitle } from '@/components/sections/accent-title'

interface PremiumHeroProps {
  eyebrow: string
  title: string
  description?: string
  /** Libellé de la page dans le fil d'Ariane. */
  breadcrumb: string
  /** Photo de fond plein écran (texte blanc par-dessus). */
  backgroundImage?: string
  /** Contenu additionnel sous la description (chiffres, badges...). */
  children?: ReactNode
}

/** En-tête des pages intérieures : fil d'Ariane, h1, description. Rendu serveur. */
export function PremiumHero({ eyebrow, title, description, breadcrumb, backgroundImage, children }: PremiumHeroProps) {
  const dark = Boolean(backgroundImage)

  return (
    <section
      className={`relative isolate overflow-hidden border-b border-border/60 ${dark ? 'bg-background' : 'bg-surface-tint'}`}
    >
      {backgroundImage && (
        <>
          <div className="absolute inset-0 -z-20" aria-hidden>
            <Image src={backgroundImage} alt="" fill sizes="100vw" preload className="object-cover" />
          </div>
          <div
            className="absolute inset-0 -z-10"
            aria-hidden
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.60) 70%, rgba(0,0,0,0) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-background to-transparent" aria-hidden />
        </>
      )}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="pt-24 sm:pt-28">
          <ol className={`flex flex-wrap items-center gap-1.5 text-xs ${dark ? 'text-white/70' : 'text-muted-foreground'}`}>
            <li className="flex items-center gap-1.5">
              <Link
                href="/"
                className={`flex items-center gap-1 transition-colors ${dark ? 'hover:text-white' : 'hover:text-foreground'}`}
              >
                <Home className="size-3" aria-hidden />
                <span>Accueil</span>
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className={`size-3 ${dark ? 'text-white/40' : 'text-muted-foreground/50'}`} aria-hidden />
              <span aria-current="page" className={dark ? 'font-medium text-white/90' : 'font-medium text-foreground'}>
                {breadcrumb}
              </span>
            </li>
          </ol>
        </nav>

        <div className="pt-10 pb-20 text-center sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32">
          <div className="animate-fade-up mx-auto max-w-3xl">
            <p
              className={`font-display text-xs font-semibold tracking-[0.22em] uppercase ${dark ? 'text-white/70' : 'text-primary'}`}
            >
              {eyebrow}
            </p>
            <h1
              className={`mt-6 pb-1 font-display text-4xl leading-[1.15] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-[60px] ${
                dark ? 'text-white' : 'text-foreground'
              }`}
            >
              <AccentTitle title={title} accentClassName={dark ? 'text-primary-on-dark' : 'text-primary'} />
            </h1>
            {description && (
              <p
                className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg ${
                  dark ? 'text-white/75' : 'text-muted-foreground'
                }`}
              >
                {description}
              </p>
            )}
            {children && <div className="mt-10">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}
