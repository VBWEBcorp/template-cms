/**
 * Contrat du webhook PHARE (identique sur tout le parc) et outils associés.
 */
import { beforeAll, describe, expect, it } from 'vitest'

import { deleteCandidates, markdownToHtml, parsePublishedAt, safeEqual, slugify } from '@/lib/phare'
import { absolutize, preparePhareJsonLd } from '@/lib/phare-jsonld'
import { isAllowedSiteFile } from '@/lib/site-files'

describe('outils', () => {
  it('compare les secrets sans fuite', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('abc', 'abcd')).toBe(false)
  })

  it('déduit les slugs à retirer du slug ou de l’URL', () => {
    expect(deleteCandidates({ url: 'https://site.fr/blog/Mon-Article/?x=1' })).toEqual(['Mon-Article', 'mon-article'])
    expect(slugify('Été : les 5 réflexes !')).toBe('ete-les-5-reflexes')
  })

  it('honore la date de publication envoyée, ignore une date illisible', () => {
    expect(parsePublishedAt('2026-08-19T08:00:00.000Z')?.toISOString()).toBe('2026-08-19T08:00:00.000Z')
    expect(parsePublishedAt('pas une date')).toBeNull()
    expect(parsePublishedAt(undefined)).toBeNull()
  })

  it('n’accepte que llms.txt comme fichier de la racine', () => {
    expect(isAllowedSiteFile('/llms.txt')).toBe(true)
    expect(isAllowedSiteFile('robots.txt')).toBe(false)
    expect(isAllowedSiteFile('../.env')).toBe(false)
  })

  it('convertit le markdown de secours, tableaux compris, sans h1', () => {
    const html = markdownToHtml('# Titre\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n- un\n- deux')
    expect(html).toContain('<h2>Titre</h2>')
    expect(html).toContain('<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>')
    expect(html).toContain('<ul><li>un</li><li>deux</li></ul>')
  })
})

describe('JSON-LD de PHARE', () => {
  it('rend absolues les adresses relatives (/api/media vers PHARE, le reste vers le site)', () => {
    expect(absolutize('/api/media/abc.webp', 'https://client.fr')).toBe('https://app.vbweb.fr/api/media/abc.webp')
    expect(absolutize('/images/a.png', 'https://client.fr')).toBe('https://client.fr/images/a.png')
    expect(absolutize('https://x.fr/a.png', 'https://client.fr')).toBe('https://x.fr/a.png')
  })

  it('aligne les dates de l’article sur celles de la page et pose la couverture', () => {
    const raw = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'BlogPosting', headline: 'T', image: '/api/media/c.webp', datePublished: '2026-01-01' }],
    })
    const out = preparePhareJsonLd(raw, {
      siteUrl: 'https://client.fr',
      datePublished: '2026-08-19T08:00:00.000Z',
      dateModified: '2026-08-20T08:00:00.000Z',
    }) as { '@graph': Array<Record<string, unknown>> }
    const article = out['@graph'][0]
    expect(article.image).toBe('https://app.vbweb.fr/api/media/c.webp')
    expect(article.datePublished).toBe('2026-08-19T08:00:00.000Z')
    expect(preparePhareJsonLd('{pas du json', { siteUrl: 'https://client.fr' })).toBeNull()
  })
})

describe('route POST /api/phare/publish', () => {
  let POST: (req: Request) => Promise<Response>
  beforeAll(async () => {
    process.env.PHARE_WEBHOOK_SECRET = 'secret-phare-test'
    delete process.env.MONGODB_URI
    ;({ POST } = await import('@/app/api/phare/publish/route'))
  })

  const call = (headers: Record<string, string>, body?: unknown) =>
    POST(new Request('http://localhost/api/phare/publish', { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined }))

  it('refuse un secret absent ou faux (401, { message })', async () => {
    const r1 = await call({})
    expect(r1.status).toBe(401)
    expect(await r1.json()).toHaveProperty('message')
    const r2 = await call({ 'x-phare-secret': 'mauvais' })
    expect(r2.status).toBe(401)
  })

  it('x-phare-test : { ok: true } sans rien écrire', async () => {
    const r = await call({ 'x-phare-secret': 'secret-phare-test', 'x-phare-test': '1' })
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true })
  })

  it('sans base configurée : erreur explicite en { message }', async () => {
    const r = await call({ 'x-phare-secret': 'secret-phare-test', 'content-type': 'application/json' }, { title: 'T', html: '<p>x</p>' })
    expect(r.status).toBe(503)
    expect((await r.json()).message).toMatch(/MONGODB_URI/)
  })
})
