import { connectDB } from '@/lib/db'
import { BlogPost, BlogSettings } from '@/models/Blog'
import { visiblePostFilter } from '@/lib/blog-filters'
import { siteConfig } from '@/lib/seo'

// Flux RSS 2.0 du blog — canal de découverte complémentaire du sitemap.
// Servi sur /blog/rss.xml, revalidé toutes les heures.
export const revalidate = 3600

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  let title = 'Blog'
  let description = 'Découvrez nos articles, conseils et actualités.'
  let items = ''

  try {
    await connectDB()

    const settings = (await BlogSettings.findOne().lean()) as
      | { title?: string; description?: string }
      | null
    if (settings?.title) title = settings.title
    if (settings?.description) description = settings.description

    const posts = (await BlogPost.find(visiblePostFilter())
      .sort({ publishedAt: -1 })
      .select('title slug excerpt publishedAt')
      .limit(50)
      .lean()) as Array<{ title: string; slug: string; excerpt?: string; publishedAt?: Date }>

    items = posts
      .map((post) => {
        const url = `${siteConfig.url}/blog/${post.slug}`
        const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : ''
        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      <description>${escapeXml(post.excerpt ?? '')}</description>
    </item>`
      })
      .join('\n')
  } catch (error) {
    console.error('RSS generation error:', error)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)} — ${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(`${siteConfig.url}/blog`)}</link>
    <description>${escapeXml(description)}</description>
    <language>${siteConfig.locale.replace('_', '-')}</language>
    <atom:link href="${escapeXml(`${siteConfig.url}/blog/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
