import { ImageResponse } from 'next/og'

import { siteConfig } from '@/lib/seo'

// Apple-touch-icon 180x180 généré dynamiquement (corrige le 404 sur /apple-touch-icon.png).
// Sert aussi de logo raster carré (>=112px) pour Organization.logo (siteConfig.logo).
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Initiales de la marque (ex: "Nom Entreprise" -> "NE").
const initials = siteConfig.name
  .split(/\s+/)
  .map((w) => w[0])
  .filter(Boolean)
  .slice(0, 2)
  .join('')
  .toUpperCase()

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: siteConfig.themeColor,
          color: 'white',
          fontSize: 88,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        {initials}
      </div>
    ),
    { ...size }
  )
}
