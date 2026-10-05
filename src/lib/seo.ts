import type { Metadata } from 'next'

import { siteConfig } from '@/config/site'

/**
 * Métadonnées des pages.
 *
 * Next fusionne `openGraph` EN SURFACE entre le layout et la page : une page
 * qui déclare openGraph sans `images` efface l'image du layout. Toutes les
 * pages passent donc par `buildMetadata`, qui repose toujours l'image de
 * partage (celle de la page ou DEFAULT_OG_IMAGE).
 */

export const TITLE_MAX = 60
export const DESCRIPTION_MAX = 155

/** Image de partage par défaut (1200 x 630), générée par `npm run images`. */
export const DEFAULT_OG_IMAGE = {
  url: '/og-default.png',
  width: 1200,
  height: 630,
  alt: siteConfig.name,
} as const

/** Adresse absolue à partir d'un chemin du site (ou d'une adresse déjà absolue). */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${siteConfig.url}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/** Coupe proprement un texte trop long pour une balise (sans couper un mot). */
export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[\s,;:.]+$/, '')}…`
}

type MetadataInput = {
  /** Titre complet de la page (60 caractères max, sans le nom du site). */
  title: string
  description: string
  /** Chemin de la page : sert à l'URL canonique absolue. */
  path: string
  image?: { url: string; width?: number; height?: number; alt?: string } | null
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  noindex?: boolean
  /** true : le titre est utilisé tel quel, sans ajouter « | Nom du site ». */
  absoluteTitle?: boolean
}

export function buildMetadata(input: MetadataInput): Metadata {
  // Le nom du site n'est ajouté que si le titre complet tient en 60 caractères.
  const suffix = ` | ${siteConfig.name}`
  const title =
    !input.absoluteTitle && input.title.length + suffix.length <= TITLE_MAX
      ? `${input.title}${suffix}`
      : truncate(input.title, TITLE_MAX)
  const description = truncate(input.description, DESCRIPTION_MAX)
  const image = input.image?.url
    ? { ...input.image, url: absoluteUrl(input.image.url), alt: input.image.alt || title }
    : { ...DEFAULT_OG_IMAGE, url: absoluteUrl(DEFAULT_OG_IMAGE.url) }

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl(input.path) },
    openGraph: {
      type: input.type ?? 'website',
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: absoluteUrl(input.path),
      title,
      description,
      images: [image],
      ...(input.type === 'article'
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
            authors: input.authors,
            tags: input.tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
      ...(siteConfig.twitterHandle ? { site: siteConfig.twitterHandle } : {}),
    },
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
