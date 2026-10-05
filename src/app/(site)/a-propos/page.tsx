import type { Metadata } from 'next'

import { AboutPage } from '@/components/pages/about-page'
import { JsonLd } from '@/components/seo/json-ld'
import { getPageContent } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbNode, graph, webPageNode } from '@/lib/structured-data'

export const revalidate = 3600

const PATH = '/a-propos'

export async function generateMetadata(): Promise<Metadata> {
  const { seo, hero } = await getPageContent('about')
  return buildMetadata({ title: seo.title, description: seo.description, path: PATH, image: { url: hero.image } })
}

export default async function Page() {
  const [about, home] = await Promise.all([getPageContent('about'), getPageContent('home')])

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: PATH, name: about.seo.title, description: about.seo.description, type: 'AboutPage', hasBreadcrumb: true }),
          breadcrumbNode(PATH, [{ name: 'À propos', path: PATH }])
        )}
      />
      <AboutPage about={about} cta={home.cta} />
    </>
  )
}
