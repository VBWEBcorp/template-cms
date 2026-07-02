import type { NextConfig } from 'next'

// Domaines d'images autorisés pour next/image.
// - images.unsplash.com : images de démonstration du template.
// - *.r2.dev : domaine public par défaut d'un bucket Cloudflare R2.
// - R2_PUBLIC_URL : domaine (custom inclus) du bucket propre au client, dérivé de
//   l'env pour que chaque site serve SES images sans toucher au code.
const remotePatterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: '*.r2.dev' },
]

if (process.env.R2_PUBLIC_URL) {
  try {
    const { hostname, protocol } = new URL(process.env.R2_PUBLIC_URL)
    if (!remotePatterns.some((p) => p.hostname === hostname)) {
      remotePatterns.push({ protocol: protocol.replace(':', '') as 'http' | 'https', hostname })
    }
  } catch {
    // R2_PUBLIC_URL invalide : on ignore, les patterns par défaut restent actifs.
  }
}

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

export default nextConfig
