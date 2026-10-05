import { siteConfig } from '@/config/site'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { getBlogSettings, listPosts } from '@/lib/blog'

// Flux RSS 2.0 du blog, servi sur /blog/rss.xml (régénéré à chaque publication).
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
  const [settings, posts] = await Promise.all([
    getBlogSettings().catch(() => null),
    listPosts(50).catch(() => []),
  ])
  const title = settings?.title ?? 'Blog'
  const description = settings?.description ?? siteConfig.description
  const blogUrl = `${siteConfig.url}${BLOG_BASE}`

  const items = posts
    .map((post) => {
      const url = `${blogUrl}/${post.slug}`
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}
      <description>${escapeXml(post.excerpt)}</description>${
        post.category ? `\n      <category>${escapeXml(post.category)}</category>` : ''
      }
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${title} : ${siteConfig.name}`)}</title>
    <link>${escapeXml(blogUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>fr-FR</language>
    <atom:link href="${escapeXml(`${blogUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=3600',
    },
  })
}
