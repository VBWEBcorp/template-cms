/**
 * Contenu, métadonnées et règles d'écriture.
 */
import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/config/site'
import { pageDefaults } from '@/content/pages'
import { deepMerge, diffFromDefaults } from '@/lib/merge'
import { DESCRIPTION_MAX, TITLE_MAX, buildMetadata } from '@/lib/seo'
import { resolveSender } from '@/lib/sender'

import { ROOT, listFiles, rel } from './helpers'

describe('métadonnées', () => {
  it('description du site : 155 caractères maximum', () => {
    expect(siteConfig.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
  })

  it.each(Object.entries(pageDefaults).filter(([, d]) => 'seo' in d))('page %s : titre ≤ 60, description ≤ 155', (_id, d) => {
    const { seo } = d as { seo: { title: string; description: string } }
    expect(seo.title.length).toBeLessThanOrEqual(TITLE_MAX)
    expect(seo.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    const meta = buildMetadata({ title: seo.title, description: seo.description, path: '/x' })
    const title = (meta.title as { absolute: string }).absolute
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX)
  })

  it("l'image de partage est toujours posée (Next fusionne openGraph en surface)", () => {
    const meta = buildMetadata({ title: 'T', description: 'D', path: '/x' })
    expect(meta.openGraph?.images).toBeTruthy()
    expect(String(meta.alternates?.canonical)).toMatch(/^https?:\/\//)
  })
})

describe('valeurs par défaut', () => {
  it('aucun champ vide dans les valeurs par défaut des pages (jamais de trou dans l’admin ni sur le site)', () => {
    const empties: string[] = []
    const walk = (v: unknown, p: string) => {
      if (typeof v === 'string' && v.trim() === '') empties.push(p)
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`))
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${p}.${k}`)
    }
    walk(pageDefaults, 'pages')
    expect(empties).toEqual([])
  })

  it('un champ vidé dans l’admin ne vide pas le site, un champ inconnu est ignoré', () => {
    const merged = deepMerge({ a: 'défaut', b: ['x'], c: { d: 1 } }, { a: '', b: ['y'], z: 'pirate', c: { d: 2 } })
    expect(merged).toEqual({ a: 'défaut', b: ['y'], c: { d: 2 } })
  })

  it('seuls les écarts partent en base', () => {
    expect(diffFromDefaults({ a: 1, b: { c: 2, d: 3 } }, { a: 1, b: { c: 2, d: 4 } })).toEqual({ b: { d: 4 } })
    expect(diffFromDefaults({ a: 1 }, { a: 1 })).toBeUndefined()
    expect(diffFromDefaults({ a: 'x', b: 'y' }, { a: '', b: 'z' })).toEqual({ b: 'z' })
  })
})

describe('e-mails', () => {
  it("refuse l'adresse bac à sable de Resend et retombe sur le domaine du site", () => {
    const r = resolveSender({ configured: 'Client <onboarding@resend.dev>', siteName: 'Client', siteUrl: 'https://www.client.fr' })
    expect(r.from).toBe('Client <contact@client.fr>')
    expect(r.warning).toMatch(/bac à sable/)
    expect(resolveSender({ configured: 'X <hello@client.fr>', siteName: 'X', siteUrl: 'https://client.fr' }).from).toBe(
      'X <hello@client.fr>'
    )
  })
})

describe("règles d'écriture", () => {
  it('aucun tiret long (cadratin, demi-cadratin, barre, tiret de chiffre, signe moins)', () => {
    const LONG = /[\u2012\u2013\u2014\u2015\u2212]/
    const hits = listFiles(ROOT, (f) => /\.(tsx?|mts|mjs|css|md|mdc)$/.test(f))
      .flatMap((f) =>
        fs
          .readFileSync(f, 'utf8')
          .split('\n')
          .map((line, i) => (LONG.test(line) ? `${rel(f)}:${i + 1}` : ''))
          .filter(Boolean)
      )
    expect(hits).toEqual([])
  })

  it('pas de « Mymag » ni de nom de client réel dans le template', () => {
    const hits = listFiles(ROOT, (f) => /\.(tsx?|mts|mjs|md|json)$/.test(f) && !f.includes('package-lock'))
      .filter((f) => !f.includes('tests'))
      .filter((f) => /mymag/i.test(fs.readFileSync(f, 'utf8')))
    expect(hits.map(rel)).toEqual([])
  })
})
