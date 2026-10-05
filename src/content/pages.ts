/**
 * Contenu par défaut des pages éditables.
 *
 * SOURCE UNIQUE partagée par le site (rendu serveur) et par les éditeurs de
 * l'admin : un champ n'existe qu'ici, sous le même nom des deux côtés. Le
 * back-office n'enregistre que les écarts (collection sitecontents, une entrée
 * par page) ; tout ce qui n'a pas été modifié vient de ce fichier.
 *
 * Pour un nouveau client : réécrire les textes ci-dessous, remplacer les
 * photos de démonstration (Unsplash) par les siennes, puis ajuster les
 * balises `seo` (titre 60 caractères max, description 155 max ; contrôlé par
 * les tests).
 *
 * Icônes : nom d'une icône de src/lib/icons.ts (liste fermée, voir ICON_NAMES).
 */

import { siteConfig } from '@/config/site'

const unsplash = (id: string, w: number, extra = '') =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75${extra}`

export type SeoFields = { title: string; description: string }

export type ServiceItem = {
  iconName: string
  title: string
  description: string
  points: string[]
  image: string
}

export type Testimonial = { name: string; company: string; text: string; stars: number }

export type FaqItem = { question: string; answer: string }

// ============================================================================
// Accueil (pageId « home »)
// ============================================================================

export const homeDefaults = {
  seo: {
    title: 'Atelier Exemple : conseil et réalisation à Rennes',
    description:
      'Atelier Exemple accompagne les entreprises de Rennes et de Bretagne : conseil, réalisation et suivi, avec un interlocuteur unique. Devis gratuit.',
  } as SeoFields,
  hero: {
    eyebrow: 'Bienvenue',
    title: 'Votre partenaire pour réussir vos projets',
    description:
      'Nous accompagnons les entreprises avec des solutions sur mesure, pensées pour durer : écoute, méthode et résultats concrets.',
    button1: 'Demander un devis',
    button2: 'Découvrir nos services',
    images: [unsplash('1497366216548-37526070297c', 1920), unsplash('1522071820081-009f0129c71c', 1920)],
  },
  story: {
    eyebrow: 'Notre histoire',
    title: 'Une approche humaine, des résultats concrets',
    paragraph1:
      "Depuis nos débuts, nous croyons qu'un bon projet commence par une bonne écoute. Nous prenons le temps de comprendre votre métier, vos clients et vos objectifs avant de proposer quoi que ce soit.",
    paragraph2:
      'Le résultat : des réalisations qui vous ressemblent, qui parlent à vos clients et qui travaillent pour vous dans la durée.',
    image: unsplash('1522071820081-009f0129c71c', 1200),
  },
  servicesIntro: {
    eyebrow: 'Nos services',
    title: 'Des solutions adaptées à votre activité',
    description:
      'Quel que soit votre secteur, nous vous aidons à structurer votre projet et à atteindre vos objectifs.',
  },
  gallery: {
    eyebrow: 'Galerie',
    title: 'En coulisses',
    images: [
      unsplash('1497366216548-37526070297c', 720),
      unsplash('1553877522-43269d4ea984', 720),
      unsplash('1600880292203-757bb62b4baf', 720),
      unsplash('1524758631624-e2822e304c36', 720),
      unsplash('1542744173-8e7e53415bb0', 720),
      unsplash('1556761175-5973dc0f32e7', 720),
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions fréquentes',
    description: 'Les réponses aux questions que l’on nous pose le plus souvent avant de démarrer.',
    items: [
      {
        question: 'Comment se déroule un premier échange ?',
        answer:
          'Vous nous présentez votre besoin par le formulaire ou lors d’un rendez-vous de 30 minutes. Nous revenons vers vous sous 48 heures ouvrées avec une proposition claire et chiffrée.',
      },
      {
        question: 'Combien de temps dure un projet ?',
        answer:
          'Cela dépend de son ampleur : de quelques semaines pour un projet simple à plusieurs mois pour un accompagnement complet. Un planning détaillé vous est remis dès le départ.',
      },
      {
        question: 'Restez-vous disponibles après la livraison ?',
        answer:
          'Oui. Nous proposons un suivi dans la durée : ajustements, conseils et assistance, avec le même interlocuteur.',
      },
      {
        question: 'Comment sont établis vos tarifs ?',
        answer:
          'Chaque devis est établi sur mesure après un premier échange gratuit. Il détaille chaque étape, sans frais cachés.',
      },
      {
        question: 'Intervenez-vous en dehors de Rennes ?',
        answer:
          'Oui, nous travaillons dans toute la Bretagne, et à distance pour les projets qui le permettent.',
      },
    ] as FaqItem[],
  },
  cta: {
    eyebrow: 'Prêt à démarrer ?',
    title: 'Parlons de votre projet',
    description:
      'Un échange simple et sans engagement pour comprendre vos besoins et vous proposer la bonne approche.',
    button: 'Demander un devis gratuit',
    appointmentButton: 'Prendre rendez-vous',
    images: [
      unsplash('1460925895917-afdab827c52f', 400, '&h=500'),
      unsplash('1553877522-43269d4ea984', 400, '&h=500'),
      unsplash('1551434678-e076c223a692', 400, '&h=500'),
      unsplash('1531973576160-7125cd663d86', 400, '&h=500'),
      unsplash('1600880292203-757bb62b4baf', 400, '&h=500'),
      unsplash('1542744173-8e7e53415bb0', 400, '&h=500'),
      unsplash('1519389950473-47ba0277781c', 400, '&h=500'),
      unsplash('1573164713988-8665fc963095', 400, '&h=500'),
    ],
  },
}

// ============================================================================
// À propos (pageId « about »)
// ============================================================================

export const aboutDefaults = {
  seo: {
    title: 'À propos : notre équipe et nos valeurs',
    description:
      'Découvrez Atelier Exemple : notre histoire, notre façon de travailler et les valeurs qui guident chacun de nos projets à Rennes et en Bretagne.',
  } as SeoFields,
  hero: {
    eyebrow: 'À propos',
    title: 'Une équipe engagée à vos côtés',
    description:
      'Nous croyons que chaque entreprise mérite un accompagnement à la hauteur de ses ambitions. Depuis notre création, nous travaillons avec des artisans, des PME et des indépendants, avec des solutions simples, efficaces et soignées.',
    image: unsplash('1522071820081-009f0129c71c', 1200),
    badgeTitle: 'Une équipe à votre écoute',
    badgeText: 'Réponse sous 48 h',
  },
  stats: [
    { value: '150+', label: 'Projets livrés' },
    { value: '12 ans', label: "D'expérience" },
    { value: '1', label: 'Interlocuteur unique' },
    { value: '48 h', label: 'Délai de réponse' },
  ],
  valuesIntro: {
    eyebrow: 'Nos valeurs',
    title: 'Ce qui nous guide au quotidien',
  },
  values: [
    {
      iconName: 'Heart',
      title: 'Proximité',
      description: 'Un interlocuteur unique, disponible, qui connaît votre projet sur le bout des doigts.',
    },
    {
      iconName: 'Lightbulb',
      title: 'Clarté',
      description: 'Pas de jargon inutile. Des explications simples et des livrables concrets.',
    },
    {
      iconName: 'Users',
      title: 'Sur mesure',
      description: "Chaque projet est différent. Nous adaptons nos solutions à votre réalité, pas l'inverse.",
    },
  ],
}

// ============================================================================
// Services (pageId « services »)
// ============================================================================

export const servicesDefaults = {
  seo: {
    title: 'Nos services : conseil, réalisation et suivi',
    description:
      'Conseil, réalisation, formation, suivi : découvrez les services d’Atelier Exemple pour les entreprises de Rennes et de Bretagne. Devis gratuit.',
  } as SeoFields,
  hero: {
    eyebrow: 'Nos services',
    title: 'Tout ce qu’il faut pour mener votre projet',
    description:
      "Des prestations complètes, du premier conseil à l'accompagnement dans la durée, adaptées à toutes les tailles d'entreprise.",
    image: unsplash('1497032628192-86f99bcd76bc', 1920),
  },
  kpis: [
    { value: '6', label: 'prestations' },
    { value: '150+', label: 'projets livrés' },
    { value: '100 %', label: 'sur mesure' },
  ],
  services: [
    {
      iconName: 'Lightbulb',
      title: 'Conseil et diagnostic',
      description:
        'Un état des lieux précis de votre situation et des priorités claires, pour investir là où cela compte vraiment.',
      points: ['Audit de départ', 'Recommandations écrites', 'Plan d’action chiffré'],
      image: unsplash('1467232004584-a241de8bcf5d', 1200),
    },
    {
      iconName: 'Hammer',
      title: 'Réalisation sur mesure',
      description:
        'Nous concevons et réalisons votre projet de bout en bout, avec des points d’étape réguliers et un planning tenu.',
      points: ['Cahier des charges', 'Suivi hebdomadaire', 'Livraison clé en main'],
      image: unsplash('1551288049-bebda4e38f71', 1200),
    },
    {
      iconName: 'Users',
      title: 'Formation des équipes',
      description:
        'Des sessions pratiques pour que vos équipes deviennent autonomes et tirent le meilleur de chaque outil.',
      points: ['Sessions sur site', 'Supports fournis', 'Groupes de 2 à 10 personnes'],
      image: unsplash('1460925895917-afdab827c52f', 1200),
    },
    {
      iconName: 'ShieldCheck',
      title: 'Suivi et maintenance',
      description:
        'Un accompagnement dans la durée : vérifications régulières, ajustements et assistance quand vous en avez besoin.',
      points: ['Interventions rapides', 'Bilan trimestriel', 'Même interlocuteur'],
      image: unsplash('1558494949-ef010cbdcc31', 1200),
    },
    {
      iconName: 'Palette',
      title: 'Identité et communication',
      description:
        'Des supports cohérents qui reflètent votre image : charte, documents commerciaux et présence en ligne.',
      points: ['Charte graphique', 'Supports print et web', 'Réseaux sociaux'],
      image: unsplash('1626785774573-4b799315345d', 1200),
    },
    {
      iconName: 'BarChart3',
      title: 'Pilotage et reporting',
      description:
        'Des tableaux de bord lisibles pour suivre vos résultats, comprendre ce qui fonctionne et ajuster votre stratégie.',
      points: ['Indicateurs clairs', 'Recommandations', 'Point mensuel'],
      image: unsplash('1543286386-713bdd548da4', 1200),
    },
  ] as ServiceItem[],
}

// ============================================================================
// Contact (pageId « contact »)
// ============================================================================
// Coordonnées : valeurs de src/config/site.ts, modifiables dans l'admin. Elles
// alimentent la page Contact, le pied de page et le JSON-LD (getSiteInfo()).

export const contactDefaults = {
  seo: {
    title: 'Contact : demandez votre devis gratuit',
    description:
      'Contactez Atelier Exemple à Rennes : décrivez votre projet par le formulaire ou réservez un rendez-vous. Réponse sous 48 heures ouvrées.',
  } as SeoFields,
  hero: {
    eyebrow: 'Contact',
    title: 'Parlons de votre projet',
    description:
      'Décrivez votre besoin en quelques lignes ou réservez un créneau : nous revenons vers vous sous 48 heures ouvrées.',
    image: unsplash('1423666639041-f56000c27a9a', 1920),
  },
  form: {
    title: 'Envoyer un message',
    subtitle: 'Tous les champs sont obligatoires sauf indication',
    successMessage: 'Merci, votre message est bien parti. Nous vous répondons sous 48 heures ouvrées.',
  },
  appointment: {
    title: 'Vous préférez en parler ?',
    text: 'Réservez un échange de 30 minutes, au téléphone ou en visio, au créneau qui vous arrange.',
    button: 'Choisir un créneau',
  },
  info: {
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    street: siteConfig.contact.address.street,
    postalCode: siteConfig.contact.address.postalCode,
    city: siteConfig.contact.address.city,
    hours: siteConfig.contact.hours,
  },
}

// ============================================================================
// Témoignages (pageId « testimonials »), affichés sur l'accueil
// ============================================================================

export const testimonialsDefaults = {
  eyebrow: 'Témoignages',
  title: 'Ils nous font confiance',
  description: 'Des entreprises de tous horizons qui ont gagné en sérénité et en résultats.',
  testimonials: [
    { name: 'Marie D.', company: 'Commerce de proximité', text: 'Un accompagnement clair du début à la fin. Nous savions toujours où en était le projet.', stars: 5 },
    { name: 'Thomas L.', company: 'Cabinet de conseil', text: 'Un travail soigné et des délais tenus. Mes clients voient tout de suite la différence.', stars: 5 },
    { name: 'Camille B.', company: 'Atelier artisanal', text: "Ils ont su comprendre l'univers de ma marque et le traduire sans le trahir.", stars: 5 },
    { name: 'Laurent M.', company: 'Entreprise du bâtiment', text: 'Réactifs, disponibles et de bon conseil. Je recommande sans hésiter.', stars: 5 },
    { name: 'Nadia K.', company: 'Agence de voyages', text: 'Un interlocuteur unique qui connaît notre dossier par cœur : un vrai confort.', stars: 5 },
    { name: 'Sophie R.', company: 'Studio de bien-être', text: "L'équipe a capté l'ambiance de mon studio et l'a mise en valeur.", stars: 5 },
    { name: 'Pierre V.', company: 'Transport et logistique', text: 'Un investissement rentabilisé rapidement, avec un suivi sérieux.', stars: 5 },
    { name: 'Julie A.', company: 'Jardinerie', text: 'Des conseils concrets, applicables tout de suite. Exactement ce qu’il nous fallait.', stars: 5 },
  ] as Testimonial[],
}

// ============================================================================
// Registre : pageId -> valeurs par défaut (API, admin, aperçu)
// ============================================================================

export const pageDefaults = {
  home: homeDefaults,
  about: aboutDefaults,
  services: servicesDefaults,
  contact: contactDefaults,
  testimonials: testimonialsDefaults,
} as const

export type PageId = keyof typeof pageDefaults
export type PageContent<P extends PageId> = (typeof pageDefaults)[P]

export const PAGE_IDS = Object.keys(pageDefaults) as PageId[]

export function isPageId(value: string): value is PageId {
  return value in pageDefaults
}

/** Chemin public de chaque page éditable (aperçu admin, revalidation). */
export const pagePaths: Record<PageId, string> = {
  home: '/',
  about: '/a-propos',
  services: '/services',
  contact: '/contact',
  testimonials: '/',
}
