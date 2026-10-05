import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { isPageId, pageDefaults } from '@/content/pages'
import { isAdminRequest } from '@/lib/auth'
import { connectDB, isDbConfigured } from '@/lib/db'
import { diffFromDefaults } from '@/lib/merge'
import SiteContent from '@/models/SiteContent'

type Params = Promise<{ pageId: string }>

/**
 * Cache court : le client qui modifie sa page doit voir le résultat tout de
 * suite. Jamais plus de 10 s en CDN (sinon « j'ai enregistré et rien ne change »).
 */
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=20' }

/** Écarts enregistrés pour une page (les valeurs par défaut sont dans src/content/pages.ts). */
export async function GET(_request: Request, { params }: { params: Params }) {
  const { pageId } = await params
  if (!isPageId(pageId)) return NextResponse.json({ error: 'Page inconnue' }, { status: 404 })
  if (!isDbConfigured()) return NextResponse.json({ pageId, content: {}, database: false }, { headers: CACHE_HEADERS })

  try {
    await connectDB()
    const page = (await SiteContent.findOne({ pageId }).lean()) as { content?: unknown; updatedAt?: Date } | null
    return NextResponse.json(
      { pageId, content: page?.content ?? {}, updatedAt: page?.updatedAt ?? null },
      { headers: CACHE_HEADERS }
    )
  } catch (error) {
    console.error('[content GET]', error)
    return NextResponse.json({ error: 'Base de données injoignable' }, { status: 503 })
  }
}

/** Enregistre le contenu d'une page (admin). Seuls les écarts aux valeurs par défaut sont stockés. */
export async function PUT(request: Request, { params }: { params: Params }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
  }
  const { pageId } = await params
  if (!isPageId(pageId)) return NextResponse.json({ error: 'Page inconnue' }, { status: 404 })
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Base de données non configurée : impossible d’enregistrer.' }, { status: 503 })
  }

  let content: unknown
  try {
    ;({ content } = (await request.json()) as { content?: unknown })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  if (!content || typeof content !== 'object') {
    return NextResponse.json({ error: 'Contenu manquant' }, { status: 400 })
  }

  try {
    await connectDB()
    const diff = (diffFromDefaults(pageDefaults[pageId], content) ?? {}) as Record<string, unknown>
    const page = await SiteContent.findOneAndUpdate(
      { pageId },
      { pageId, content: diff },
      { upsert: true, returnDocument: 'after' }
    ).lean()

    // Toutes les pages : les coordonnées (Contact) apparaissent aussi dans le
    // pied de page et le JSON-LD de chaque page.
    revalidatePath('/', 'layout')

    return NextResponse.json({ pageId, content: page?.content ?? diff, updatedAt: page?.updatedAt })
  } catch (error) {
    console.error('[content PUT]', error)
    return NextResponse.json({ error: 'Enregistrement impossible : base de données injoignable' }, { status: 503 })
  }
}
