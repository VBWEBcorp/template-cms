import type { Metadata } from 'next'

import { SiteChrome } from '@/components/layout/site-chrome'
import { NotFoundContent } from '@/components/not-found-content'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: true },
}

/** 404 des adresses inconnues : même habillage que le site (menu, pied de page). */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundContent />
    </SiteChrome>
  )
}
