import { CalendarDays, Clock, MapPin, Send } from 'lucide-react'
import type { CSSProperties } from 'react'

import { ContactForm } from '@/components/contact-form'
import { PremiumHero } from '@/components/sections/premium-hero'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import type { contactDefaults } from '@/content/pages'

type Contact = typeof contactDefaults

/**
 * Corps de la page Contact (route /contact et aperçu de l'admin).
 * Deux voies de conversion seulement : le formulaire et, s'il est configuré,
 * le lien de rendez-vous. L'adresse est affichée, pas de mailto ni de tel: ici.
 */
export function ContactPage({ contact }: { contact: Contact }) {
  const { hero, info, form, appointment } = contact
  const appointmentUrl = siteConfig.appointmentUrl

  return (
    <>
      <PremiumHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        breadcrumb="Contact"
        backgroundImage={hero.image}
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/80">
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-primary-on-dark" aria-hidden />
            Réponse sous 48 h ouvrées
          </li>
          <li className="flex items-center gap-2">
            <Send className="size-4 text-primary-on-dark" aria-hidden />
            Devis gratuit
          </li>
          <li className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-400" aria-hidden />
            Sans engagement
          </li>
        </ul>
      </PremiumHero>

      <section id="formulaire" className="scroll-mt-24 border-b border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="reveal">
              <div className="relative overflow-hidden rounded-3xl bg-card/90 p-7 shadow-[0_20px_50px_-20px_oklch(0.2_0.02_264/0.25)] backdrop-blur-sm sm:p-9">
                <div aria-hidden className="gradient-ring rounded-3xl [--ring-alpha:0.4]" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20">
                      <Send className="size-4" aria-hidden />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{form.title}</h2>
                      <p className="text-xs text-muted-foreground">{form.subtitle}</p>
                    </div>
                  </div>
                  <ContactForm successMessage={form.successMessage} />
                </div>
              </div>
            </div>

            <div className="reveal space-y-5" style={{ '--stagger': 1 } as CSSProperties}>
              {appointmentUrl && (
                <div className="relative overflow-hidden rounded-3xl bg-card/90 p-7 shadow-[0_10px_30px_-12px_oklch(0.2_0.02_264/0.18)]">
                  <div aria-hidden className="gradient-ring rounded-3xl" />
                  <div className="relative space-y-4">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20">
                      <CalendarDays className="size-4" aria-hidden />
                    </span>
                    <h2 className="font-display text-base font-semibold tracking-tight text-foreground">{appointment.title}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{appointment.text}</p>
                    <Button size="lg" className="w-full" asChild>
                      <a href={appointmentUrl} target="_blank" rel="noopener noreferrer">
                        {appointment.button}
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative overflow-hidden rounded-3xl bg-card/90 p-7 shadow-[0_10px_30px_-12px_oklch(0.2_0.02_264/0.18)]">
                <div aria-hidden className="gradient-ring rounded-3xl" />
                <div className="relative space-y-5">
                  <h2 className="font-display text-base font-semibold tracking-tight text-foreground">Où nous trouver</h2>
                  <div className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20">
                      <MapPin className="size-4" aria-hidden />
                    </span>
                    <address className="text-sm font-semibold text-foreground not-italic">
                      <span className="block text-xs font-medium text-muted-foreground">Adresse</span>
                      {info.street}
                      <br />
                      {info.postalCode} {info.city}
                    </address>
                  </div>
                  {info.hours && (
                    <div className="flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20">
                        <Clock className="size-4" aria-hidden />
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        <span className="block text-xs font-medium text-muted-foreground">Horaires</span>
                        {info.hours}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-muted/50 shadow-[0_10px_30px_-12px_oklch(0.2_0.02_264/0.18)]">
                <div aria-hidden className="gradient-ring rounded-3xl [--ring-alpha:0.3]" />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{ backgroundImage: 'radial-gradient(oklch(0.55 0.05 264 / 0.2) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />
                <div className="relative flex h-56 flex-col items-center justify-center gap-3 p-6 text-center">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-background/70 text-primary ring-1 ring-border/60 backdrop-blur-sm">
                    <MapPin className="size-5" aria-hidden />
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {info.postalCode} {info.city}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${info.street} ${info.postalCode} ${info.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Voir l’itinéraire sur Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
