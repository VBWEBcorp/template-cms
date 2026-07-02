import { ImageResponse } from 'next/og'

import { siteConfig } from '@/lib/seo'

// Image Open Graph par défaut, générée dynamiquement (1200x630) — aucune image
// binaire à livrer, elle s'adapte automatiquement au nom/à la config du site.
// Next l'injecte comme og:image ET twitter:image sur toutes les pages qui ne
// définissent pas la leur (les articles fournissent leur propre coverImage).
export const runtime = 'edge'
export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: 'linear-gradient(135deg, #0f0f12 0%, #1e1b2e 60%, #6d28d9 160%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 24,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size }
  )
}
