import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Jetons de session de l'espace admin : JWT HS256 signé avec JWT_SECRET.
 *
 * Écrit avec node:crypto plutôt qu'avec une bibliothèque : signer et vérifier
 * un HS256 tient en quelques lignes, et les jetons restent compatibles avec
 * ceux émis auparavant par jsonwebtoken (même en-tête, mêmes claims).
 */

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Durée de vie d'une session. 30 jours : l'espace sert quelques fois par mois,
 * une expiration courte reconnecte sans cesse. Le navigateur détecte
 * l'expiration (src/lib/admin-session.ts) et renvoie vers la connexion.
 */
const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60

function secret(): string {
  const value = process.env.JWT_SECRET
  if (value) return value
  if (process.env.NODE_ENV === 'production') {
    // Un secret par défaut connu de tous permettrait de forger un jeton admin.
    throw new Error('JWT_SECRET manquant : impossible de signer ou vérifier une session admin.')
  }
  return 'secret-de-developpement-uniquement'
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url')
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS }))
  return `${header}.${body}.${sign(`${header}.${body}`)}`
}

export function verifyToken(token: string): JWTPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, signature] = parts

  try {
    const head = JSON.parse(Buffer.from(header, 'base64url').toString('utf8')) as { alg?: string }
    // Refuser tout autre algorithme (dont « none ») : seul HS256 est émis ici.
    if (head.alg !== 'HS256') return null

    const expected = Buffer.from(sign(`${header}.${body}`))
    const received = Buffer.from(signature)
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as JWTPayload
    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

export async function verifyAuth(request: Request) {
  const token = getTokenFromRequest(request)
  if (!token) return { authenticated: false as const, user: null }

  const payload = verifyToken(token)
  if (!payload) return { authenticated: false as const, user: null }

  return { authenticated: true as const, user: payload }
}

/** Vrai si la requête porte une session admin valable. */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const { authenticated, user } = await verifyAuth(request)
  return authenticated && user?.role === 'admin'
}
