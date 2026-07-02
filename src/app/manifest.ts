import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/seo'

// Web App Manifest (PWA). Next le sert sur /manifest.webmanifest et injecte le
// <link rel="manifest">. Corrige l'absence de manifest relevée par les audits.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: siteConfig.themeColor,
    lang: siteConfig.locale.split('_')[0],
    icons: [
      { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  }
}
