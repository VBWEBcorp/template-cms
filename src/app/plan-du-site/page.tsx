import type { Metadata } from 'next'
import Link from 'next/link'

import { connectDB } from '@/lib/db'
import { BlogPost, BlogSettings } from '@/models/Blog'
import { GallerySettings } from '@/models/Gallery'
import { visiblePostFilter } from '@/lib/blog-filters'
import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { siteConfig } from '@/lib/seo'

const description =
  'Plan du site : retrouvez d’un coup d’œil toutes les pages et tous les articles pour naviguer facilement.'

export const metadata: Metadata = {
  title: 'Plan du site',
  description,
  alternates: { canonical: '/plan-du-site' },
}

export const revalidate = 3600

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webPageJsonLd('Plan du site', description, '/plan-du-site'),
    breadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      { name: 'Plan du site', path: '/plan-du-site' },
    ]),
  ],
}

const mainPages = [
  { label: 'Accueil', to: '/' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
]

const legalPages = [
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'Politique de confidentialité', to: '/politique-de-confidentialite' },
  { label: 'Conditions générales', to: '/conditions-generales' },
  { label: 'Politique de cookies', to: '/politique-cookies' },
]

export default async function SitemapPage() {
  let blogEnabled = false
  let galleryEnabled = false
  let posts: Array<{ slug: string; title: string }> = []

  try {
    await connectDB()
    const [blogSettings, gallerySettings, postDocs] = await Promise.all([
      BlogSettings.findOne().lean() as Promise<{ enabled?: boolean } | null>,
      GallerySettings.findOne().lean() as Promise<{ enabled?: boolean } | null>,
      BlogPost.find(visiblePostFilter())
        .sort({ publishedAt: -1 })
        .select('slug title')
        .lean() as Promise<Array<{ slug: string; title: string }>>,
    ])
    blogEnabled = !!blogSettings?.enabled
    galleryEnabled = !!gallerySettings?.enabled
    posts = postDocs.map((p) => ({ slug: p.slug, title: p.title }))
  } catch {
    // Fallback gracieux : on affiche au moins les pages statiques
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: 'Plan du site' }]} />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Plan du site
          </h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </header>

        <div className="grid gap-10 sm:grid-cols-2">
          <section aria-labelledby="pages-title">
            <h2 id="pages-title" className="font-display text-lg font-semibold text-foreground">
              Pages
            </h2>
            <ul className="mt-4 space-y-2">
              {mainPages.map((p) => (
                <li key={p.to}>
                  <Link href={p.to} className="text-primary underline underline-offset-4 hover:text-primary/80">
                    {p.label}
                  </Link>
                </li>
              ))}
              {galleryEnabled && (
                <li>
                  <Link href="/gallery" className="text-primary underline underline-offset-4 hover:text-primary/80">
                    Galerie
                  </Link>
                </li>
              )}
              {blogEnabled && (
                <li>
                  <Link href="/blog" className="text-primary underline underline-offset-4 hover:text-primary/80">
                    Blog
                  </Link>
                </li>
              )}
            </ul>

            <h2 className="mt-8 font-display text-lg font-semibold text-foreground">Informations légales</h2>
            <ul className="mt-4 space-y-2">
              {legalPages.map((p) => (
                <li key={p.to}>
                  <Link href={p.to} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {blogEnabled && posts.length > 0 && (
            <section aria-labelledby="articles-title">
              <h2 id="articles-title" className="font-display text-lg font-semibold text-foreground">
                Articles du blog
              </h2>
              <ul className="mt-4 space-y-2">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          Version XML pour les moteurs de recherche :{' '}
          <a href="/sitemap.xml" className="underline underline-offset-4 hover:text-foreground">
            {siteConfig.url}/sitemap.xml
          </a>
        </p>
      </main>
    </>
  )
}
