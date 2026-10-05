/**
 * Préparation du HTML d'un article avant affichage (éditeur de l'admin ou PHARE).
 *
 * Exigences tenues ici, pour tous les articles :
 * 1. Les tableaux sont de vrais tableaux lisibles : chaque <table> est entouré
 *    d'un conteneur à défilement horizontal (styles dans src/index.css).
 * 2. Le sommaire est cliquable : chaque titre h2/h3 reçoit un id stable, et
 *    chaque entrée du sommaire pointe vers le titre correspondant.
 *    Une entrée n'est liée que si la correspondance est CERTAINE (texte
 *    identique une fois la numérotation et la ponctuation retirées, ou
 *    identique avant les deux-points). Un lien vers le mauvais endroit est
 *    pire qu'une absence de lien : dans le doute, l'entrée reste du texte.
 * 3. Un seul h1 par page (le titre de l'article) : les h1 du corps deviennent h2.
 *
 * Module pur, sans dépendance : testé dans src/tests/article-html.test.ts.
 */

export type ArticleHeading = { level: 2 | 3; id: string; text: string }

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  laquo: '«',
  raquo: '»',
  hellip: '…',
}

export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : m
    }
    return ENTITIES[code.toLowerCase()] ?? m
  })
}

export function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/** Retire une numérotation de tête : « 1. », « 2) », « 3 - », « IV. », « Étape 2 : » non. */
export function stripNumbering(text: string): string {
  // Les deux tirets longs du jeu de caractères Unicode parfois présents dans les titres reçus (jamais écrits ici).
  return text.replace(/^\s*(?:\d+(?:\.\d+)*|[ivxlc]+)\s*[.)\-:\u2013\u2014]\s*/i, '').trim()
}

/** Forme de comparaison : sans accents, numérotation, ponctuation ni casse. */
export function normalizeForMatch(text: string): string {
  return stripNumbering(decodeEntities(text))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, ' ')
    .replace(/[^a-z0-9: ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*:\s*/g, ':')
    .trim()
}

/** id d'ancre lisible et stable, dérivé du texte du titre. */
export function slugifyHeading(text: string): string {
  return (
    stripNumbering(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[’']/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/g, '') || 'section'
  )
}

const TOC_TITLE = /^(sommaire|table des mati[eè]res|au sommaire|dans cet article|plan de l[’']article|au programme)\s*:?$/i

function beforeColon(normalized: string): string {
  const i = normalized.indexOf(':')
  return i === -1 ? normalized : normalized.slice(0, i).trim()
}

/** Titre visé par une entrée de sommaire, uniquement si la correspondance est unique et certaine. */
export function matchHeading(entry: string, headings: ArticleHeading[]): ArticleHeading | null {
  const e = normalizeForMatch(entry)
  if (!e) return null

  const exact = headings.filter((h) => normalizeForMatch(h.text) === e)
  if (exact.length === 1) return exact[0]
  if (exact.length > 1) return null

  // « Ce qui change vite : l'énergie... » pour un titre « Ce qui change vite », et l'inverse.
  const eHead = beforeColon(e)
  const loose = headings.filter((h) => {
    const n = normalizeForMatch(h.text)
    const hHead = beforeColon(n)
    return (eHead && eHead === n) || (hHead && hHead === e) || (eHead && hHead && eHead === hHead && eHead !== e && hHead !== n)
  })
  return loose.length === 1 ? loose[0] : null
}

function getAttr(attrs: string, name: string): string | null {
  const m = attrs.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return m ? (m[2] ?? m[3] ?? '') : null
}

export function prepareArticleHtml(input: string): { html: string; headings: ArticleHeading[] } {
  let html = input || ''

  // 3. Un seul h1 : celui du gabarit.
  html = html.replace(/<h1(\s[^>]*)?>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>')

  // 1. Tableaux enveloppés pour le défilement horizontal (une seule fois).
  html = html.replace(/<table[\s\S]*?<\/table>/gi, (table, offset: number, all: string) => {
    const before = all.slice(Math.max(0, offset - 60), offset)
    return /class="table-scroll"[^>]*>\s*$/.test(before) ? table : `<div class="table-scroll">${table}</div>`
  })

  // 2a. ids sur les titres h2/h3.
  const headings: ArticleHeading[] = []
  const used = new Set<string>()
  html = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (_m, level: string, attrs = '', inner: string) => {
    const text = stripTags(inner)
    let id = getAttr(attrs, 'id')
    if (!id || used.has(id)) {
      const base = slugifyHeading(text)
      id = base
      for (let i = 2; used.has(id); i++) id = `${base}-${i}`
      attrs = attrs.replace(/\s+id\s*=\s*("[^"]*"|'[^']*')/i, '')
      attrs = `${attrs} id="${id}"`
    }
    used.add(id)
    headings.push({ level: Number(level) as 2 | 3, id, text })
    return `<h${level}${attrs}>${inner}</h${level}>`
  })

  // 2b. Sommaire : un titre « Sommaire » suivi d'une liste, ou un <nav> contenant une liste.
  const tocHeadingIds = new Set<string>()
  const targets = () => headings.filter((h) => !tocHeadingIds.has(h.id))

  const linkList = (list: string): string =>
    list.replace(/(<li(?:\s[^>]*)?>)([\s\S]*?)(?=<\/li>|<ul|<ol)/gi, (_m, open: string, content: string) => {
      const anchor = content.match(/^(\s*)<a(\s[^>]*)?>([\s\S]*?)<\/a>([\s\S]*)$/i)
      if (anchor) {
        const href = getAttr(anchor[2] ?? '', 'href') ?? ''
        if (href.startsWith('#') && headings.some((h) => h.id === decodeURIComponent(href.slice(1)))) {
          return open + content
        }
        if (href && !href.startsWith('#')) return open + content // lien externe ou interne : on n'y touche pas
        const target = matchHeading(stripTags(anchor[3]), targets())
        return target
          ? `${open}${anchor[1]}<a href="#${target.id}">${anchor[3]}</a>${anchor[4]}`
          : `${open}${anchor[1]}${anchor[3]}${anchor[4]}`
      }
      const text = stripTags(content)
      if (!text) return open + content
      const target = matchHeading(text, targets())
      if (!target) return open + content
      const lead = content.match(/^\s*/)?.[0] ?? ''
      const trail = content.match(/\s*$/)?.[0] ?? ''
      return `${open}${lead}<a href="#${target.id}">${content.trim()}</a>${trail}`
    })

  let tocDone = false
  const titleRe = /<(h[2-4]|p|div)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi
  for (let m = titleRe.exec(html); m; m = titleRe.exec(html)) {
    if (!TOC_TITLE.test(stripTags(m[2]))) continue
    const afterTitle = m.index + m[0].length
    const listStart = html.slice(afterTitle).search(/\S/)
    if (listStart === -1) break
    const start = afterTitle + listStart
    if (!/^<(ul|ol)[\s>]/i.test(html.slice(start, start + 4))) continue
    const end = balancedListEnd(html, start)
    if (end === -1) break

    const id = getAttr(m[0], 'id')
    if (id) tocHeadingIds.add(id)
    const list = html.slice(start, end)
    html =
      html.slice(0, m.index) +
      `<nav class="article-toc" aria-label="Sommaire">${html.slice(m.index, start)}${linkList(list)}</nav>` +
      html.slice(end)
    tocDone = true
    break
  }

  if (!tocDone) {
    html = html.replace(/<nav(\s[^>]*)?>([\s\S]*?)<\/nav>/i, (m, attrs = '', inner: string) =>
      /<(ul|ol)[\s>]/i.test(inner) ? `<nav${attrs}>${linkList(inner)}</nav>` : m
    )
  }

  return { html, headings }
}

/** Fin (exclue) de la liste ouverte à `start`, en tenant compte des listes imbriquées. */
function balancedListEnd(html: string, start: number): number {
  const re = /<(\/?)(ul|ol)(?=[\s>])[^>]*>/gi
  re.lastIndex = start
  let depth = 0
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[1] ? -1 : 1
    if (depth === 0) return m.index + m[0].length
  }
  return -1
}
