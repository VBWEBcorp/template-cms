// URL canonique du site, pilotée par env pour rester un template réutilisable.
// NE JAMAIS laisser un domaine en dur : chaque canonical/og:url/sitemap en découle.
// En dev, on retombe sur localhost (URLs volontairement non indexables).
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

// Profils sociaux -> Organization.sameAs. NEXT_PUBLIC_SOCIAL_LINKS="https://...,https://..."
const socialLinks = (process.env.NEXT_PUBLIC_SOCIAL_LINKS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export const siteConfig = {
  // Nom de la marque, piloté par env (NEXT_PUBLIC_SITE_NAME) par site.
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Nom Entreprise',
  url: siteUrl,
  locale: 'fr_FR',
  description:
    'Votre entreprise - description courte et percutante de votre activité. Adaptez cette ligne à votre domaine.',
  // Image OG générée dynamiquement (src/app/opengraph-image.tsx), sans binaire.
  ogImage: `${siteUrl}/opengraph-image`,
  // Logo raster carré (>=112px) pour Organization.logo (src/app/apple-icon.tsx).
  logo: `${siteUrl}/apple-icon`,
  // Émis seulement si configuré (évite un twitter:site placeholder).
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? '',
  themeColor: '#6d28d9',
  phone: '+33 1 23 45 67 89',
  email: 'contact@example.com',
  address: {
    street: '12 Rue Exemple',
    city: 'Paris',
    postalCode: '75001',
    country: 'FR',
  },
  social: socialLinks,
} as const

export type SeoMeta = {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: Record<string, unknown>
}

export function buildTitle(page?: string) {
  if (!page) return siteConfig.name
  return `${page} - ${siteConfig.name}`
}

export const routes = [
  '/',
  '/a-propos',
  '/services',
  '/contact',
  '/mentions-legales',
  '/politique-de-confidentialite',
  '/conditions-generales',
  '/politique-cookies',
] as const
