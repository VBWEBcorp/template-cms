import { NextResponse } from 'next/server'

import { isAdminRequest } from '@/lib/auth'
import { pickEditable, revalidateBlog, slugifyPost } from '@/lib/blog-admin'
import { visiblePostFilter } from '@/lib/blog-filters'
import { connectDB } from '@/lib/db'
import { submitIndexNow } from '@/lib/indexnow'
import { notifyNewPost } from '@/lib/notify-subscribers'
import { BlogPost } from '@/models/Blog'

/**
 * Liste des articles. Public : articles en ligne seulement. Admin : TOUS les
 * articles, brouillons et articles programmés compris (sinon un article daté
 * dans le futur disparaîtrait de l'admin jusqu'à sa date).
 */
export async function GET(request: Request) {
  try {
    const admin = await isAdminRequest(request)
    await connectDB()
    const posts = await BlogPost.find(admin ? {} : visiblePostFilter())
      .sort({ publishedAt: -1, createdAt: -1 })
      .select(admin ? '-markdown -jsonLd' : '-markdown -jsonLd -content')
      .lean()
    return NextResponse.json(posts, {
      headers: { 'Cache-Control': admin ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('[blog posts GET]', error)
    return NextResponse.json({ error: 'Base de données injoignable' }, { status: 503 })
  }
}

/** Création d'un article (admin). */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })

  try {
    const body = pickEditable((await request.json()) as Record<string, unknown>)
    if (typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ error: 'Le titre est obligatoire' }, { status: 400 })
    }

    await connectDB()
    let slug = (typeof body.slug === 'string' && body.slug) || slugifyPost(body.title)
    if (await BlogPost.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`
    if (body.published && !body.publishedAt) body.publishedAt = new Date()

    const post = await BlogPost.create({ ...body, slug })
    await notifyNewPost(post, false)
    revalidateBlog()
    if (post.published) await submitIndexNow([`/blog/${post.slug}`, '/blog'])

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('[blog posts POST]', error)
    return NextResponse.json({ error: 'Création impossible' }, { status: 500 })
  }
}
