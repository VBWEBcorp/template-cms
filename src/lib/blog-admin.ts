import 'server-only'

import { revalidatePath } from 'next/cache'

/**
 * Champs d'un article modifiables depuis l'admin. Tout le reste (id, dates
 * techniques, source PHARE, horodatage newsletter) est ignoré.
 */
const EDITABLE = [
  'title',
  'slug',
  'excerpt',
  'content',
  'coverImage',
  'coverImageAlt',
  'category',
  'tags',
  'author',
  'published',
  'publishedAt',
  'metaTitle',
  'metaDescription',
  'notifyOnPublish',
] as const

export function pickEditable(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of EDITABLE) if (key in body) out[key] = body[key]
  if (typeof out.slug === 'string') out.slug = slugifyPost(out.slug)
  if (out.publishedAt === '' || out.publishedAt === null) delete out.publishedAt
  return out
}

export function slugifyPost(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/** Après toute modification d'article : liste, article, sitemap, flux, menu. */
export function revalidateBlog(): void {
  revalidatePath('/', 'layout')
  revalidatePath('/sitemap.xml')
  revalidatePath('/blog/rss.xml')
}
