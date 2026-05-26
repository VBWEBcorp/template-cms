import { ArtiButton } from '@/components/arti/arti-button'
import { ImagePlaceholder } from '@/components/arti/image-placeholder'

export function EventsCta() {
  return (
    <section className="bg-beige-deep">
      <div className="grid gap-0 md:grid-cols-2">
        {/* Visuel à gauche, avec petite céramique en chevauchement bas-gauche */}
        <div className="relative bg-sauge py-16 pl-6 pr-6 sm:py-20 sm:pl-12 md:pr-0">
          <div className="relative ml-auto max-w-[480px]">
            <ImagePlaceholder
              label="Atelier groupe"
              tone="dark"
              aspect="wide"
              className="rounded-none shadow-xl"
            />
            {/* Petite céramique en chevauchement bas-gauche */}
            <ImagePlaceholder
              label="Tasse"
              tone="cream"
              aspect="square"
              className="absolute -bottom-12 -left-6 size-32 shadow-lg sm:-left-10 sm:size-40"
            />
          </div>
        </div>

        {/* Texte à droite */}
        <div className="flex items-center bg-beige-deep px-6 py-16 sm:px-12 sm:py-20">
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl">
              Vous souhaitez organiser un événement ?
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80">
              Que ce soit pour un anniversaire, un mariage, un enterrement de
              vie de jeune fille, ou un événement d&apos;entreprise, Arti est
              l&apos;endroit idéal pour célébrer. Nous proposons des
              réservations pour tous types d&apos;événements. Profitez d&apos;un
              cadre unique où vos invités pourront créer des souvenirs
              inoubliables en décorant leurs propres pièces de céramique tout en
              savourant une boisson. Contactez-nous pour organiser votre
              événement et nous nous occupons de tout pour vous offrir une
              expérience créative et conviviale.
            </p>
            <div className="mt-7">
              <ArtiButton href="/peinture-sur-ceramique-a-rennes" variant="sauge">
                Nous contacter
              </ArtiButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
