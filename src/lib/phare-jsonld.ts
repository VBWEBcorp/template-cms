/**
 * JSON-LD d'un article déposé par PHARE, remis en état avant affichage.
 *
 * Pièges constatés sur le parc :
 * - PHARE désigne parfois son visuel par une adresse RELATIVE (« /api/media/... ») :
 *   lue sur le site du client, elle répond 404 et Google voit un article sans
 *   image. Toute adresse relative est rendue absolue : /api/media/ vers PHARE,
 *   le reste vers le site.
 * - La date affichée sur la page vient de la base (publishedAt honoré au
 *   dépôt) : le JSON-LD reprend les mêmes dates pour ne jamais se contredire.
 */

export const PHARE_ORIGIN = 'https://app.vbweb.fr'

const URL_KEYS = new Set(['image', 'url', 'logo', 'thumbnailUrl', 'contentUrl'])
const ARTICLE_TYPES = /(^|:)(Article|BlogPosting|NewsArticle|TechArticle)$/

type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

export function absolutize(value: string, siteUrl: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return value
  const base = value.startsWith('/api/media/') ? PHARE_ORIGIN : siteUrl
  return `${base}${value}`
}

function walk(node: Json, siteUrl: string): Json {
  if (Array.isArray(node)) return node.map((n) => walk(n, siteUrl))
  if (node && typeof node === 'object') {
    const out: { [key: string]: Json } = {}
    for (const [key, value] of Object.entries(node)) {
      out[key] = URL_KEYS.has(key) && typeof value === 'string' ? absolutize(value, siteUrl) : walk(value, siteUrl)
    }
    return out
  }
  return node
}

function isArticle(node: Json): node is { [key: string]: Json } {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return false
  const type = node['@type']
  const types = Array.isArray(type) ? type : [type]
  return types.some((t) => typeof t === 'string' && ARTICLE_TYPES.test(t))
}

export function preparePhareJsonLd(
  raw: string,
  options: { siteUrl: string; coverImage?: string; datePublished?: string; dateModified?: string }
): Json | null {
  let data: Json
  try {
    data = JSON.parse(raw) as Json
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null

  const fixed = walk(data, options.siteUrl)
  const nodes: Json[] = Array.isArray(fixed)
    ? fixed
    : fixed && typeof fixed === 'object' && Array.isArray((fixed as { '@graph'?: Json })['@graph'])
      ? ((fixed as { '@graph': Json[] })['@graph'])
      : [fixed]

  for (const node of nodes) {
    if (!isArticle(node)) continue
    const cover = options.coverImage ? absolutize(options.coverImage, options.siteUrl) : ''
    if (cover && !node.image) node.image = { '@type': 'ImageObject', url: cover }
    if (options.datePublished) node.datePublished = options.datePublished
    if (options.dateModified) node.dateModified = options.dateModified
  }
  return fixed
}
