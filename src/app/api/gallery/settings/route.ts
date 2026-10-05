import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { GallerySettings } from '@/models/Gallery'
import { verifyAuth } from '@/lib/auth'

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=20',
}

// GET gallery settings (public)
export async function GET() {
  try {
    await connectDB()
    const settings = await GallerySettings.findOne().lean()

    if (!settings) {
      return NextResponse.json(
        { enabled: true, title: 'Nos réalisations', eyebrow: 'Galerie', description: 'Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire.' },
        { headers: CACHE_HEADERS }
      )
    }

    return NextResponse.json(settings, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error('Gallery settings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// UPDATE gallery settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    let settings = await GallerySettings.findOne()
    if (!settings) {
      settings = await GallerySettings.create(body)
    } else {
      const fields = ['enabled', 'title', 'description', 'eyebrow', 'heroImage']
      for (const field of fields) {
        if (body[field] !== undefined) settings.set(field, body[field])
      }
      await settings.save()
    }

    // Pages statiques régénérées : la modification est visible tout de suite.
    revalidatePath('/', 'layout')
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Gallery settings update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
