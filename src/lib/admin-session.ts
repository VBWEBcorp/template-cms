'use client'

/**
 * Session de l'espace admin, côté navigateur.
 *
 * Le jeton JWT vit dans localStorage et expire (30 jours). Le piège vécu sur
 * le parc : un jeton EXPIRÉ reste dans localStorage. Tester sa simple présence
 * faisait croire à l'admin qu'il était connecté ; chaque page protégée
 * renvoyait vers /admin/login, qui renvoyait aussitôt au tableau de bord
 * (« un jeton existe »)... Le client tournait en rond sans jamais voir ses
 * données ni le formulaire de connexion.
 *
 * Règles :
 * - une session n'est valable que si le jeton est présent ET non expiré ;
 * - elle est purgée AVANT toute redirection vers la connexion ;
 * - tout appel admin passe par `adminFetch`, qui pose le jeton et traite le 401.
 *   Aucun fetch admin ne fabrique son en-tête Authorization à la main
 *   (vérifié par src/tests/admin-session.test.ts).
 */

const TOKEN_KEY = 'authToken'
const USER_KEY = 'authUser'

/** Un jeton qui expire dans moins de 30 s est déjà considéré comme mort. */
const EXPIRY_MARGIN_MS = 30_000

export type AdminUser = { id?: string; email: string; name?: string; role?: string }

function readStorage(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Date d'expiration lue dans la charge utile du jeton (claim `exp`), en ms.
 * Ce n'est PAS une vérification de signature : le serveur reste seul juge.
 * Cette lecture évite seulement d'afficher une interface « connectée » qui ne
 * pourra rien charger.
 */
export function getTokenExpiry(token: string): number | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded)) as { exp?: unknown }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

/** Vrai si le jeton est bien formé et pas encore expiré. */
export function isTokenValid(token: string | null, now = Date.now()): boolean {
  if (!token) return false
  const expiry = getTokenExpiry(token)
  // Jeton illisible ou sans expiration : on ne s'y fie pas.
  if (expiry === null) return false
  return expiry - EXPIRY_MARGIN_MS > now
}

export function getToken(): string | null {
  return readStorage(TOKEN_KEY)
}

export function getUser(): AdminUser | null {
  const raw = readStorage(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

/** Session utilisable : jeton présent ET non expiré. */
export function hasValidSession(): boolean {
  return isTokenValid(getToken())
}

/** Ouvre la session après une connexion réussie. */
export function startSession(token: string, user: AdminUser): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    // Stockage refusé (navigation privée stricte) : la connexion échouera au prochain appel.
  }
}

/** Efface le jeton et le profil. */
export function clearSession(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
  } catch {
    // rien à faire
  }
}

/**
 * Session morte : purge PUIS retour à la connexion. Sans la purge, le jeton
 * périmé restait en place et /admin/login rebasculait sur le tableau de bord.
 * `replace` : la page inaccessible ne reste pas dans l'historique.
 */
export function endSession(reason: 'expired' | 'logout' = 'expired'): void {
  clearSession()
  if (typeof window === 'undefined') return
  window.location.replace(reason === 'expired' ? '/admin/login?expired=1' : '/admin/login')
}

/** Levée par adminFetch quand la session est morte : l'écran n'a rien à afficher. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Session expirée')
    this.name = 'SessionExpiredError'
  }
}

/**
 * SEUL point de passage des appels admin.
 *
 * - pose le jeton ;
 * - session déjà expirée : purge et redirection sans même appeler le serveur ;
 * - 401 : purge, redirection, et SessionExpiredError levée ;
 * - Content-Type JSON posé seulement pour un corps non FormData (un envoi de
 *   fichier garde la frontière multipart calculée par le navigateur).
 */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  if (!isTokenValid(token)) {
    endSession('expired')
    throw new SessionExpiredError()
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  if (!isFormData && init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(input, { cache: 'no-store', ...init, headers })
  if (res.status === 401) {
    endSession('expired')
    throw new SessionExpiredError()
  }
  return res
}

/**
 * Appel admin qui attend une réponse JSON réussie : toute réponse non 2xx
 * devient une erreur portant le message du serveur. Fini les
 * `if (res.ok) { succès }` sans else, qui affichaient un succès inexistant.
 */
export async function adminJson<T = unknown>(input: string, init: RequestInit = {}): Promise<T> {
  const res = await adminFetch(input, init)
  const data = (await res.json().catch(() => null)) as (T & { error?: string; message?: string }) | null
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Erreur ${res.status}`)
  }
  return data as T
}

/**
 * Message lisible à partir d'une erreur d'appel admin.
 * `null` = session expirée, la redirection est déjà lancée : ne rien afficher.
 */
export function errorMessage(err: unknown): string | null {
  if (err instanceof SessionExpiredError) return null
  if (err instanceof TypeError) return 'Connexion au serveur impossible. Vérifiez votre connexion et réessayez.'
  return err instanceof Error && err.message ? err.message : 'Une erreur est survenue.'
}
