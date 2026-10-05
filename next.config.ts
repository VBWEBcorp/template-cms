import path from 'node:path'
import type { NextConfig } from 'next'

type RemotePattern = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number]

/**
 * Domaines d'images autorisés pour next/image.
 * - images.unsplash.com : photos de démonstration du template.
 * - app.vbweb.fr : couvertures et visuels des articles déposés par PHARE.
 *   Sans lui, /_next/image répond 400 et l'image manque sans rien signaler.
 * - *.r2.dev + R2_PUBLIC_URL : bucket Cloudflare R2 du client (envois de l'admin).
 */
const remotePatterns: RemotePattern[] = [
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'app.vbweb.fr' },
  { protocol: 'https', hostname: '*.r2.dev' },
]

if (process.env.R2_PUBLIC_URL) {
  try {
    const { hostname, protocol } = new URL(process.env.R2_PUBLIC_URL)
    if (!remotePatterns.some((p) => p.hostname === hostname)) {
      remotePatterns.push({ protocol: protocol.replace(':', '') as 'http' | 'https', hostname })
    }
  } catch {
    // R2_PUBLIC_URL invalide : les domaines ci-dessus restent autorisés.
  }
}

const nextConfig: NextConfig = {
  // Sans racine explicite, Turbopack remonte jusqu'au dossier parent qui
  // contient d'autres projets et ne résout plus tailwindcss.
  turbopack: { root: path.resolve('.') },
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Moins de largeurs générées = srcset plus courts dans le HTML, sans perte
    // visible (les écrans 4K reçoivent la 1920, déjà nette en plein écran).
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 2592000,
    remotePatterns,
  },
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // L'aperçu de l'admin est une iframe du même site : SAMEORIGIN suffit.
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    ]
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    return [
      { source: '/:path*', headers: security },
      { source: '/admin/:path*', headers: noindex },
      { source: '/admin', headers: noindex },
      { source: '/apercu/:path*', headers: noindex },
    ]
  },
}

export default nextConfig
