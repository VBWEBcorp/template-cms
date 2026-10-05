import 'server-only'

import mongoose from 'mongoose'

/**
 * Connexion MongoDB partagée (une seule par processus, réutilisée entre requêtes).
 *
 * Sans MONGODB_URI, le site tourne sans base : les pages affichent les valeurs
 * par défaut du code et l'admin signale que rien ne peut être enregistré. Il n'y
 * a volontairement AUCUNE base par défaut : se connecter par erreur à une base
 * partagée depuis un poste de développement est le vrai danger.
 */

const MONGODB_URI = process.env.MONGODB_URI ?? ''

export function isDbConfigured(): boolean {
  return MONGODB_URI.length > 0
}

export class DbNotConfiguredError extends Error {
  constructor() {
    super('Base de données non configurée (MONGODB_URI absent)')
    this.name = 'DbNotConfiguredError'
  }
}

type Cache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  /** Horodatage du dernier échec : évite de réessayer à chaque page d'un build. */
  failedAt: number
}

declare global {
  var __mongoose: Cache | undefined
}

const cache: Cache = (globalThis.__mongoose ??= { conn: null, promise: null, failedAt: 0 })

/** Délai avant de retenter une connexion qui vient d'échouer. */
const RETRY_AFTER_MS = 15_000

export async function connectDB(): Promise<typeof mongoose> {
  if (!isDbConfigured()) throw new DbNotConfiguredError()
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    if (cache.failedAt && Date.now() - cache.failedAt < RETRY_AFTER_MS) {
      throw new Error('Base de données injoignable (nouvel essai dans quelques secondes)')
    }
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 15000,
      maxPoolSize: 10,
    })
  }

  try {
    cache.conn = await cache.promise
    cache.failedAt = 0
  } catch (error) {
    cache.promise = null
    cache.failedAt = Date.now()
    throw error
  }
  return cache.conn
}

/**
 * Lecture tolérante : renvoie `fallback` quand la base n'est pas configurée.
 *
 * Quand la base EST configurée mais ne répond pas, l'erreur remonte : pendant
 * une régénération de page (ISR), Next garde alors la version précédente au
 * lieu de mettre en cache une page remplie des valeurs par défaut. Pendant le
 * build seulement, on retombe sur `fallback` pour ne pas bloquer le déploiement.
 */
export async function withDb<T>(read: () => Promise<T>, fallback: T, label: string): Promise<T> {
  if (!isDbConfigured()) return fallback
  try {
    await connectDB()
    return await read()
  } catch (error) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`[db] ${label} : base injoignable pendant le build, valeurs par défaut utilisées`)
      return fallback
    }
    console.error(`[db] ${label} :`, error instanceof Error ? error.message : error)
    throw error
  }
}
