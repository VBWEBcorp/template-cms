import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { NewsletterSignup } from '@/components/newsletter-signup'
import { siteConfig } from '@/config/site'
import type { SiteInfo } from '@/lib/content'
import { LEGAL_LINKS, type NavLink } from '@/lib/navigation'

const linkClass = 'group inline-flex items-center gap-1 text-sm text-zinc-300 transition-colors hover:text-white'

function FooterLink({ href, label }: NavLink) {
  return (
    <Link href={href} className={linkClass}>
      <span className="relative">
        {label}
        <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
      </span>
    </Link>
  )
}

/** Pied de page (rendu serveur). Les coordonnées viennent de getSiteInfo(). */
export function Footer({ links, info }: { links: NavLink[]; info: SiteInfo }) {
  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-16">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight text-white"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-white text-zinc-950">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </span>
              {siteConfig.name}
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">{siteConfig.description}</p>

            <div className="pt-2">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">Newsletter</p>
              <p className="mt-2 max-w-sm text-sm text-zinc-400">
                Recevez nos actualités et nos conseils directement dans votre boîte mail.
              </p>
              <NewsletterSignup source="footer" className="mt-3 max-w-sm" />
            </div>
          </div>

          <nav aria-label="Navigation du pied de page">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">Navigation</p>
            <ul className="mt-5 space-y-3">
              {links.map((l) => (
                <li key={l.href}>
                  <FooterLink {...l} />
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Informations légales">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">Légal</p>
            <ul className="mt-5 space-y-3">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <FooterLink {...l} />
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">Contact</p>
            <address className="mt-5 space-y-3 text-sm not-italic">
              <p>
                <a href={`mailto:${info.email}`} className={linkClass}>
                  {info.email}
                  <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </p>
              <p>
                <a href={`tel:${info.phoneE164}`} className="text-zinc-300 transition-colors hover:text-white">
                  {info.phone}
                </a>
              </p>
              <p className="text-zinc-400">
                {info.address.street}
                <br />
                {info.address.postalCode} {info.address.city}
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/10" />

        <div className="flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p className="text-xs text-zinc-400">Tous droits réservés</p>
        </div>
      </div>

      {siteConfig.features.demoBanner && (
        <div className="bg-red-600 text-white">
          <div className="mx-auto max-w-6xl px-4 py-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-bold tracking-wide uppercase">
              Maquette de démonstration, propriété exclusive de{' '}
              <a href="https://vbweb.fr" className="underline underline-offset-2 transition-opacity hover:opacity-80">
                VBWEB.fr
              </a>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/90">
              Ce site est une présentation à but de démonstration uniquement. Toute reproduction, exploitation ou
              utilisation à des fins professionnelles ou commerciales est strictement interdite.
            </p>
          </div>
        </div>
      )}
    </footer>
  )
}
