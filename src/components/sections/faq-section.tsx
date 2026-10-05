import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { SectionTitle } from '@/components/ui/section-title'
import type { FaqItem } from '@/content/pages'

/**
 * Questions fréquentes : accordéon natif <details> (zéro JavaScript), un seul
 * ouvert à la fois grâce à l'attribut `name`. Les réponses sont dans le HTML
 * servi, et la page émet le JSON-LD FAQPage correspondant.
 */
export function FaqSection({
  faq,
}: {
  faq: { eyebrow: string; title: string; description: string; items: FaqItem[] }
}) {
  const items = faq.items.filter((i) => i.question && i.answer)

  return (
    <section className="border-b border-border/60 bg-surface-tint">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionTitle eyebrow={faq.eyebrow} title={faq.title} description={faq.description} />

        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {items.map((item, i) => (
            <details
              key={item.question}
              name="faq"
              open={i === 0}
              className="disclosure reveal group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-colors duration-300 hover:border-primary/30"
              style={{ '--stagger': i } as CSSProperties}
            >
              <div aria-hidden className="disclosure-ring gradient-ring rounded-2xl opacity-0 transition-opacity duration-300" />
              <summary className="relative flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02] sm:px-6 sm:py-5">
                <h3 className="flex items-baseline gap-3 font-display text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
                  <span aria-hidden className="font-display text-xs font-semibold tracking-[0.2em] text-primary/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.question}
                </h3>
                <span
                  aria-hidden
                  className="disclosure-icon flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-300"
                >
                  <Plus className="size-3.5" strokeWidth={2.5} />
                </span>
              </summary>
              <div className="px-5 pt-1 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
                <p className="border-t border-border/50 pt-4">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="reveal mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-4">
          <p className="text-sm text-muted-foreground">Vous ne trouvez pas votre réponse ?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Posez-nous votre question
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
