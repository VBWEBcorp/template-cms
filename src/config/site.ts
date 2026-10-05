/**
 * Configuration du site : LE fichier à remplir pour chaque nouveau client.
 *
 * Tout ce qui identifie l'entreprise (nom, domaine, coordonnées, couleur,
 * réseaux, lien de rendez-vous, options d'affichage) se règle ici. Le reste du
 * code lit ces valeurs : aucun composant ne doit contenir un nom, une adresse
 * ou une couleur de marque en dur.
 *
 * Les textes des pages (titres, paragraphes, services, FAQ...) vivent dans
 * `src/content/pages.ts` ; le back-office peut les surcharger page par page.
 * La base ne stocke que les écarts : sans base, le site reste entièrement
 * lisible avec ces valeurs.
 */

/** Adresse publique du site, sans barre finale. En local : http://localhost:3000. */
const url = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

export const siteConfig = {
  /** Nom de la marque, tel qu'il doit apparaître dans Google et dans le logo. */
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Atelier Exemple',
  /** Raison sociale (mentions légales, JSON-LD). */
  legalName: 'Atelier Exemple SARL',
  /**
   * Description courte de l'activité : meta description de l'accueil, JSON-LD,
   * flux RSS. 155 caractères maximum (vérifié par les tests).
   */
  description:
    'Atelier Exemple accompagne les entreprises de la région : conseil, réalisation et suivi, avec un interlocuteur unique du premier appel à la livraison.',
  url,
  locale: 'fr_FR',
  lang: 'fr',

  /**
   * Couleur de marque. `brandHue` est la teinte (0 à 360) de la couleur
   * principale, en OKLCH : 285 = violet, 250 = bleu, 160 = vert, 25 = rouge.
   * Toutes les nuances du site en dérivent (src/index.css).
   * `themeColor` est la même couleur en hexadécimal (barre du navigateur mobile).
   */
  theme: {
    brandHue: 285,
    themeColor: '#6d28d9',
  },

  /** Coordonnées par défaut. Le back-office (page Contact) peut les modifier. */
  contact: {
    email: 'contact@example.com',
    phone: '01 23 45 67 89',
    /** Format international pour les liens tel: et le JSON-LD. */
    phoneE164: '+33123456789',
    address: {
      street: '12 rue de l’Exemple',
      postalCode: '35000',
      city: 'Rennes',
      region: 'Bretagne',
      country: 'FR',
    },
    hours: 'Du lundi au vendredi, de 9 h à 18 h',
  },

  /**
   * Second chemin de conversion à côté du formulaire : un lien de prise de
   * rendez-vous (Calendly, Cal.com...). Laisser vide pour n'afficher que le
   * formulaire. Le bloc d'appel à l'action ne propose jamais plus de ces deux voies.
   */
  appointmentUrl: process.env.NEXT_PUBLIC_APPOINTMENT_URL ?? '',

  /**
   * Données structurées de l'entreprise.
   * `type` : 'LocalBusiness' pour un commerce ou un cabinet avec adresse,
   * 'ProfessionalService', 'Organization' pour une entreprise sans accueil
   * physique. Voir https://schema.org/LocalBusiness pour les sous-types.
   */
  business: {
    type: 'ProfessionalService' as string,
    priceRange: '',
    /** Zones desservies (villes, départements). */
    areaServed: ['Rennes', 'Ille-et-Vilaine'],
    /** Coordonnées GPS, optionnelles : { latitude: 48.11, longitude: -1.68 } */
    geo: null as null | { latitude: number; longitude: number },
  },

  /** Profils officiels (Google Business Profile, LinkedIn...). Alimente `sameAs`. */
  social: [] as string[],

  /** Compte X/Twitter (ex. '@exemple'), laissé vide s'il n'existe pas. */
  twitterHandle: '',

  /**
   * Note moyenne affichée dans le hero et la section avis. À ne renseigner
   * qu'avec les vrais chiffres de la fiche Google du client ; `null` masque
   * le bloc. Jamais reprise dans le JSON-LD (Google ignore les avis auto-déclarés).
   */
  rating: { value: '4,9', count: '120 avis', source: 'Google' } as null | {
    value: string
    count: string
    source: string
  },

  /** Interrupteurs d'affichage. */
  features: {
    /** Bouton d'appel flottant. Désactivé par défaut : il double le CTA. */
    floatingCallButton: false,
    /** Bandeau de consentement aux cookies (à garder dès qu'un traceur est posé). */
    cookieBanner: true,
    /** Bouton clair / sombre dans la barre de navigation. */
    themeToggle: true,
    /** Bandeau rouge « maquette de démonstration » en pied de page. */
    demoBanner: process.env.NEXT_PUBLIC_DEMO_BANNER === '1',
  },
} as const

export type SiteConfig = typeof siteConfig
