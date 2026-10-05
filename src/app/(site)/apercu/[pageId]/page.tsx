import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AboutPage } from '@/components/pages/about-page'
import { ContactPage } from '@/components/pages/contact-page'
import { HomePage } from '@/components/pages/home-page'
import { ServicesPage } from '@/components/pages/services-page'
import { type PageId, isPageId } from '@/content/pages'
import { getPageContent, mergePageContent } from '@/lib/content'
import { connectDB, isDbConfigured } from '@/lib/db'
import { ContentDraft } from '@/models/ContentDraft'

import { PreviewScroll } from './preview-scroll'

/**
 * Aperçu en direct de l'admin : rend une page avec un brouillon non publié,
 * en utilisant les MÊMES composants que le site (jamais une copie du balisage).
 * Jamais indexé (noindex + interdit dans robots.txt), jamais mis en cache.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Aperçu', robots: { index: false, follow: false } }

type Props = { params: Promise<{ pageId: string }>; searchParams: Promise<{ brouillon?: string }> }

async function loadDraft(pageId: PageId, key?: string): Promise<unknown | null> {
  if (!key || !/^[a-f0-9]{32}$/.test(key) || !isDbConfigured()) return null
  await connectDB()
  const draft = (await ContentDraft.findOne({ key, pageId }).lean()) as { content?: unknown } | null
  return draft?.content ?? null
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { pageId } = await params
  const { brouillon } = await searchParams
  if (!isPageId(pageId)) notFound()

  const draft = await loadDraft(pageId, brouillon).catch(() => null)
  const content = <P extends PageId>(id: P) =>
    id === pageId && draft ? Promise.resolve(mergePageContent(id, draft)) : getPageContent(id)

  let body: React.ReactNode
  switch (pageId) {
    case 'home':
    case 'testimonials': {
      const [home, services, testimonials] = await Promise.all([content('home'), content('services'), content('testimonials')])
      body = <HomePage home={home} services={services} testimonials={testimonials} />
      break
    }
    case 'about': {
      const [about, home] = await Promise.all([content('about'), content('home')])
      body = <AboutPage about={about} cta={home.cta} />
      break
    }
    case 'services': {
      const [services, home] = await Promise.all([content('services'), content('home')])
      body = <ServicesPage services={services} cta={home.cta} />
      break
    }
    case 'contact':
      body = <ContactPage contact={await content('contact')} />
      break
  }

  return (
    <>
      <PreviewScroll pageId={pageId} />
      {body}
    </>
  )
}
