import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { getNavLinks } from '@/lib/navigation'

/**
 * Contenu de la page 404 : une sortie utile vers les pages principales.
 * Les liens viennent de getNavLinks() : jamais de lien vers une page absente.
 */
export async function NotFoundContent() {
  const links = (await getNavLinks().catch(() => [])).filter((l) => l.href !== '/')

  return (
    <section className="flex min-h-[72vh] items-center justify-center bg-surface-tint px-5 pt-32 pb-24">
      <div className="animate-fade-up mx-auto max-w-xl text-center">
        <p className="font-display text-xs font-semibold tracking-[0.28em] text-primary uppercase">Erreur 404</p>
        <h1 className="mt-6 font-display text-4xl leading-[1.1] font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
          Cette page est{' '}
          <span className="font-serif font-normal text-primary italic">introuvable</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-pretty text-muted-foreground">
          Le lien est peut-être ancien, ou la page a changé d’adresse. Voici de quoi retrouver votre chemin.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="group" asChild>
            <Link href="/">
              Retour à l’accueil
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact#formulaire">Nous écrire</Link>
          </Button>
        </div>

        {links.length > 0 && (
          <nav aria-label="Pages principales" className="mt-12">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  )
}
