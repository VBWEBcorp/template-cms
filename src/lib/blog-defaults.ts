/** Réglages par défaut du blog (sans base, ou tant que l'admin n'y a pas touché). */
export const BLOG_SETTINGS_DEFAULTS = {
  enabled: true,
  title: 'Nos derniers articles',
  description: 'Conseils, retours d’expérience et actualités pour avancer sur vos projets.',
  eyebrow: 'Blog',
  heroImage: '',
  categories: [] as string[],
}

/** Réglages par défaut de la galerie. */
export const GALLERY_SETTINGS_DEFAULTS = {
  enabled: true,
  title: 'Nos réalisations',
  description: 'Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire.',
  eyebrow: 'Galerie',
  heroImage: '',
}

/** Chemin public du blog. Pour passer en /actualites : changer cette valeur ET renommer le dossier src/app/(site)/blog. */
export const BLOG_BASE = '/blog'
