import 'server-only'

import mongoose from 'mongoose'

import { connectDB, isDbConfigured } from '@/lib/db'

/**
 * Fichiers texte servis à la racine du site (llms.txt), tenus à jour par PHARE
 * via l'action `file` de /api/phare/publish.
 *
 * Stockés en base et non dans public/ : en hébergement serverless le disque est
 * en lecture seule, et un fichier statique de public/ masquerait la route qui le
 * sert. La version écrite dans le code reste le repli (src/app/llms.txt/route.ts).
 */

const COLLECTION = 'siteFiles'

export type SiteFile = {
  path: string
  content: string
  contentType: string
  updatedAt: Date
}

/** Liste blanche : la route de PHARE ne doit pas devenir un dépôt de fichiers arbitraires. */
const ALLOWED_PATHS = new Set(['llms.txt'])

export function normalizeSiteFilePath(path: string): string {
  return path.trim().replace(/^\/+/, '').toLowerCase()
}

export function isAllowedSiteFile(path: string): boolean {
  return ALLOWED_PATHS.has(normalizeSiteFilePath(path))
}

async function collection() {
  await connectDB()
  const db = mongoose.connection.db
  if (!db) throw new Error('Connexion à la base de données indisponible')
  return db.collection<SiteFile>(COLLECTION)
}

/** Contenu déposé par PHARE, ou null (rien de déposé, ou pas de base). */
export async function readSiteFile(path: string): Promise<string | null> {
  if (!isDbConfigured()) return null
  const doc = await (await collection()).findOne({ path: normalizeSiteFilePath(path) })
  return doc?.content?.trim() ? doc.content : null
}

/** Dépôt (ou remplacement) d'un fichier. Upsert par chemin. */
export async function writeSiteFile(file: { path: string; content: string; contentType?: string }): Promise<void> {
  await (await collection()).updateOne(
    { path: normalizeSiteFilePath(file.path) },
    {
      $set: {
        content: file.content,
        contentType: file.contentType?.trim() || 'text/plain; charset=utf-8',
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )
}
