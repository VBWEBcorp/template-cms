import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Inter, Plus_Jakarta_Sans } from 'next/font/google'
import type { CSSProperties } from 'react'

import { ThemeScript } from '@/components/theme/theme-script'
import { siteConfig } from '@/config/site'
import { buildMetadata } from '@/lib/seo'

import '../index.css'

// Polices auto-hébergées par next/font : aucune requête vers Google, pas de
// décalage de mise en page (repli ajusté automatiquement).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '600', '700'],
  display: 'swap',
})

// Serif italique pour le mot mis en valeur dans les grands titres.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  ...buildMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    path: '/',
    absoluteTitle: true,
  }),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  formatDetection: { telephone: false, email: false, address: false },
  // icon.png, apple-icon.png et favicon.ico : conventions de fichiers de src/app.
  alternates: {
    types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: `${siteConfig.name} : articles` }] },
  },
}

export const viewport: Viewport = {
  themeColor: siteConfig.theme.themeColor,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteConfig.lang}
      dir="ltr"
      className={`${inter.variable} ${jakarta.variable} ${instrumentSerif.variable}`}
      style={{ '--brand-hue': siteConfig.theme.brandHue } as CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  )
}
