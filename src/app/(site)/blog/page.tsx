import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/seo/json-ld'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { getBlogSettings, listPosts } from '@/lib/blog'
import { absoluteUrl, buildMetadata } from '@/lib/seo'
import { breadcrumbNode, graph, webPageNode } from '@/lib/structured-data'

import { BlogList } from './blog-list'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogSettings()
  return buildMetadata({
    title: settings.title,
    description: settings.description,
    path: BLOG_BASE,
    image: settings.heroImage ? { url: settings.heroImage } : null,
    noindex: !settings.enabled,
  })
}

export default async function BlogPage() {
  const [settings, posts] = await Promise.all([getBlogSettings(), listPosts()])
  if (!settings.enabled) notFound()

  const collection = {
    ...webPageNode({ path: BLOG_BASE, name: settings.title, description: settings.description, type: 'CollectionPage', hasBreadcrumb: true }),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.slice(0, 30).map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(`${BLOG_BASE}/${post.slug}`),
        name: post.title,
      })),
    },
  }

  return (
    <div className="min-h-screen">
      <JsonLd data={graph(collection, breadcrumbNode(BLOG_BASE, [{ name: settings.eyebrow || 'Blog', path: BLOG_BASE }]))} />

      <section className="relative flex min-h-[340px] items-center overflow-hidden sm:min-h-[400px] lg:min-h-[440px]">
        <div className="absolute inset-0">
          {settings.heroImage ? (
            <Image src={settings.heroImage} alt="" fill sizes="100vw" preload className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="animate-fade-up mx-auto max-w-3xl text-center">
            <p className="mb-4 font-display text-xs font-semibold tracking-[0.22em] text-white/70 uppercase">{settings.eyebrow}</p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">{settings.title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">{settings.description}</p>
          </div>
        </div>
      </section>

      <BlogList posts={posts} categories={settings.categories} />
    </div>
  )
}
