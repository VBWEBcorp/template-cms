import 'server-only'

import { BLOG_BASE } from '@/lib/blog-defaults'
import { isBlogVisible, isGalleryVisible } from '@/lib/blog'

export type NavLink = { href: string; label: string }

/**
 * Liens du menu principal, calculés côté serveur : la galerie et le blog
 * n'apparaissent que s'ils sont activés ET non vides (jamais de lien vers une
 * page creuse). Le pied de page, le plan du site et la 404 réutilisent la même liste.
 */
export async function getNavLinks(): Promise<NavLink[]> {
  const [gallery, blog] = await Promise.all([
    isGalleryVisible().catch(() => false),
    isBlogVisible().catch(() => false),
  ])
  return [
    { href: '/', label: 'Accueil' },
    { href: '/a-propos', label: 'À propos' },
    { href: '/services', label: 'Services' },
    ...(gallery ? [{ href: '/gallery', label: 'Galerie' }] : []),
    ...(blog ? [{ href: BLOG_BASE, label: 'Blog' }] : []),
    { href: '/contact', label: 'Contact' },
  ]
}

export const LEGAL_LINKS: NavLink[] = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/politique-de-confidentialite', label: 'Confidentialité' },
  { href: '/conditions-generales', label: 'CGU' },
  { href: '/politique-cookies', label: 'Cookies' },
  { href: '/plan-du-site', label: 'Plan du site' },
]
