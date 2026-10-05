import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { GalleryImage } from '@/models/Gallery'
import { isAdminRequest, verifyAuth } from '@/lib/auth'

// Images de la galerie : visibles seulement pour le public, toutes pour l'admin.
export async function GET(request: NextRequest) {
  try {
    const admin = await isAdminRequest(request)
    await connectDB()
    const images = await GalleryImage.find(admin ? {} : { active: true })
      .sort({ order: 1 })
      .lean()
    return NextResponse.json(images, {
      headers: {
        'Cache-Control': admin ? 'no-store' : 'public, max-age=0, s-maxage=10, stale-while-revalidate=20',
      },
    })
  } catch (error) {
    console.error('Gallery images error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST create gallery image (admin only)
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    await connectDB()
    const { title, description, imageUrl, category, order } = await request.json()

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and imageUrl are required' },
        { status: 400 }
      )
    }

    const image = await GalleryImage.create({
      title,
      description,
      imageUrl,
      category: category || 'general',
      order: order || 0,
    })

    // Pages statiques régénérées : la modification est visible tout de suite.
    revalidatePath('/', 'layout')
    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Gallery image creation error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
