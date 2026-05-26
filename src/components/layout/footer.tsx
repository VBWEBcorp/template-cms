import { Instagram } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/layout/logo'
import { siteConfig } from '@/lib/seo'

const navLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Le concept', to: '/le-concept' },
  { label: 'Les céramiques', to: '/arti-ceramiques' },
  { label: 'Infos pratiques', to: '/infos-pratiques' },
  { label: 'Réserver', to: '/infos-pratiques#reserver' },
  { label: 'Cadeaux', to: '/arti-cadeaux' },
]

export function Footer() {
  return (
    <footer className="bg-beige text-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 md:grid-cols-3 md:gap-8">
        {/* Colonne gauche : Informations */}
        <div className="space-y-4 text-sm leading-relaxed">
          <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">
            Informations
          </h3>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Adresse :</span>{' '}
              {siteConfig.address.street}, {siteConfig.address.city}
            </p>
            <p>
              <span className="font-semibold">Accès :</span>{' '}
              {siteConfig.address.access}
            </p>
            <p>
              <span className="font-semibold">Mail :</span>
              <br />
              <a
                href={`mailto:${siteConfig.email}`}
                className="transition-opacity hover:opacity-70"
              >
                {siteConfig.email}
              </a>
            </p>
            <p>
              <span className="font-semibold">Téléphone :</span>{' '}
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                className="transition-opacity hover:opacity-70"
              >
                {siteConfig.phoneDisplay}
              </a>
            </p>
          </div>
        </div>

        {/* Colonne centre : Logo + Instagram + copyright */}
        <div className="flex flex-col items-center justify-start gap-4 text-center text-sm">
          <Logo size="md" />
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram ARTI"
            className="flex size-10 items-center justify-center rounded-full bg-sauge text-white transition-transform hover:scale-105"
          >
            <Instagram strokeWidth={1.8} className="size-5" />
          </a>
          <p className="max-w-xs text-xs leading-relaxed text-foreground/80">
            © {new Date().getFullYear()}, articafeceramique.fr tous droits
            réservés |{' '}
            <Link
              href="/politique-de-confidentialite"
              className="underline-offset-2 hover:underline"
            >
              Politique de confidentialité et mentions légales
            </Link>{' '}
            | Conception &amp; Réalisation
          </p>
          <p className="font-logo text-sm tracking-[0.25em] text-foreground">
            VBWEB
          </p>
        </div>

        {/* Colonne droite : Liens */}
        <nav aria-label="Pied de page" className="md:text-right">
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  href={l.to}
                  className="inline-block transition-opacity hover:opacity-70"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
