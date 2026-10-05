/**
 * Outils purs du webhook PHARE (testés dans src/tests/phare.test.ts).
 * La route elle-même : src/app/api/phare/publish/route.ts.
 */

import { createHash, timingSafeEqual } from 'node:crypto'

export interface PharePayload {
  action?: string
  title?: string
  slug?: string
  html?: string
  markdown?: string
  metaTitle?: string
  metaDescription?: string
  keyword?: string
  jsonLd?: string | Record<string, unknown> | unknown[]
  coverImageUrl?: string
  coverImageAlt?: string
  publishedAt?: string
  url?: string
  /** Action `file` : fichier de la racine du site (llms.txt). */
  path?: string
  content?: string
  contentType?: string
}

/**
 * Comparaison à temps constant : on compare les empreintes SHA-256 (même
 * longueur quelle que soit l'entrée), ce qui ne révèle ni le contenu ni la
 * longueur du secret.
 */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb) && a.length === b.length
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '')
}

/** Slugs à tenter pour un retrait : tel quel, normalisé, et déduit de l'URL publique. */
export function deleteCandidates(body: PharePayload): string[] {
  const raw = body.slug?.trim()
  const fromUrl = body.url?.trim().split('?')[0].split('#')[0].replace(/\/+$/, '').split('/').pop()
  const candidates = [raw, raw && slugify(raw), fromUrl, fromUrl && slugify(fromUrl)]
  return Array.from(new Set(candidates.filter((s): s is string => Boolean(s))))
}

export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Premier visuel du contenu, utilisé comme couverture si PHARE n'en envoie pas. */
export function firstImageInHtml(html: string): string {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return m ? m[1] : ''
}

/** Le modèle stocke le JSON-LD en chaîne. */
export function jsonLdToString(value: PharePayload['jsonLd']): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value.trim() || undefined
  return JSON.stringify(value)
}

/**
 * Date de publication envoyée par PHARE (article antidaté), ou null si absente
 * ou illisible. Sans elle, l'article prend la date du dépôt.
 */
export function parsePublishedAt(value: unknown): Date | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Conversion markdown minimale, utilisée seulement si PHARE n'envoie pas de
 * HTML (le contrat garantit `html`). Gère titres, listes, tableaux, liens,
 * images, gras et italique : de quoi ne jamais publier un article vide.
 */
export function markdownToHtml(md: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s: string) =>
    escape(s)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')

  const cells = (row: string) =>
    row
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim())

  return md
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => {
      const b = block.trim()
      if (!b) return ''
      const heading = b.match(/^(#{1,6})\s+([\s\S]*)$/)
      if (heading) {
        // Le h1 est réservé au titre de la page : les titres commencent à h2.
        const level = Math.min(Math.max(heading[1].length, 2), 6)
        return `<h${level}>${inline(heading[2].trim())}</h${level}>`
      }
      const lines = b.split('\n')
      if (lines.length >= 2 && /^\s*\|/.test(lines[0]) && /^\s*\|?\s*:?-{3,}/.test(lines[1])) {
        const head = cells(lines[0]).map((c) => `<th>${inline(c)}</th>`).join('')
        const body = lines
          .slice(2)
          .map((l) => `<tr>${cells(l).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')
        return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
      }
      if (lines.every((l) => /^\s*[-*+]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*+]\s+/, ''))}</li>`).join('')}</ul>`
      }
      if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
        return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`
      }
      return `<p>${inline(b).replace(/\n/g, '<br />')}</p>`
    })
    .filter(Boolean)
    .join('\n')
}
