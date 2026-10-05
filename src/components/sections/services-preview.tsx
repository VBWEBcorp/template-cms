import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionTitle } from '@/components/ui/section-title'
import type { ServiceItem } from '@/content/pages'
import { getIcon } from '@/lib/icons'

/** Aperçu des 4 premiers services sur l'accueil (contenu de la page Services). */
export function ServicesPreview({
  intro,
  services,
}: {
  intro: { eyebrow: string; title: string; description: string }
  services: ServiceItem[]
}) {
  return (
    <section className="border-b border-border/60 bg-surface-tint">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionTitle eyebrow={intro.eyebrow} title={intro.title} description={intro.description} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {services.slice(0, 4).map((s, i) => {
            const Icon = getIcon(s.iconName)
            return (
              <li key={s.title || i} className="reveal-scale" style={{ '--stagger': i } as CSSProperties}>
                <Card className="h-full rounded-2xl border-border/80 bg-card/70 shadow-[var(--shadow-sm)] ring-1 ring-foreground/5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                  <CardHeader>
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="font-display text-base">
                      <h3>{s.title}</h3>
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{s.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            )
          })}
        </ul>
        <div className="reveal mt-10 text-center">
          <Button variant="outline" className="group" asChild>
            <Link href="/services">
              Voir tous nos services
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
