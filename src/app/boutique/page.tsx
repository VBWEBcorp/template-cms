import type { Metadata } from 'next'
import Link from 'next/link'

import { ImagePlaceholder } from '@/components/arti/image-placeholder'

export const metadata: Metadata = {
  title: 'Boutique',
  description:
    "Découvrez la boutique ARTI : cartes cadeaux et produits exclusifs du café céramique de Rennes.",
  alternates: { canonical: '/boutique' },
}

const products = [
  {
    slug: 'carte-cadeau',
    title: 'Carte Cadeau',
    author: 'Chloe',
    date: 'Juil 23, 2024',
    category: 'Carte cadeau',
    label: 'Carte cadeau',
  },
] as const

export default function BoutiquePage() {
  return (
    <>
      {/* HERO catégorie */}
      <section className="bg-beige py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6 text-center sm:px-10">
          <p className="font-display text-3xl italic text-terracotta sm:text-4xl">
            Category
          </p>
          <h1 className="-mt-2 font-sans text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Boutique
          </h1>
        </div>
      </section>

      {/* Grille produits */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          {products.length === 0 ? (
            <p className="text-center text-sm text-foreground/60">
              Aucun produit pour le moment.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <article
                  key={p.slug}
                  className="bg-beige-light shadow-sm transition-shadow hover:shadow-md"
                >
                  <ImagePlaceholder
                    label={p.label}
                    tone="sauge"
                    aspect="square"
                  />
                  <div className="p-6 text-center">
                    <h2 className="font-sans text-xl font-semibold text-foreground">
                      {p.title}
                    </h2>
                    <p className="mt-3 text-xs text-terracotta">
                      par {p.author} | {p.date} | {p.category}
                    </p>
                    <Link
                      href={`/boutique/${p.slug}`}
                      className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.22em] text-terracotta hover:text-foreground"
                    >
                      Lire plus
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
