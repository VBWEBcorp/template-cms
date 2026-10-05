'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { cx } from '@/lib/cx'

/**
 * Filtres du blog (catégorie, mot-clé, recherche). Les cartes d'articles sont
 * rendues côté serveur (Google les lit toutes) ; ce composant ne fait que les
 * masquer ou les afficher selon les filtres, via leurs attributs data-*.
 */
export type FilterItem = { category: string; tags: string[]; search: string }

function matches(item: FilterItem, category: string, tag: string | null, q: string): boolean {
  return (category === 'all' || item.category === category) && (!tag || item.tags.includes(tag)) && (!q || item.search.includes(q))
}

export function BlogFilters({ categories, tags, items }: { categories: string[]; tags: string[]; items: FilterItem[] }) {
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const active = category !== 'all' || tag !== null || q !== ''
  const visible = useMemo(
    () => (active ? items.filter((item) => matches(item, category, tag, q)).length : items.length),
    [active, items, category, tag, q]
  )

  // Synchronise les cartes rendues par le serveur (aucun état React modifié ici).
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-post]').forEach((card) => {
      const role = card.dataset.post
      const match = matches(
        { category: card.dataset.category ?? '', tags: (card.dataset.tags ?? '').split('|'), search: card.dataset.search ?? '' },
        category,
        tag,
        q
      )
      // Sans filtre : l'article à la une est affiché en grand, sa copie dans la grille est masquée.
      card.hidden = !(role === 'featured' ? !active : role === 'featured-copy' ? active && match : match)
    })
  }, [category, tag, q, active])

  const reset = () => {
    setCategory('all')
    setTag(null)
    setQuery('')
  }

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            {categories.length > 0 ? (
              <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto" role="group" aria-label="Catégories">
                {['all', ...categories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={category === cat}
                    onClick={() => setCategory(cat)}
                    className={cx(
                      'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                      category === cat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

          {tags.length > 0 && (
            <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto border-t border-border/40 py-2.5" role="group" aria-label="Mots-clés">
              <span className="shrink-0 pr-1 text-xs font-medium text-muted-foreground">Mots-clés :</span>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tag === t}
                  onClick={() => setTag(tag === t ? null : t)}
                  className={cx(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                    tag === t ? 'bg-foreground text-background' : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {visible} article{visible > 1 ? 's' : ''}
            {active ? (visible > 1 ? ' trouvés' : ' trouvé') : ''}
          </p>
          {active && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline">
              <X className="size-3.5" aria-hidden />
              Réinitialiser
            </button>
          )}
        </div>
        {active && visible === 0 && (
          <div className="animate-fade-in py-20 text-center">
            <Search className="mx-auto mb-4 size-12 text-muted-foreground/20" aria-hidden />
            <p className="text-lg font-medium text-muted-foreground">Aucun article ne correspond à votre recherche.</p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <X className="size-4" aria-hidden />
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </>
  )
}
