import 'server-only'

import { cache } from 'react'

import { BLOG_SETTINGS_DEFAULTS, GALLERY_SETTINGS_DEFAULTS } from '@/lib/blog-defaults'
import { visiblePostFilter } from '@/lib/blog-filters'
import { withDb } from '@/lib/db'
import { BlogPost, BlogSettings } from '@/models/Blog'
import { GalleryImage, GallerySettings } from '@/models/Gallery'

/**
 * Lectures du blog et de la galerie côté serveur.
 *
 * Il n'y a pas de repli sur des articles écrits en dur : sans base, le blog est
 * simplement vide. (Un repli statique utilisé pour un slug absent ferait
 * revenir un article que PHARE vient de supprimer.)
 */

export type BlogSettingsData = typeof BLOG_SETTINGS_DEFAULTS

export type PostSummary = {
  slug: string
  title: string
  excerpt: string
  coverImage: string
  coverImageAlt: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
  updatedAt: string
}

export type PostFull = PostSummary & {
  content: string
  metaTitle: string
  metaDescription: string
  jsonLd: string
}

type RawPost = Partial<Record<keyof PostFull, unknown>> & { publishedAt?: Date; updatedAt?: Date }

function iso(value: unknown): string {
  if (!value) return ''
  const d = new Date(value as string)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toSummary(p: RawPost): PostSummary {
  return {
    slug: str(p.slug),
    title: str(p.title),
    excerpt: str(p.excerpt),
    coverImage: str(p.coverImage),
    coverImageAlt: str(p.coverImageAlt) || str(p.title),
    category: str(p.category),
    tags: Array.isArray(p.tags) ? (p.tags as unknown[]).filter((t): t is string => typeof t === 'string') : [],
    author: str(p.author),
    publishedAt: iso(p.publishedAt),
    updatedAt: iso(p.updatedAt) || iso(p.publishedAt),
  }
}

export const getBlogSettings = cache(
  async (): Promise<BlogSettingsData> =>
    withDb(
      async () => {
        const s = (await BlogSettings.findOne().lean()) as Partial<BlogSettingsData> | null
        if (!s) return BLOG_SETTINGS_DEFAULTS
        return {
          enabled: s.enabled ?? BLOG_SETTINGS_DEFAULTS.enabled,
          title: s.title || BLOG_SETTINGS_DEFAULTS.title,
          description: s.description || BLOG_SETTINGS_DEFAULTS.description,
          eyebrow: s.eyebrow || BLOG_SETTINGS_DEFAULTS.eyebrow,
          heroImage: s.heroImage || '',
          categories: Array.isArray(s.categories) ? s.categories : [],
        }
      },
      BLOG_SETTINGS_DEFAULTS,
      'réglages du blog'
    )
)

const SUMMARY_FIELDS = 'slug title excerpt coverImage coverImageAlt category tags author publishedAt updatedAt'

export const listPosts = cache(
  async (limit = 100): Promise<PostSummary[]> =>
    withDb(
      async () => {
        const docs = (await BlogPost.find(visiblePostFilter())
          .sort({ publishedAt: -1, createdAt: -1 })
          .select(SUMMARY_FIELDS)
          .limit(limit)
          .lean()) as RawPost[]
        return docs.map(toSummary)
      },
      [],
      'liste des articles'
    )
)

/** Article publié et visible, ou null (=> 404). Une base injoignable lève une erreur. */
export const getPost = cache(
  async (slug: string): Promise<PostFull | null> =>
    withDb(
      async () => {
        const p = (await BlogPost.findOne({ slug, ...visiblePostFilter() }).lean()) as RawPost | null
        if (!p) return null
        return {
          ...toSummary(p),
          content: str(p.content),
          metaTitle: str(p.metaTitle),
          metaDescription: str(p.metaDescription),
          jsonLd: str(p.jsonLd),
        }
      },
      null,
      `article ${slug}`
    )
)

export type GallerySettingsData = typeof GALLERY_SETTINGS_DEFAULTS
export type GalleryItem = { id: string; title: string; description: string; imageUrl: string; category: string; updatedAt: string }

export const getGallerySettings = cache(
  async (): Promise<GallerySettingsData> =>
    withDb(
      async () => {
        const s = (await GallerySettings.findOne().lean()) as Partial<GallerySettingsData> | null
        if (!s) return GALLERY_SETTINGS_DEFAULTS
        return {
          enabled: s.enabled ?? GALLERY_SETTINGS_DEFAULTS.enabled,
          title: s.title || GALLERY_SETTINGS_DEFAULTS.title,
          description: s.description || GALLERY_SETTINGS_DEFAULTS.description,
          eyebrow: s.eyebrow || GALLERY_SETTINGS_DEFAULTS.eyebrow,
          heroImage: s.heroImage || '',
        }
      },
      GALLERY_SETTINGS_DEFAULTS,
      'réglages de la galerie'
    )
)

export const listGalleryImages = cache(
  async (): Promise<GalleryItem[]> =>
    withDb(
      async () => {
        const docs = (await GalleryImage.find({ active: true })
          .sort({ order: 1 })
          .select('title description imageUrl category updatedAt')
          .limit(120)
          .lean()) as Array<Record<string, unknown>>
        return docs.map((d) => ({
          id: String(d._id),
          title: str(d.title),
          description: str(d.description),
          imageUrl: str(d.imageUrl),
          category: str(d.category),
          updatedAt: iso(d.updatedAt),
        }))
      },
      [],
      'images de la galerie'
    )
)

/**
 * La galerie n'est montrée (menu, plan du site, sitemap) que si elle est activée
 * ET contient au moins une image : jamais de lien vers une page vide.
 */
export const isGalleryVisible = cache(async (): Promise<boolean> => {
  const [settings, images] = await Promise.all([getGallerySettings(), listGalleryImages()])
  return settings.enabled && images.length > 0
})

/** Même règle pour le blog : activé et au moins un article en ligne. */
export const isBlogVisible = cache(async (): Promise<boolean> => {
  const [settings, posts] = await Promise.all([getBlogSettings(), listPosts()])
  return settings.enabled && posts.length > 0
})
