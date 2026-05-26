import type { Metadata } from 'next'

import { ArtiButton } from '@/components/arti/arti-button'
import { ConceptSteps } from '@/components/arti/concept-steps'
import { EventsCta } from '@/components/arti/events-cta'
import { ImagePlaceholder } from '@/components/arti/image-placeholder'
import { InfoCards } from '@/components/arti/info-cards'
import { Reviews } from '@/components/arti/reviews'
import {
  localBusinessJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '@/components/seo/json-ld'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webSiteJsonLd(),
    organizationJsonLd(),
    localBusinessJsonLd(),
    webPageJsonLd(siteConfig.name, siteConfig.description, '/'),
  ],
}

const galleryImages = [
  'Pinceau & céramique',
  'Atelier en cours',
  'Palette de couleurs',
  'Atelier groupe',
  'Pièce finie',
] as const

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO — Bienvenue chez ARTI */}
      <section className="bg-beige">
        <div className="grid items-stretch gap-0 md:grid-cols-2">
          <div className="relative bg-sauge px-6 py-12 sm:px-12 sm:py-16 md:py-20 lg:py-24">
            <div className="mx-auto max-w-[520px]">
              <ImagePlaceholder
                label="Café ARTI"
                tone="dark"
                aspect="wide"
                className="shadow-2xl"
              />
            </div>
          </div>

          <div className="flex items-center bg-beige px-6 py-16 sm:px-12 lg:px-20">
            <div className="max-w-md">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
                Bienvenue chez Arti
              </p>
              <h1 className="mt-5 font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
                Le café céramique au cœur de Rennes !
              </h1>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
                <p>
                  ARTI est un coffee shop cosy et inspirant qui vous propose une
                  expérience unique de peinture sur céramique tout en dégustant
                  un délicieux goûter. Vous pourrez décorer la pièce en
                  céramique de votre choix, et ainsi réveiller votre âme
                  d&apos;artiste !
                </p>
                <p>
                  La peinture sur céramique est une activité ouverte à tous.
                  Créatif ou non, débutant ou expérimenté, petit ou grand, il y
                  a de la place pour tout le monde !
                </p>
              </div>
              <div className="mt-8">
                <ArtiButton href="/infos-pratiques#reserver" variant="sauge">
                  Je réserve
                </ArtiButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LE CONCEPT (4 étapes) */}
      <ConceptSteps />

      {/* VOS CRÉATIONS */}
      <section className="bg-beige-light py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <h2 className="mb-12 text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
            Vos créations
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {galleryImages.map((label, i) => (
              <ImagePlaceholder
                key={i}
                label={label}
                tone={i % 2 === 0 ? 'beige' : 'cream'}
                aspect="square"
              />
            ))}
          </div>
        </div>
      </section>

      {/* NOTRE ÉQUIPE */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 md:grid-cols-2 md:gap-16">
          <ImagePlaceholder
            label="L'équipe ARTI"
            tone="beige"
            aspect="wide"
            className="shadow-md"
          />
          <div>
            <h2 className="font-display text-5xl font-medium leading-[1.05] text-foreground sm:text-6xl">
              Notre équipe
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/85">
              <p>
                Chez Arti, Chloé, Anne et Jasmine vous accueilleront lors de vos
                ateliers pour vous faire vivre un moment créatif et relaxant !
              </p>
              <p>
                Nous mettons tout notre cœur à vous accompagner dans la
                réalisation de votre pièce, que vous veniez peindre seul, en
                couple ou en famille. Notre plaisir, c&apos;est de vous offrir
                un moment de partage et de détente.
              </p>
              <p>
                Nous aimons partager nos conseils et nos idées pour que chaque
                atelier soit une belle expérience, pleine de bonne humeur et de
                créativité.
              </p>
              <p>
                Chez nous, pas besoin d&apos;être artiste : on vous guide pas à
                pas, toujours avec le sourire !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS */}
      <Reviews />

      {/* ÉVÉNEMENTS */}
      <EventsCta />

      {/* INFOS (3 cartes Adresse / Contact / Horaires) */}
      <InfoCards />
    </>
  )
}
