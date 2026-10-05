import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/seo/json-ld'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { isBlogVisible, listPosts } from '@/lib/blog'
import { LEGAL_LINKS, getNavLinks } from '@/lib/navigation'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbNode, graph, webPageNode } from '@/lib/structured-data'

const PATH = '/plan-du-site'
const description = 'Plan du site : toutes les pages et tous les articles, d’un coup d’œil, pour trouver rapidement une information.'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({ title: 'Plan du site', description, path: PATH })

export default async function SitemapPage() {
  const [links, blogVisible, posts] = await Promise.all([getNavLinks(), isBlogVisible(), listPosts()])

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode({ path: PATH, name: 'Plan du site', description, hasBreadcrumb: true }),
          breadcrumbNode(PATH, [{ name: 'Plan du site', path: PATH }])
        )}
      />
      <Breadcrumb items={[{ label: 'Plan du site' }]} />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Plan du site</h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </header>

        <div className="grid gap-10 sm:grid-cols-2">
          <section aria-labelledby="pages-titre">
            <h2 id="pages-titre" className="font-display text-lg font-semibold text-foreground">
              Pages
            </h2>
            <ul className="mt-4 space-y-2">
              {links.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="text-primary underline underline-offset-4 hover:text-primary/80">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-8 font-display text-lg font-semibold text-foreground">Informations légales</h2>
            <ul className="mt-4 space-y-2">
              {LEGAL_LINKS.filter((l) => l.href !== PATH).map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {blogVisible && (
            <section aria-labelledby="articles-titre">
              <h2 id="articles-titre" className="font-display text-lg font-semibold text-foreground">
                Articles du blog
              </h2>
              <ul className="mt-4 space-y-2">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`${BLOG_BASE}/${post.slug}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
