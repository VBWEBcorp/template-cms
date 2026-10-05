import type { Metadata } from 'next'

import { HomePage } from '@/components/pages/home-page'
import { JsonLd } from '@/components/seo/json-ld'
import { getPageContent } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import { faqNode, graph, webPageNode } from '@/lib/structured-data'

// Page statique, régénérée dès qu'un contenu est enregistré dans l'admin
// (revalidatePath) ; filet de sécurité d'une heure.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPageContent('home')
  return buildMetadata({ title: seo.title, description: seo.description, path: '/', absoluteTitle: true })
}

export default async function Page() {
  const [home, services, testimonials] = await Promise.all([
    getPageContent('home'),
    getPageContent('services'),
    getPageContent('testimonials'),
  ])

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: '/', name: home.seo.title, description: home.seo.description }),
          faqNode('/', home.faq.items)
        )}
      />
      <HomePage home={home} services={services} testimonials={testimonials} />
    </>
  )
}
