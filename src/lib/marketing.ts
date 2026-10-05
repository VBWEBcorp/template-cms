/**
 * Réglages marketing (popup + bandeau d'annonce).
 *
 * Un seul fichier décrit la forme des données, leurs valeurs par défaut et la
 * règle d'affichage. Le site, l'admin et l'API s'y réfèrent : l'aperçu de
 * l'admin ne peut pas dériver de ce que voit le visiteur.
 */

export interface MarketingBannerSettings {
  enabled: boolean
  text: string
  link: string
  bgColor: string
  textColor: string
}

export interface MarketingSettings {
  enabled: boolean
  title: string
  description: string
  buttonText: string
  buttonLink: string
  imageUrl: string
  bgColor: string
  textColor: string
  buttonColor: string
  /** Délai d'apparition de la popup, en secondes. */
  delay: number
  banner: MarketingBannerSettings
}

export const DEFAULT_MARKETING: MarketingSettings = {
  enabled: false,
  title: 'Offre du moment',
  description: 'Un premier échange offert pour faire le point sur votre projet.',
  buttonText: 'En profiter',
  buttonLink: '/contact',
  imageUrl: '',
  bgColor: '#ffffff',
  textColor: '#111827',
  buttonColor: '#6d28d9',
  delay: 8,
  banner: {
    enabled: false,
    text: 'Nouveau : prenez rendez-vous en ligne en deux clics',
    link: '/contact',
    bgColor: '#111827',
    textColor: '#ffffff',
  },
}

const HEX = /^#[0-9a-f]{3,8}$/i

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value.trim()) ? value.trim() : fallback
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

/** Remet en forme ce qui vient de la base ou du formulaire (champs manquants, couleurs invalides). */
export function normalizeMarketing(raw: unknown): MarketingSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const b = (r.banner && typeof r.banner === 'object' ? r.banner : {}) as Record<string, unknown>
  const d = DEFAULT_MARKETING
  const delay = Number(r.delay)
  return {
    enabled: r.enabled === true,
    title: text(r.title, d.title),
    description: text(r.description, d.description),
    buttonText: text(r.buttonText, d.buttonText),
    buttonLink: text(r.buttonLink, d.buttonLink),
    imageUrl: text(r.imageUrl, ''),
    bgColor: color(r.bgColor, d.bgColor),
    textColor: color(r.textColor, d.textColor),
    buttonColor: color(r.buttonColor, d.buttonColor),
    delay: Number.isFinite(delay) ? Math.min(120, Math.max(0, Math.round(delay))) : d.delay,
    banner: {
      enabled: b.enabled === true,
      text: text(b.text, d.banner.text),
      link: text(b.link, ''),
      bgColor: color(b.bgColor, d.banner.bgColor),
      textColor: color(b.textColor, d.banner.textColor),
    },
  }
}

export const isPopupLive = (s: MarketingSettings) => s.enabled && Boolean(s.title.trim())
export const isBannerLive = (s: MarketingSettings) => s.banner.enabled && Boolean(s.banner.text.trim())

/** Lien sûr : chemin interne ou adresse http(s) ; tout le reste est ignoré. */
export function safeLink(href: string): { href: string; external: boolean } | null {
  const h = href.trim()
  if (!h || h === '#') return null
  if (h.startsWith('/') && !h.startsWith('//')) return { href: h, external: false }
  if (/^https?:\/\//i.test(h)) return { href: h, external: true }
  return null
}

/** Signature d'une campagne : change dès que le message change (un visiteur qui avait fermé l'ancien voit le nouveau). */
export function campaignKey(s: MarketingSettings): string {
  const source = `${s.title}|${s.description}|${s.buttonLink}`
  let h = 0
  for (let i = 0; i < source.length; i++) h = (h * 31 + source.charCodeAt(i)) | 0
  return String(h >>> 0)
}
