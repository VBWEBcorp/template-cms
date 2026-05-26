import type { Metadata } from 'next'

import { ImagePlaceholder } from '@/components/arti/image-placeholder'
import { InfoCards } from '@/components/arti/info-cards'

export const metadata: Metadata = {
  title: 'Les céramiques',
  description:
    "Découvrez la sélection de céramiques d'ARTI : tasses, bols, assiettes, pichets, vases, théières… Des pièces de céramistes français de 15€ à 50€.",
  alternates: { canonical: '/arti-ceramiques' },
}

const ceramics = [
  'Tasse',
  'Bol',
  'Assiette',
  'Pichet',
  'Vase',
  'Théière',
  'Beurrier',
  'Coquetier',
  'Mug',
  'Soliflore',
  'Plateau',
  'Pot',
  'Cup',
  'Saucière',
  'Ramequin',
  'Pot à crayons',
] as const

export default function ArtiCeramiquesPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-beige py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <h1 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
            Les céramiques
          </h1>
          <div className="mx-auto mt-8 max-w-xl space-y-4 text-sm leading-relaxed text-foreground/85">
            <p>
              Nous vous proposons une jolie sélection intemporelle de céramiques
              que vous retrouverez tout au long de l&apos;année, mais aussi des
              pièces sélectionnées en fonction des saisons. Nous avons à cœur de
              collaborer avec des céramistes français.
            </p>
            <p>
              Une quarantaine de modèles vous attendent — tasses, bols,
              assiettes, pichets, vases, théières, beurriers, pots à crayons —
              avec des tarifs allant de 15&nbsp;€ à 50&nbsp;€ selon la taille de
              la pièce.
            </p>
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <section className="bg-beige-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ceramics.map((c, i) => (
              <ImagePlaceholder
                key={c + i}
                label={c}
                tone={i % 3 === 0 ? 'cream' : i % 3 === 1 ? 'beige' : 'sauge'}
                aspect="square"
              />
            ))}
          </div>
        </div>
      </section>

      {/* INFOS BAS DE PAGE */}
      <InfoCards />
    </>
  )
}
