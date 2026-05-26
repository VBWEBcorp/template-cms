import type { Metadata } from 'next'

import { FaqAccordion } from '@/components/arti/faq-accordion'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    "Toutes les réponses à vos questions sur les ateliers de peinture sur céramique chez ARTI à Rennes : enfants, animaux, durée, prix, entretien…",
  alternates: { canonical: '/faq' },
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
    a: "Bien sûr ! Deux places à côté du comptoir sont réservées aux personnes souhaitant juste prendre une boisson / goûter sans faire l'atelier.",
  },
  {
    q: "Conseils d'entretien",
    a: "Pour préserver vos céramiques sur la durée, privilégiez le lavage à la main avec une éponge douce et un savon doux. Évitez les changements brusques de température (chaud/froid) ainsi que le four à micro-ondes pour les pièces décorées. Vos céramiques peuvent être utilisées au quotidien : pour le café, le thé, les goûters ou la décoration.",
  },
]

export default function FaqPage() {
  return (
    <section className="bg-beige py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
          Les questions souvent posées
        </p>
        <h1 className="mt-3 font-display text-5xl font-medium text-foreground sm:text-6xl">
          La FAQ
        </h1>
        <div className="mt-10">
          <FaqAccordion items={faqItems} />
        </div>
      </div>
    </section>
  )
}
