import { randomBytes } from 'node:crypto'

import { NextResponse } from 'next/server'

import { isPageId } from '@/content/pages'
import { isAdminRequest } from '@/lib/auth'
import { connectDB, isDbConfigured } from '@/lib/db'
import { ContentDraft } from '@/models/ContentDraft'

type Params = Promise<{ pageId: string }>

/**
 * Brouillon pour l'aperçu en direct de l'admin : le contenu en cours d'édition
 * est déposé ici, puis l'aperçu (/apercu/[pageId]?brouillon=...) le rend avec
 * les VRAIS composants du site. Rien n'est publié.
 */
export async function POST(request: Request, { params }: { params: Params }) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
  }
  const { pageId } = await params
  if (!isPageId(pageId)) return NextResponse.json({ error: 'Page inconnue' }, { status: 404 })
  if (!isDbConfigured()) return NextResponse.json({ error: 'Base de données non configurée' }, { status: 503 })

  let content: unknown
  try {
    ;({ content } = (await request.json()) as { content?: unknown })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  try {
    await connectDB()
    const key = randomBytes(16).toString('hex')
    await ContentDraft.create({ key, pageId, content: content && typeof content === 'object' ? content : {} })
    return NextResponse.json({ key }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[brouillon]', error)
    return NextResponse.json({ error: 'Aperçu indisponible : base de données injoignable' }, { status: 503 })
  }
}
