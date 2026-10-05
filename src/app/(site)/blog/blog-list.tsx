'use client'

import { ArrowRight, Calendar, Search, User, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type CSSProperties, useMemo, useState } from 'react'

import { BLOG_BASE } from '@/lib/blog-defaults'
import { cn } from '@/lib/utils'

/**
 * Liste filtrable des articles. Toute la liste est déjà dans le HTML servi
 * (rendu serveur) : les filtres ne font que masquer côté navigateur.
 */

export type BlogListPost = {
  slug: string
  title: string
  excerpt: string
  coverImage: string
  coverImageAlt: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

export function BlogList({ posts, categories }: { posts: BlogListPost[]; categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b, 'fr')),
    [posts]
  )

  const normalizedQuery = query.trim().toLowerCase()
  const hasActiveFilters = activeCategory !== 'all' || activeTag !== null || normalizedQuery !== ''

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        if (activeCategory !== 'all' && p.category !== activeCategory) return false
        if (activeTag && !p.tags.includes(activeTag)) return false
        if (normalizedQuery) {
          const haystack = [p.title, p.excerpt, p.category, ...p.tags].join(' ').toLowerCase()
          if (!haystack.includes(normalizedQuery)) return false
        }
        return true
      }),
    [posts, activeCategory, activeTag, normalizedQuery]
  )

  const reset = () => {
    setActiveCategory('all')
    setActiveTag(null)
    setQuery('')
  }

  // L'article à la une n'apparaît qu'en vue par défaut (sans recherche ni filtre).
  const featured = !hasActiveFilters && filtered[0]?.coverImage ? filtered[0] : null
  const grid = featured ? filtered.slice(1) : filtered

  return (
    <>
      {posts.length > 0 && (
        <div className="sticky top-16 z-30 border-b border-border/60 bg-background/50 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              {categories.length > 0 ? (
                <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto" role="group" aria-label="Catégories">
                  {['all', ...categories].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                        activeCategory === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {cat === 'all' ? 'Tous' : cat}
                    </button>
                  ))}
                </div>
              ) : (
                <span />
              )}

              <div className="relative w-full shrink-0 sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un article..."
                  aria-label="Rechercher un article"
                  className="h-9 w-full rounded-full border border-border/60 bg-background pr-3 pl-9 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {allTags.length > 0 && (
              <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto border-t border-border/40 py-2.5" role="group" aria-label="Mots-clés">
                <span className="shrink-0 pr-1 text-xs font-medium text-muted-foreground">Mots-clés :</span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={activeTag === tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                      activeTag === tag
                        ? 'bg-foreground text-background'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16" aria-label="Articles">
        {posts.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {filtered.length} article{filtered.length > 1 ? 's' : ''}
              {hasActiveFilters ? (filtered.length > 1 ? ' trouvés' : ' trouvé') : ''}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
              >
                <X className="size-3.5" aria-hidden />
                Réinitialiser
              </button>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="animate-fade-in py-20 text-center">
            <Search className="mx-auto mb-4 size-12 text-muted-foreground/20" aria-hidden />
            <p className="text-lg font-medium text-muted-foreground">
              {hasActiveFilters ? 'Aucun article ne correspond à votre recherche.' : 'Aucun article pour le moment.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={reset}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <X className="size-4" aria-hidden />
                Réinitialiser les filtres
              </button>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Revenez bientôt !</p>
            )}
          </div>
        ) : (
          <>
            {featured && (
              <article className="animate-fade-up mb-12">
                <Link href={`${BLOG_BASE}/${featured.slug}`} className="group block">
                  <div className="grid gap-6 overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-lg md:grid-cols-2">
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto">
                      <Image
                        src={featured.coverImage}
                        alt={featured.coverImageAlt}
                        fill
                        sizes="(min-width: 1152px) 560px, (min-width: 768px) 50vw, 100vw"
                        preload
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center space-y-4 p-6 md:p-8">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {featured.category && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">{featured.category}</span>
                        )}
                        {featured.publishedAt && (
                          <time dateTime={featured.publishedAt} className="flex items-center gap-1">
                            <Calendar className="size-3" aria-hidden />
                            {formatDate(featured.publishedAt)}
                          </time>
                        )}
                      </div>
                      <h2 className="font-display text-2xl leading-tight font-bold text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                        {featured.title}
                      </h2>
                      {featured.excerpt && <p className="line-clamp-3 leading-relaxed text-muted-foreground">{featured.excerpt}</p>}
                      <div className="flex items-center justify-between pt-2">
                        {featured.author && (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <User className="size-3.5" aria-hidden />
                            {featured.author}
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
            )}

            {grid.length > 0 && (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {grid.map((post, i) => (
                  <article
                    key={post.slug}
                    className="animate-fade-up"
                    style={{ '--delay': `${Math.min(i, 8) * 60}ms` } as CSSProperties}
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
                            {post.category && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{post.category}</span>
                            )}
                            {post.publishedAt && (
                              <time dateTime={post.publishedAt} className="flex items-center gap-1">
                                <Calendar className="size-3" aria-hidden />
                                {formatDate(post.publishedAt)}
                              </time>
                            )}
                          </div>
                          <h2 className="line-clamp-2 font-display text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
                            {post.title}
                          </h2>
                          {post.excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
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
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
