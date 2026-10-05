import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { isBlogVisible, isGalleryVisible, listGalleryImages, listPosts } from '@/lib/blog'
import { getPageContent } from '@/lib/content'
import { withDb } from '@/lib/db'
import { absoluteUrl } from '@/lib/seo'
import SiteContent from '@/models/SiteContent'

/**
 * Sitemap dynamique : pages indexables, articles en ligne (les supprimés et
 * les planifiés n'y sont pas), dates de modification réelles et images.
 * Les pages légales (noindex) n'y figurent pas.
 */
export const revalidate = 3600

// Date de repli honnête pour une page jamais modifiée dans l'admin : la date
// de mise en service du template, pas « maintenant » (Google ignore les dates
// qui changent à chaque lecture).
const FALLBACK_DATE = new Date('2026-10-01T00:00:00Z')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [updatedAt, home, about, services, posts, blogVisible, galleryVisible, gallery] = await Promise.all([
    withDb(
      async () => {
        const docs = (await SiteContent.find({}).select('pageId updatedAt').lean()) as Array<{ pageId: string; updatedAt?: Date }>
        return new Map(docs.map((d) => [d.pageId, d.updatedAt ? new Date(d.updatedAt) : FALLBACK_DATE]))
      },
      new Map<string, Date>(),
      'dates du sitemap'
    ).catch(() => new Map<string, Date>()),
    getPageContent('home'),
    getPageContent('about'),
    getPageContent('services'),
    listPosts(1000).catch(() => []),
    isBlogVisible().catch(() => false),
    isGalleryVisible().catch(() => false),
    listGalleryImages().catch(() => []),
  ])

  const date = (...pageIds: string[]) =>
    pageIds.map((id) => updatedAt.get(id)).filter((d): d is Date => Boolean(d)).sort((a, b) => +b - +a)[0] ?? FALLBACK_DATE

  const abs = (url: string) => absoluteUrl(url)

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: date('home', 'services', 'testimonials'),
      changeFrequency: 'weekly',
      priority: 1,
      images: [...home.hero.images, home.story.image].map(abs),
    },
    {
      url: abs('/services'),
      lastModified: date('services'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: services.services.map((s) => s.image).filter(Boolean).map(abs),
    },
    { url: abs('/a-propos'), lastModified: date('about'), changeFrequency: 'monthly', priority: 0.8, images: [abs(about.hero.image)] },
    { url: abs('/contact'), lastModified: date('contact'), changeFrequency: 'yearly', priority: 0.7 },
    { url: abs('/plan-du-site'), lastModified: FALLBACK_DATE, changeFrequency: 'monthly', priority: 0.2 },
  ]

  if (galleryVisible) {
    const latest = gallery.map((g) => g.updatedAt).filter(Boolean).sort().at(-1)
    entries.push({
      url: abs('/gallery'),
      lastModified: latest ? new Date(latest) : FALLBACK_DATE,
      changeFrequency: 'weekly',
      priority: 0.6,
      images: gallery.slice(0, 1000).map((g) => abs(g.imageUrl)),
    })
  }

  if (blogVisible) {
    entries.push({
      url: abs(BLOG_BASE),
      lastModified: posts[0] ? new Date(posts[0].updatedAt || posts[0].publishedAt) : FALLBACK_DATE,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
    for (const post of posts) {
      entries.push({
        url: abs(`${BLOG_BASE}/${post.slug}`),
        lastModified: new Date(post.updatedAt || post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
        ...(post.coverImage ? { images: [abs(post.coverImage)] } : {}),
      })
    }
  }

  return entries
}
