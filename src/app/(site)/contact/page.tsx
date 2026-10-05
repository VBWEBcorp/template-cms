import type { Metadata } from 'next'

import { ContactPage } from '@/components/pages/contact-page'
import { JsonLd } from '@/components/seo/json-ld'
import { getPageContent } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbNode, graph, webPageNode } from '@/lib/structured-data'

export const revalidate = 3600

const PATH = '/contact'

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageContent('contact')
  return buildMetadata({ title: seo.title, description: seo.description, path: PATH })
}

export default async function Page() {
  const contact = await getPageContent('contact')

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: PATH, name: contact.seo.title, description: contact.seo.description, type: 'ContactPage', hasBreadcrumb: true }),
          breadcrumbNode(PATH, [{ name: 'Contact', path: PATH }])
        )}
      />
      <ContactPage contact={contact} />
    </>
  )
}
