import type { Metadata } from 'next'

import { ContactForm } from '@/components/arti/contact-form'
import { FaqAccordion } from '@/components/arti/faq-accordion'
import { InfoCards } from '@/components/arti/info-cards'

export const metadata: Metadata = {
  title: 'Infos pratiques',
  description:
    "ARTI — 10 rue Poullain Duparc à Rennes (Métro République). Horaires, contact, accès, FAQ et formulaire pour nous écrire.",
  alternates: { canonical: '/infos-pratiques' },
}

const faqItems = [
  {
    q: 'Les ateliers de peinture sur céramique sont-ils adaptés aux enfants ?',
    a: "Il n'y a pas d'âge requis pour venir faire un atelier, nous sommes ouverts aux grands comme aux petits ! Cependant, nous recommandons l'atelier à partir de 5-6 ans. L'activité n'est pas compliquée mais les 2H00 d'atelier peuvent être un peu longues pour les tout-petits.",
  },
  {
    q: 'Est-ce que les animaux sont acceptés ?',
    a: 'Oui, les chiens de petites / moyennes taille et calmes sont les bienvenus au café !',
  },
  {
    q: "Combien de temps dure l'activité ?",
    a: "L'atelier de peinture sur céramique dure 2H00. Nous te recommandons d'arriver 5-10 mins avant afin de choisir ta pièce et prendre le temps de t'installer.",
  },
  {
    q: 'Comment préparer ma venue chez Arti ?',
    a: "Avant l'atelier, nous t'invitons à trouver des inspirations. Pour cela, nous avons créé une page Pinterest avec plein d'idées pour t'inspirer.",
  },
  {
    q: "Quel est le prix d'un atelier ?",
    a: "Le prix de l'atelier est déterminé par la pièce que tu choisiras le jour J. Chez Arti, les modèles vont de 15 à 50€. Les boissons et pâtisseries sont à régler à part.",
  },
  {
    q: "Est-ce possible de prendre une boisson sans faire l'atelier ?",
    a: 'Bien sûr ! Deux places à côté du comptoir sont réservées aux personnes souhaitant juste prendre une boisson / goûter sans faire l\'atelier.',
  },
]

export default function InfosPratiquesPage() {
  return (
    <>
      {/* HERO + carte */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
            Où nous trouver ?
          </p>
          <h1 className="mt-4 text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
            Infos Pratiques
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-foreground/80">
            Nous sommes situés dans le centre ville de Rennes, 10 rue Poullain
            Duparc à côté de République. Cliquez sur la carte ci-dessous pour
            venir nous rencontrer.
          </p>

          <div className="mt-10 overflow-hidden">
            <iframe
              title="Carte ARTI Rennes"
              src="https://www.google.com/maps?q=10+rue+Poullain+Duparc+Rennes&output=embed"
              className="h-[300px] w-full sm:h-[360px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 3 cards Adresse / Contact / Horaires */}
      <InfoCards />

      {/* FAQ */}
      <section id="faq" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
            Les questions souvent posées
          </p>
          <h2 className="mt-3 font-display text-5xl font-medium text-foreground sm:text-6xl">
            La FAQ
          </h2>
          <div className="mt-8">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="reserver" className="bg-beige py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <ContactForm />
        </div>
      </section>
    </>
  )
}
