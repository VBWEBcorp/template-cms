import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google'

import { RootWrapper } from '@/components/layout/root-wrapper'
import { ThemeScript } from '@/components/theme/theme-script'
import { organizationJsonLd, webSiteJsonLd } from '@/components/seo/json-ld'
import { siteConfig } from '@/lib/seo'

import '../index.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
})

// Serif italic — pour mots accentués dans les titres (style éditorial premium)
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// Mono — pour eyebrows, KPIs, labels techniques (style Linear/Vercel)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // og:title / og:description / og:url laissés vides ici : Next les remplit par
  // page (title/description propres + URL canonique). L'image og:image/twitter:image
  // vient de la convention src/app/opengraph-image.tsx.
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    // Émis seulement si un compte est configuré (évite un twitter:site vide).
    ...(siteConfig.twitterHandle ? { site: siteConfig.twitterHandle } : {}),
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  // apple-touch-icon via la convention src/app/apple-icon.tsx ; manifest via
  // src/app/manifest.ts. Favicon = le SVG existant.
  icons: {
    icon: '/favicon.svg',
  },
  alternates: {
    canonical: '/',
  },
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${inter.variable} ${jakarta.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        {/* Entité de marque émise sur chaque page (Organization + WebSite, @id stables). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [organizationJsonLd(), webSiteJsonLd()],
            }),
          }}
        />
        <RootWrapper>{children}</RootWrapper>
      </body>
    </html>
  )
}
