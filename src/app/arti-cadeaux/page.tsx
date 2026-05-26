import type { Metadata } from 'next'

import { ArtiButton } from '@/components/arti/arti-button'
import { ImagePlaceholder } from '@/components/arti/image-placeholder'

export const metadata: Metadata = {
  title: 'Cartes cadeaux',
  description:
    "Offrez un bon cadeau ARTI : un atelier de peinture sur céramique unique au cœur de Rennes, entre 15€ et 50€.",
  alternates: { canonical: '/arti-cadeaux' },
}

export default function ArtiCadeauxPage() {
  return (
    <section className="bg-beige">
      <div className="grid items-stretch gap-0 md:grid-cols-2">
        {/* Visuel à gauche, sauge */}
        <div className="relative bg-sauge px-6 py-14 sm:px-12 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[520px]">
            <ImagePlaceholder
              label="Bon cadeau"
              tone="cream"
              aspect="wide"
              className="shadow-2xl"
            />
            <ImagePlaceholder
              label="Pinceaux"
              tone="dark"
              aspect="square"
              className="absolute -bottom-10 -left-2 size-36 shadow-lg sm:-left-4 sm:size-44"
            />
          </div>
        </div>

        {/* Texte à droite */}
        <div className="flex items-center bg-beige px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-md">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
              Bon cadeau
            </p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              Offrez une expérience unique à l&apos;un de vos proches !
            </h1>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
              <p>
                Un atelier de peinture sur céramique est une idée géniale. La
                personne qui recevra cette attention pourra venir vivre un
                moment créatif hors du temps et garder un souvenir grâce à la
                pièce qu&apos;elle aura personnalisée.
              </p>
              <p>
                Vous avez la possibilité de choisir le montant de la pièce de
                votre choix (entre 15&nbsp;€ et 50&nbsp;€).
              </p>
            </div>
            <div className="mt-8">
              <ArtiButton href="/boutique" variant="sauge">
                Choisir un bon cadeau
              </ArtiButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
