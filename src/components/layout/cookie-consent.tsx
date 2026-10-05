'use client'

import { Cookie, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cookie-consent'

/**
 * Bandeau de consentement aux cookies. Monté dans l'ossature du site
 * (src/app/(site)/layout.tsx) quand siteConfig.features.cookieBanner est vrai.
 *
 * Le choix est lu par `hasCookieConsent()` : tout traceur (mesure d'audience,
 * pixel publicitaire) ne doit être chargé que si elle renvoie true.
 */
export function hasCookieConsent(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'accepted'
  } catch {
    return false
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let consent: string | null = null
    try {
      consent = localStorage.getItem(STORAGE_KEY)
    } catch {
      return
    }
    if (consent) return
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const decide = (value: 'accepted' | 'refused') => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // stockage refusé : le bandeau reviendra à la prochaine visite
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="animate-fade-up fixed right-4 bottom-4 left-4 z-[100] sm:right-auto sm:max-w-[300px]"
      style={{ animationDuration: '280ms' }}
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[0_16px_40px_-12px_oklch(0.2_0.02_264/0.22)]">
        <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="gradient-ring rounded-2xl" />

        {/* Grand cookie décoratif en filigrane, qui tourne lentement */}
        <div aria-hidden className="pointer-events-none absolute -top-6 -right-5 animate-[spin_36s_linear_infinite] text-primary/10">
          <Cookie className="size-28" strokeWidth={1.5} />
        </div>

        <div className="relative">
          <div className="mb-2.5 flex items-start justify-between">
            <span className="animate-scale-in relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20">
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-xl bg-primary/15 opacity-60"
                style={{ animationDuration: '2.5s' }}
              />
              <span className="animate-wiggle relative inline-flex">
                <Cookie className="size-[18px]" strokeWidth={2} aria-hidden />
              </span>
            </span>

            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Fermer"
              className="-mt-1 -mr-1 flex size-6 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>

          <p id="cookie-title" className="font-display text-[13px] font-semibold text-foreground">
            Nous utilisons des cookies
          </p>
          <p id="cookie-desc" className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Pour améliorer votre expérience.{' '}
            <Link href="/politique-cookies" className="text-primary underline-offset-2 hover:underline">
              En savoir plus
            </Link>
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => decide('accepted')}
              className="group/cta relative inline-flex h-8 flex-1 items-center justify-center overflow-hidden rounded-lg text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-all active:translate-y-px"
            >
              <span aria-hidden className="bg-brand-gradient absolute inset-0" />
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
              />
              <span className="relative">Accepter</span>
            </button>
            <button
              type="button"
              onClick={() => decide('refused')}
              className="h-8 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Refuser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
