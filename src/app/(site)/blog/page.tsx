import { ArrowRight, Calendar, User } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'

import { JsonLd } from '@/components/seo/json-ld'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { type PostSummary, getBlogSettings, listPosts } from '@/lib/blog'
import { absoluteUrl, buildMetadata } from '@/lib/seo'
import { breadcrumbNode, graph, webPageNode } from '@/lib/structured-data'

import { BlogFilters } from './blog-filters'

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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

const searchText = (post: PostSummary) => [post.title, post.excerpt, post.category, ...post.tags].join(' ').toLowerCase()

/** Attributs lus par BlogFilters pour masquer ou afficher une carte. */
function filterData(post: PostSummary, role: 'card' | 'featured' | 'featured-copy') {
  return {
    'data-post': role,
    'data-category': post.category,
    'data-tags': post.tags.join('|'),
    'data-search': searchText(post),
  }
}

function FeaturedCard({ post }: { post: PostSummary }) {
  return (
    <article {...filterData(post, 'featured')} className="animate-fade-up mb-12">
      <Link href={`${BLOG_BASE}/${post.slug}`} className="group block">
        <div className="grid gap-6 overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-lg md:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt}
              fill
              sizes="(min-width: 1152px) 560px, (min-width: 768px) 50vw, 100vw"
              preload
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center space-y-4 p-6 md:p-8">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post.category && <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">{post.category}</span>}
              {post.publishedAt && (
                <time dateTime={post.publishedAt} className="flex items-center gap-1">
                  <Calendar className="size-3" aria-hidden />
                  {formatDate(post.publishedAt)}
                </time>
              )}
            </div>
            <h2 className="font-display text-2xl leading-tight font-bold text-foreground transition-colors group-hover:text-primary sm:text-3xl">
              {post.title}
            </h2>
            {post.excerpt && <p className="line-clamp-3 leading-relaxed text-muted-foreground">{post.excerpt}</p>}
            <div className="flex items-center justify-between pt-2">
              {post.author && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="size-3.5" aria-hidden />
                  {post.author}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5">
                Lire l&apos;article
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

function PostCard({ post, index, featuredCopy }: { post: PostSummary; index: number; featuredCopy: boolean }) {
  return (
    <article
      {...filterData(post, featuredCopy ? 'featured-copy' : 'card')}
      hidden={featuredCopy}
      className="animate-fade-up"
      style={{ '--delay': `${Math.min(index, 8) * 60}ms` } as CSSProperties}
    >
      <Link href={`${BLOG_BASE}/${post.slug}`} className="group block h-full">
        <div className="h-full overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-lg">
          {post.coverImage && (
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt}
                fill
                sizes="(min-width: 1152px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post.category && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{post.category}</span>}
              {post.publishedAt && (
                <time dateTime={post.publishedAt} className="flex items-center gap-1">
                  <Calendar className="size-3" aria-hidden />
                  {formatDate(post.publishedAt)}
                </time>
              )}
            </div>
            {/* h2 : les cartes sont les sections de la page (l'à-la-une est un doublon masqué). */}
            <h2 className="line-clamp-2 font-display text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h2>
            {post.excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.slice(0, 3).map((t) => (
                  <li key={t} className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    #{t}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between pt-2">
              {post.author && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="size-3" aria-hidden />
                  {post.author}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs font-medium text-primary transition-all group-hover:gap-2">
                Lire la suite
                <ArrowRight className="size-3" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default async function BlogPage() {
  const [settings, posts] = await Promise.all([getBlogSettings(), listPosts()])
  if (!settings.enabled) notFound()

  const featured = posts[0]?.coverImage ? posts[0] : null
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b, 'fr'))

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

      {posts.length === 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="text-lg font-medium text-muted-foreground">Aucun article pour le moment.</p>
          <p className="mt-2 text-sm text-muted-foreground">Revenez bientôt !</p>
        </section>
      ) : (
        <>
          <BlogFilters
            categories={settings.categories}
            tags={tags}
            items={posts.map((p) => ({ category: p.category, tags: p.tags, search: searchText(p) }))}
          />
          <section className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6 lg:px-8 lg:pb-16" aria-label="Articles">
            {featured && <FeaturedCard post={featured} />}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} featuredCopy={featured !== null && i === 0} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
