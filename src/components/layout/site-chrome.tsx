import type { CSSProperties } from 'react'

import { FloatingCallButton } from '@/components/floating-call-button'
import { CookieConsent } from '@/components/layout/cookie-consent'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Marketing } from '@/components/marketing/marketing'
import { ScrollToTop } from '@/components/scroll-to-top'
import { JsonLd } from '@/components/seo/json-ld'
import { siteConfig } from '@/config/site'
import { getSiteInfo } from '@/lib/content'
import { isBannerLive } from '@/lib/marketing'
import { getMarketing } from '@/lib/marketing-server'
import { getNavLinks } from '@/lib/navigation'
import { graph, organizationNode, websiteNode } from '@/lib/structured-data'

/**
 * Ossature du site public (layout du groupe (site) et page 404) : tout module réglable dans l'admin qui s'affiche sur
 * le site DOIT être monté ici (marketing, bandeau cookies...). Un composant écrit
 * mais monté nulle part ne produit aucune erreur : src/tests/cablage.test.ts
 * vérifie ces montages.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [links, info, marketing] = await Promise.all([getNavLinks(), getSiteInfo(), getMarketing()])
  const bannerOffset = isBannerLive(marketing) ? ({ '--banner-h': '2.5rem' } as CSSProperties) : undefined

  return (
    <div className="contents" style={bannerOffset}>
      {/* L'entreprise et le site, décrits une fois ; chaque page y renvoie par @id. */}
      <JsonLd data={graph(organizationNode(info), websiteNode())} />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Aller au contenu
      </a>
      <Marketing settings={marketing} />
      <Navbar links={links} siteName={siteConfig.name} showThemeToggle={siteConfig.features.themeToggle} />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer links={links} info={info} />
      <ScrollToTop />
      {siteConfig.features.cookieBanner && <CookieConsent />}
      {siteConfig.features.floatingCallButton && <FloatingCallButton phoneE164={info.phoneE164} />}
    </div>
  )
}
