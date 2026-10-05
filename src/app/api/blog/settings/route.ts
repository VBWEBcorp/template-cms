import { NextResponse } from 'next/server'

import { isAdminRequest } from '@/lib/auth'
import { revalidateBlog } from '@/lib/blog-admin'
import { BLOG_SETTINGS_DEFAULTS } from '@/lib/blog-defaults'
import { connectDB, isDbConfigured } from '@/lib/db'
import { BlogSettings } from '@/models/Blog'

const FIELDS = ['enabled', 'title', 'description', 'eyebrow', 'heroImage', 'categories'] as const

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json(BLOG_SETTINGS_DEFAULTS)
  try {
    await connectDB()
    const settings = await BlogSettings.findOne().lean()
    return NextResponse.json(settings ?? BLOG_SETTINGS_DEFAULTS, {
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=20' },
    })
  } catch (error) {
    console.error('[blog settings GET]', error)
    return NextResponse.json({ error: 'Base de données injoignable' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
  try {
    const body = (await request.json()) as Record<string, unknown>
    const update: Record<string, unknown> = {}
    for (const key of FIELDS) if (key in body) update[key] = body[key]

    await connectDB()
    const settings = await BlogSettings.findOneAndUpdate({}, update, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
    revalidateBlog()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[blog settings PUT]', error)
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }
}
