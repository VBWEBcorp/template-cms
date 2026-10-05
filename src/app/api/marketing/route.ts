import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { isAdminRequest } from '@/lib/auth'
import { connectDB, isDbConfigured } from '@/lib/db'
import { DEFAULT_MARKETING, normalizeMarketing } from '@/lib/marketing'
import { MarketingPopup } from '@/models/Marketing'

/** Réglages marketing (popup + bandeau). Le site les lit côté serveur ; cette route sert l'admin. */
export async function GET() {
  if (!isDbConfigured()) return NextResponse.json(DEFAULT_MARKETING)
  try {
    await connectDB()
    const doc = await MarketingPopup.findOne().lean()
    return NextResponse.json(doc ? normalizeMarketing(doc) : DEFAULT_MARKETING, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('[marketing GET]', error)
    return NextResponse.json({ error: 'Base de données injoignable' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'Base de données non configurée : impossible d’enregistrer.' }, { status: 503 })
  }
  try {
    const settings = normalizeMarketing(await request.json())
    await connectDB()
    await MarketingPopup.findOneAndUpdate({}, settings, { upsert: true, new: true })
    // Le bandeau et la popup sont rendus avec les pages : on les régénère toutes.
    revalidatePath('/', 'layout')
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[marketing PUT]', error)
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }
}
