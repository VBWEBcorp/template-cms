import { describe, expect, it } from 'vitest'

import { matchHeading, normalizeForMatch, prepareArticleHtml } from '@/lib/article-html'

describe('tableaux', () => {
  it('enveloppe chaque tableau dans un conteneur à défilement, une seule fois', () => {
    const { html } = prepareArticleHtml('<p>a</p><table><tr><th>A</th></tr></table><table><tr><td>B</td></tr></table>')
    expect(html.match(/class="table-scroll"/g)).toHaveLength(2)
    const again = prepareArticleHtml(html).html
    expect(again.match(/class="table-scroll"/g)).toHaveLength(2)
  })
})

describe('titres', () => {
  it('donne un id stable et unique à chaque h2/h3', () => {
    const { html, headings } = prepareArticleHtml(
      '<h2>1. Le renforcement</h2><h3>Pourquoi ?</h3><h2>Le renforcement</h2>'
    )
    expect(headings.map((h) => h.id)).toEqual(['le-renforcement', 'pourquoi', 'le-renforcement-2'])
    expect(html).toContain('<h2 id="le-renforcement">1. Le renforcement</h2>')
  })

  it('garde un id existant', () => {
    const { headings } = prepareArticleHtml('<h2 id="deja-la">Titre</h2>')
    expect(headings[0].id).toBe('deja-la')
  })

  it('transforme les h1 du corps en h2 (un seul h1 par page)', () => {
    const { html } = prepareArticleHtml('<h1>Intro</h1><p>x</p>')
    expect(html).not.toMatch(/<h1/)
    expect(html).toMatch(/<h2 id="intro">Intro<\/h2>/)
  })
})

describe('sommaire', () => {
  const body = `
    <h2>Sommaire</h2>
    <ol>
      <li>Le renforcement musculaire</li>
      <li>Ce qui change vite : l'énergie et le sommeil</li>
      <li>Une entrée sans titre correspondant</li>
      <li><a href="#mauvaise-ancre">Les erreurs à éviter</a></li>
    </ol>
    <h2>1. Le renforcement musculaire</h2><p>…</p>
    <h2>2. Ce qui change vite</h2><p>…</p>
    <h2>3. Les erreurs à éviter</h2><p>…</p>`

  it('relie chaque entrée certaine à son titre', () => {
    const { html } = prepareArticleHtml(body)
    expect(html).toContain('<a href="#le-renforcement-musculaire">Le renforcement musculaire</a>')
    expect(html).toContain('<a href="#ce-qui-change-vite">Ce qui change vite : l\'énergie et le sommeil</a>')
    expect(html).toContain('<a href="#les-erreurs-a-eviter">Les erreurs à éviter</a>')
    expect(html).toContain('class="article-toc"')
  })

  it("ne lie jamais une entrée incertaine et retire une ancre cassée", () => {
    const { html } = prepareArticleHtml(body)
    expect(html).toMatch(/<li>Une entrée sans titre correspondant<\/li>/)
    expect(html).not.toContain('#mauvaise-ancre')
  })

  it('chaque ancre du sommaire correspond à un id présent dans la page', () => {
    const { html } = prepareArticleHtml(body)
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
    const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
    expect(anchors.length).toBe(3)
    for (const a of anchors) expect(ids.has(a)).toBe(true)
  })

  it('gère les listes imbriquées', () => {
    const { html } = prepareArticleHtml(
      '<p><strong>Sommaire</strong></p><ul><li>Partie A<ul><li>Détail</li></ul></li><li>Partie B</li></ul><h2>Partie A</h2><h3>Détail</h3><h2>Partie B</h2>'
    )
    expect(html).toContain('<a href="#partie-a">Partie A</a>')
    expect(html).toContain('<a href="#detail">Détail</a>')
    expect(html).toContain('<a href="#partie-b">Partie B</a>')
  })

  it('refuse une correspondance ambiguë', () => {
    const headings = [
      { level: 2 as const, id: 'a', text: 'Budget : les postes fixes' },
      { level: 2 as const, id: 'b', text: 'Budget : les imprévus' },
    ]
    expect(matchHeading('Budget', headings)).toBeNull()
    expect(normalizeForMatch('1. L’été : Ça marche !')).toBe('l ete:ca marche')
  })
})
