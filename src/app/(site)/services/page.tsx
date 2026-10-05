import type { Metadata } from 'next'

import { ServicesPage } from '@/components/pages/services-page'
import { JsonLd } from '@/components/seo/json-ld'
import { getPageContent } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbNode, graph, serviceNode, webPageNode } from '@/lib/structured-data'

export const revalidate = 3600

const PATH = '/services'

export async function generateMetadata(): Promise<Metadata> {
  const { seo, hero } = await getPageContent('services')
  return buildMetadata({ title: seo.title, description: seo.description, path: PATH, image: { url: hero.image } })
}

export default async function Page() {
  const [services, home] = await Promise.all([getPageContent('services'), getPageContent('home')])

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: PATH, name: services.seo.title, description: services.seo.description, hasBreadcrumb: true }),
          breadcrumbNode(PATH, [{ name: 'Services', path: PATH }]),
          ...services.services.map((s, i) => serviceNode(PATH, s, i))
        )}
      />
      <ServicesPage services={services} cta={home.cta} />
    </>
  )
}
