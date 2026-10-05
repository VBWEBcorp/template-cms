/**
 * Tests de câblage : la panne la plus trompeuse du parc n'est pas un bug, c'est
 * un composant écrit, réglable dans l'admin... et monté nulle part. Aucune
 * erreur nulle part, le client dit « je l'ai créé mais ça ne s'affiche pas ».
 * Ces tests refusent ce silence.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { PAGE_IDS } from '@/content/pages'

import { ROOT, SRC, code, listFiles, read, rel } from './helpers'

describe("ossature du site : tout module réglable dans l'admin est monté", () => {
  const chrome = code('src/components/layout/site-chrome.tsx')

  it('le layout du site passe par SiteChrome', () => {
    expect(code('src/app/(site)/layout.tsx')).toMatch(/<SiteChrome>/)
    expect(code('src/app/not-found.tsx')).toMatch(/<SiteChrome>/)
  })

  it('le marketing (popup + bandeau) est monté', () => {
    expect(chrome).toMatch(/import \{ Marketing \} from '@\/components\/marketing\/marketing'/)
    expect(chrome).toMatch(/<Marketing settings=\{marketing\} \/>/)
    const marketing = code('src/components/marketing/marketing.tsx')
    expect(marketing).toMatch(/<MarketingBannerBar /)
    expect(marketing).toMatch(/<MarketingPopup /)
    expect(code('src/components/marketing/marketing-popup.tsx')).toMatch(/<MarketingPopupCard /)
  })

  it('le bandeau cookies, la navigation, le pied de page et le bouton haut de page sont montés', () => {
    expect(chrome).toMatch(/<CookieConsent \/>/)
    expect(chrome).toMatch(/<Navbar /)
    expect(chrome).toMatch(/<Footer /)
    expect(chrome).toMatch(/<ScrollToTop \/>/)
  })

  it("l'aperçu de l'admin réutilise les composants réels du site", () => {
    const admin = code('src/app/admin/marketing/page.tsx')
    expect(admin).toMatch(/from '@\/components\/marketing\/popup-card'/)
    expect(admin).toMatch(/<MarketingPopupCard /)
    expect(admin).toMatch(/from '@\/components\/marketing\/banner-bar'/)
    expect(admin).toMatch(/<MarketingBannerBar /)
    // Aucune copie du balisage de la popup dans l'admin.
    expect(admin).not.toMatch(/shadow-\[0_25px_60px/)

    const preview = code('src/app/(site)/apercu/[pageId]/page.tsx')
    for (const page of ['HomePage', 'AboutPage', 'ServicesPage', 'ContactPage']) {
      expect(preview).toMatch(new RegExp(`<${page} `))
    }
  })

  it('aucun composant orphelin dans src/components', () => {
    const sources = listFiles(SRC, (f) => /\.(tsx?|mts)$/.test(f)).map((f) => ({ f, s: fs.readFileSync(f, 'utf8') }))
    const components = listFiles(path.join(SRC, 'components'), (f) => f.endsWith('.tsx'))
    const orphans = components.filter((file) => {
      const importPath = '@/' + rel(file).replace(/^src\//, '').replace(/\.tsx$/, '')
      return !sources.some(({ f, s }) => f !== file && s.includes(`'${importPath}'`))
    })
    expect(orphans.map(rel)).toEqual([])
  })
})

describe('admin : seules les pages réellement branchées sont proposées', () => {
  const editors = listFiles(path.join(SRC, 'app/admin/pages'), (f) => f.endsWith('page.tsx'))

  it('chaque éditeur de page vise un pageId connu, lu par le site', () => {
    const siteCode = listFiles(path.join(SRC, 'app/(site)'), (f) => f.endsWith('.tsx'))
      .map((f) => fs.readFileSync(f, 'utf8'))
      .join('\n')
    for (const file of editors) {
      const pageId = fs.readFileSync(file, 'utf8').match(/pageId="([^"]+)"/)?.[1]
      expect(pageId, rel(file)).toBeDefined()
      expect(PAGE_IDS).toContain(pageId)
      expect(siteCode, `le site ne lit jamais « ${pageId} »`).toContain(`getPageContent('${pageId}')`)
    }
  })

  it('chaque lien du menu admin mène à une page qui existe', () => {
    const sidebar = read('src/components/admin/sidebar.tsx')
    const hrefs = [...sidebar.matchAll(/href: '(\/admin\/[^']+)'/g)].map((m) => m[1])
    expect(hrefs.length).toBeGreaterThan(5)
    for (const href of hrefs) {
      expect(fs.existsSync(path.join(SRC, 'app', href, 'page.tsx')), href).toBe(true)
    }
  })

  it("les champs édités dans l'admin existent dans les valeurs par défaut lues par le site", async () => {
    const { pageDefaults } = await import('@/content/pages')
    for (const file of editors) {
      const src = fs.readFileSync(file, 'utf8')
      const pageId = src.match(/pageId="([^"]+)"/)![1] as keyof typeof pageDefaults
      const paths = [...src.matchAll(/update\('([\w.]+)'/g)].map((m) => m[1])
      for (const p of paths) {
        const value = p.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown> | undefined)?.[key], pageDefaults[pageId])
        expect(value, `${rel(file)} : champ « ${p} » inconnu du site`).not.toBeUndefined()
      }
    }
  })
})

describe('conversion', () => {
  it('le formulaire de contact envoie vraiment, par /api/contact (Resend)', () => {
    expect(code('src/components/contact-form.tsx')).toMatch(/fetch\('\/api\/contact'/)
    expect(fs.existsSync(path.join(SRC, 'app/api/contact/route.ts'))).toBe(true)
  })

  it('aucune trace de Formspree', () => {
    const hits = listFiles(ROOT, (f) => /\.(tsx?|mjs|mts|md|json|toml)$/.test(f) && !f.includes('package-lock'))
      .filter((f) => !f.includes(`${path.sep}tests${path.sep}`))
      .filter((f) => /formspree/i.test(fs.readFileSync(f, 'utf8')))
    expect(hits.map(rel)).toEqual([])
  })

  it("le bloc d'appel à l'action ne propose que le formulaire et le rendez-vous", () => {
    for (const file of ['src/components/sections/cta-section.tsx', 'src/components/pages/contact-page.tsx']) {
      const src = code(file)
      expect(src, file).not.toMatch(/href=\{?[`'"]?(tel:|mailto:|https:\/\/wa\.me)/)
    }
  })

  it('le bouton d’appel flottant est désactivé par défaut', async () => {
    const { siteConfig } = await import('@/config/site')
    expect(siteConfig.features.floatingCallButton).toBe(false)
  })
})
