/**
 * Session admin : le piège du jeton expiré (boucle connexion / tableau de bord,
 * « je suis connecté et je ne vois rien ») ne doit pas revenir.
 */
import fs from 'node:fs'
import path from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

import { getTokenExpiry, isTokenValid } from '@/lib/admin-session'

import { SRC, code, listFiles, rel } from './helpers'

function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.signature`
}

describe('validité du jeton côté navigateur', () => {
  const now = Date.UTC(2026, 9, 5)

  it('un jeton présent mais expiré n’est PAS une session', () => {
    expect(isTokenValid(fakeJwt({ exp: now / 1000 - 60 }), now)).toBe(false)
  })

  it('un jeton qui expire dans moins de 30 s est déjà mort', () => {
    expect(isTokenValid(fakeJwt({ exp: now / 1000 + 10 }), now)).toBe(false)
  })

  it('un jeton valable est accepté', () => {
    expect(isTokenValid(fakeJwt({ exp: now / 1000 + 3600 }), now)).toBe(true)
    expect(getTokenExpiry(fakeJwt({ exp: 123 }))).toBe(123_000)
  })

  it('absent, illisible ou sans expiration : refusé', () => {
    expect(isTokenValid(null, now)).toBe(false)
    expect(isTokenValid('demo-token', now)).toBe(false)
    expect(isTokenValid(fakeJwt({ sub: 'x' }), now)).toBe(false)
  })
})

describe('jetons côté serveur', () => {
  let auth: typeof import('@/lib/auth')
  beforeAll(async () => {
    process.env.JWT_SECRET = 'secret-de-test'
    auth = await import('@/lib/auth')
  })

  it('signe puis vérifie un jeton', () => {
    const token = auth.generateToken({ userId: 'admin', email: 'a@b.fr', role: 'admin' })
    expect(auth.verifyToken(token)?.role).toBe('admin')
  })

  it('refuse un jeton modifié, un algorithme « none » et la porte dérobée demo-token', async () => {
    const token = auth.generateToken({ userId: 'admin', email: 'a@b.fr', role: 'user' })
    const [h, , s] = token.split('.')
    const forged = `${h}.${Buffer.from(JSON.stringify({ userId: 'x', email: 'x', role: 'admin', exp: 9e9 })).toString('base64url')}.${s}`
    expect(auth.verifyToken(forged)).toBeNull()
    const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"role":"admin","exp":9999999999}').toString('base64url')}.`
    expect(auth.verifyToken(none)).toBeNull()
    const req = new Request('http://x', { headers: { authorization: 'Bearer demo-token' } })
    expect(await auth.isAdminRequest(req)).toBe(false)
  })
})

describe("tout appel admin passe par adminFetch", () => {
  const clientFiles = listFiles(SRC, (f) => /\.tsx?$/.test(f))
    .filter((f) => !f.includes(`${path.sep}tests${path.sep}`))
    .filter((f) => fs.readFileSync(f, 'utf8').startsWith("'use client'"))

  it('personne d’autre ne lit le jeton dans localStorage', () => {
    const offenders = clientFiles
      .filter((f) => !f.endsWith(`lib${path.sep}admin-session.ts`))
      .filter((f) => /authToken/.test(code(rel(f))))
    expect(offenders.map(rel)).toEqual([])
  })

  it('aucun en-tête Authorization fabriqué à la main', () => {
    const offenders = clientFiles
      .filter((f) => !f.endsWith(`lib${path.sep}admin-session.ts`))
      .filter((f) => /Authorization/.test(code(rel(f))))
    expect(offenders.map(rel)).toEqual([])
  })

  it("l'espace admin n'appelle jamais fetch directement (hors connexion)", () => {
    const adminFiles = clientFiles.filter((f) => /[\\/](app[\\/]admin|components[\\/]admin)[\\/]/.test(f))
    const offenders = adminFiles
      .filter((f) => !f.endsWith(`login${path.sep}page.tsx`))
      .filter((f) => /(^|[^\w])fetch\(/.test(code(rel(f))))
    expect(offenders.map(rel)).toEqual([])
  })

  it('le layout admin teste la validité du jeton, pas sa simple présence, et purge avant redirection', () => {
    const layout = code('src/app/admin/layout.tsx')
    expect(layout).toMatch(/hasValidSession\(\)/)
    expect(layout).toMatch(/clearSession\(\)|endSession\(/)
    expect(layout).not.toMatch(/localStorage/)
  })
})
