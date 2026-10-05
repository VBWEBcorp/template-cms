import { siteConfig } from '@/config/site'
import type { SiteInfo } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo'

/**
 * Données structurées (schema.org). Chaque page émet un @graph qui référence
 * les entités communes par @id stable : l'entreprise (#organization) et le
 * site (#website), décrits une seule fois dans le layout racine.
 */

type Node = Record<string, unknown>

export const ORG_ID = `${siteConfig.url}/#organization`
export const WEBSITE_ID = `${siteConfig.url}/#website`

const LOGO_URL = absoluteUrl('/icon.png')

/** L'entreprise : LocalBusiness (ou sous-type) si elle a une adresse, Organization sinon. */
export function organizationNode(info: SiteInfo): Node {
  const type = siteConfig.business.type
  const isLocal = type !== 'Organization'
  return {
    '@type': type,
    '@id': ORG_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
    image: absoluteUrl('/og-default.png'),
    email: info.email,
    telephone: info.phoneE164,
    ...(isLocal
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: info.address.street,
            postalCode: info.address.postalCode,
            addressLocality: info.address.city,
            addressRegion: info.address.region,
            addressCountry: info.address.country,
          },
          ...(siteConfig.business.priceRange ? { priceRange: siteConfig.business.priceRange } : {}),
          ...(siteConfig.business.geo
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: siteConfig.business.geo.latitude,
                  longitude: siteConfig.business.geo.longitude,
                },
              }
            : {}),
        }
      : {}),
    ...(siteConfig.business.areaServed.length
      ? { areaServed: siteConfig.business.areaServed.map((name) => ({ '@type': 'Place', name })) }
      : {}),
    ...(siteConfig.social.length ? { sameAs: [...siteConfig.social] } : {}),
  }
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: 'fr-FR',
    publisher: { '@id': ORG_ID },
  }
}

export function webPageNode(input: {
  path: string
  name: string
  description: string
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'
  dateModified?: string
  /** true si la page émet aussi un breadcrumbNode (référencé par @id). */
  hasBreadcrumb?: boolean
}): Node {
  const url = absoluteUrl(input.path)
  return {
    '@type': input.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.hasBreadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
  }
}

export function breadcrumbNode(path: string, items: Array<{ name: string; path: string }>): Node {
  const url = absoluteUrl(path)
  const all = [{ name: 'Accueil', path: '/' }, ...items]
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqNode(path: string, items: Array<{ question: string; answer: string }>): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function serviceNode(path: string, service: { title: string; description: string }, index: number): Node {
  return {
    '@type': 'Service',
    '@id': `${absoluteUrl(path)}#service-${index + 1}`,
    name: service.title,
    description: service.description,
    provider: { '@id': ORG_ID },
    ...(siteConfig.business.areaServed.length ? { areaServed: siteConfig.business.areaServed.join(', ') } : {}),
  }
}

export function articleNode(input: {
  path: string
  headline: string
  description: string
  image?: string
  datePublished: string
  dateModified: string
  author?: string
  keywords?: string[]
}): Node {
  const url = absoluteUrl(input.path)
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    headline: input.headline,
    description: input.description,
    ...(input.image ? { image: { '@type': 'ImageObject', url: absoluteUrl(input.image) } } : {}),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: input.author ? { '@type': 'Person', name: input.author } : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'fr-FR',
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
  }
}

/** Sérialise un graphe JSON-LD pour une balise <script> (sans fermeture possible de la balise). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function graph(...nodes: Node[]): Node {
  return { '@context': 'https://schema.org', '@graph': nodes }
}
