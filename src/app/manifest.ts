import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'

/** Manifeste web (/manifest.webmanifest), lien ajouté automatiquement par Next. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: siteConfig.theme.themeColor,
    lang: siteConfig.lang,
    icons: [
      { src: '/icon.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  }
}
