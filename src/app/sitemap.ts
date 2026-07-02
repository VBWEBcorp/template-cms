import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/seo'
import { connectDB } from '@/lib/db'
import { BlogPost, BlogSettings } from '@/models/Blog'
import { visiblePostFilter } from '@/lib/blog-filters'
import { GallerySettings, GalleryImage } from '@/models/Gallery'
import SiteContent from '@/models/SiteContent'

const baseUrl = siteConfig.url

// Date de repli stable pour les pages sans source de modification (pages légales).
// Un <lastmod> figé et honnête vaut mieux qu'un `new Date()` toujours "maintenant"
// que Google finit par ignorer. À faire évoluer lors d'une refonte du contenu légal.
const STATIC_FALLBACK = new Date('2026-01-01T00:00:00Z')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Dates de dernière modification réelles du contenu CMS, par pageId.
  const contentDates = new Map<string, Date>()

  try {
    await connectDB()
    const docs = (await SiteContent.find({}).select('pageId updatedAt').lean()) as Array<{
      pageId: string
      updatedAt?: Date
    }>
    for (const doc of docs) {
      if (doc.updatedAt) contentDates.set(doc.pageId, new Date(doc.updatedAt))
    }
  } catch (error) {
    console.error('Sitemap: content dates fetch error:', error)
  }

  const lastmod = (pageId: string) => contentDates.get(pageId) ?? STATIC_FALLBACK

  const pages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: lastmod('home'), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/a-propos`, lastModified: lastmod('about'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: lastmod('services'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: lastmod('contact'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/plan-du-site`, lastModified: STATIC_FALLBACK, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Pages légales : indexables mais quasi statiques (date de repli, faible priorité).
  for (const path of [
    '/mentions-legales',
    '/politique-de-confidentialite',
    '/conditions-generales',
    '/politique-cookies',
  ]) {
    pages.push({
      url: `${baseUrl}${path}`,
      lastModified: STATIC_FALLBACK,
      changeFrequency: 'yearly',
      priority: 0.3,
    })
  }

  try {
    await connectDB()

    // Galerie si activée — lastmod = image la plus récente, sinon les réglages.
    const gallerySettings = (await GallerySettings.findOne().lean()) as
      | { enabled?: boolean; updatedAt?: Date }
      | null
    if (gallerySettings?.enabled) {
      const latestImage = (await GalleryImage.findOne().sort({ updatedAt: -1 }).select('updatedAt').lean()) as
        | { updatedAt?: Date }
        | null
      pages.push({
        url: `${baseUrl}/gallery`,
        lastModified: latestImage?.updatedAt
          ? new Date(latestImage.updatedAt)
          : gallerySettings.updatedAt
            ? new Date(gallerySettings.updatedAt)
            : STATIC_FALLBACK,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    // Blog si activé — lastmod de la liste = article publié le plus récemment.
    const blogSettings = (await BlogSettings.findOne().lean()) as { enabled?: boolean } | null
    if (blogSettings?.enabled) {
      const posts = (await BlogPost.find(visiblePostFilter())
        .select('slug updatedAt publishedAt')
        .sort({ updatedAt: -1 })
        .lean()) as Array<{ slug: string; updatedAt?: Date; publishedAt?: Date }>

      const latestPostDate = posts[0]
        ? new Date(posts[0].updatedAt || posts[0].publishedAt || STATIC_FALLBACK)
        : STATIC_FALLBACK

      pages.push({
        url: `${baseUrl}/blog`,
        lastModified: latestPostDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      })

      for (const post of posts) {
        pages.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt || post.publishedAt || STATIC_FALLBACK),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return pages
}
