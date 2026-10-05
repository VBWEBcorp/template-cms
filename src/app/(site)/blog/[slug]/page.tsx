import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/seo/json-ld'
import { siteConfig } from '@/config/site'
import { prepareArticleHtml, stripTags } from '@/lib/article-html'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { getPost, listPosts } from '@/lib/blog'
import { preparePhareJsonLd } from '@/lib/phare-jsonld'
import { buildMetadata } from '@/lib/seo'
import { articleNode, breadcrumbNode, graph, webPageNode } from '@/lib/structured-data'

type Params = Promise<{ slug: string }>

// Régénérée à chaque publication ou retrait (revalidatePath), et au plus toutes les heures.
export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await listPosts().catch(() => [])
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Article introuvable', robots: { index: false } }

  return buildMetadata({
    title: post.metaTitle || post.title,
    // Titre SEO fourni (PHARE ou admin) : utilisé tel quel, sans ajouter le nom du site.
    absoluteTitle: Boolean(post.metaTitle),
    description: post.metaDescription || post.excerpt || stripTags(post.content).slice(0, 160),
    path: `${BLOG_BASE}/${post.slug}`,
    image: post.coverImage ? { url: post.coverImage, alt: post.coverImageAlt } : null,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.author ? [post.author] : undefined,
    tags: post.tags,
  })
}

function readingTime(html: string): number {
  return Math.max(1, Math.ceil(stripTags(html).split(/\s+/).length / 200))
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params
  // Base injoignable : l'erreur remonte et Next garde la version en cache.
  // Article absent (supprimé, brouillon, planifié) : 404, sans repli ni redirection.
  const post = await getPost(slug)
  if (!post) notFound()

  const path = `${BLOG_BASE}/${post.slug}`
  const { html } = prepareArticleHtml(post.content)
  const description = post.metaDescription || post.excerpt

  const breadcrumb = breadcrumbNode(path, [
    { name: 'Blog', path: BLOG_BASE },
    { name: post.title, path },
  ])
  const page = webPageNode({ path, name: post.metaTitle || post.title, description, hasBreadcrumb: true })
  // JSON-LD de PHARE s'il existe (remis en état), sinon celui généré ici.
  const phare = post.jsonLd
    ? preparePhareJsonLd(post.jsonLd, {
        siteUrl: siteConfig.url,
        coverImage: post.coverImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
      })
    : null
  const article = articleNode({
    path,
    headline: post.metaTitle || post.title,
    description,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author,
    keywords: post.tags,
  })

  return (
    <article className="min-h-screen">
      {phare ? (
        <>
          <JsonLd data={phare} />
          <JsonLd data={graph(page, breadcrumb)} />
        </>
      ) : (
        <JsonLd data={graph(page, breadcrumb, article)} />
      )}

      {post.coverImage && (
        <div className="relative h-[300px] w-full overflow-hidden bg-muted sm:h-[400px] lg:h-[480px]">
          <Image src={post.coverImage} alt={post.coverImageAlt} fill sizes="100vw" preload className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className={post.coverImage ? 'relative z-10 -mt-20' : 'pt-28'}>
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <Link
              href={BLOG_BASE}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Retour au blog
            </Link>
          </nav>

          <header className="mb-10 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {post.category && (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{post.category}</span>
              )}
              {post.publishedAt && (
                <time dateTime={post.publishedAt} className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" aria-hidden />
                  {formatDate(post.publishedAt)}
                </time>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden />
                {readingTime(post.content)} min de lecture
              </span>
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" aria-hidden />
                  {post.author}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>}
          </header>

          {/* Corps de l'article : HTML de l'éditeur ou de PHARE, préparé côté serveur. */}
          <div className="blog-content pb-16" dangerouslySetInnerHTML={{ __html: html }} />

          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 py-8">
              <Tag className="size-4 text-muted-foreground" aria-hidden />
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <aside className="space-y-4 border-t border-border/60 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">Un projet à nous confier ?</p>
            <p className="text-sm text-muted-foreground">
              Découvrez nos autres articles ou écrivez-nous pour en parler.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href={BLOG_BASE}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Tous les articles
              </Link>
              <Link
                href="/contact#formulaire"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Nous contacter
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}
