import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'

/** robots.txt : tout est ouvert sauf l'admin, l'API et les aperçus de l'admin. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/apercu/'] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
