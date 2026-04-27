import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { BlogSettings } from '@/models/Blog'
import { verifyAuth } from '@/lib/auth'

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=600',
}

export async function GET() {
  try {
    await connectDB()
    const settings = await BlogSettings.findOne().lean()
    if (!settings) {
      return NextResponse.json(
        { enabled: true, title: 'Nos dernières actualités', eyebrow: 'Blog', description: 'Retrouvez nos conseils, nos projets récents et les tendances du secteur.' },
        { headers: CACHE_HEADERS }
      )
    }
    return NextResponse.json(settings, { headers: CACHE_HEADERS })
  } catch (error) {
    console.error('Blog settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    let settings = await BlogSettings.findOne()
    if (!settings) {
      settings = await BlogSettings.create(body)
    } else {
      const fields = ['enabled', 'title', 'description', 'eyebrow', 'heroImage', 'categories']
      for (const field of fields) {
        if (body[field] !== undefined) (settings as any)[field] = body[field]
      }
      await settings.save()
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Blog settings update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
