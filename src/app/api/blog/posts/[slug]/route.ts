import { NextResponse } from 'next/server'

import { isAdminRequest } from '@/lib/auth'
import { pickEditable, revalidateBlog } from '@/lib/blog-admin'
import { visiblePostFilter } from '@/lib/blog-filters'
import { connectDB } from '@/lib/db'
import { submitIndexNow } from '@/lib/indexnow'
import { notifyNewPost } from '@/lib/notify-subscribers'
import { BlogPost } from '@/models/Blog'

type Params = Promise<{ slug: string }>

/** Un article. Public : seulement s'il est en ligne. Admin : quel que soit son état. */
export async function GET(request: Request, { params }: { params: Params }) {
  const { slug } = await params
  try {
    const admin = await isAdminRequest(request)
    await connectDB()
    const post = await BlogPost.findOne(admin ? { slug } : { slug, ...visiblePostFilter() }).lean()
    if (!post) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    return NextResponse.json(post, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[blog post GET]', error)
    return NextResponse.json({ error: 'Base de données injoignable' }, { status: 503 })
  }
}

/** Mise à jour (admin). Le slug de l'URL est l'adresse actuelle ; le corps peut en proposer une nouvelle. */
export async function PUT(request: Request, { params }: { params: Params }) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
  const { slug } = await params

  try {
    const body = pickEditable((await request.json()) as Record<string, unknown>)
    await connectDB()

    const before = await BlogPost.findOne({ slug }).select('published publishedAt').lean<{
      published?: boolean
      publishedAt?: Date
    } | null>()
    if (!before) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })

    if (typeof body.slug === 'string' && body.slug && body.slug !== slug && (await BlogPost.exists({ slug: body.slug }))) {
      return NextResponse.json({ error: `L'adresse « ${body.slug} » est déjà prise par un autre article` }, { status: 409 })
    }
    if (body.published && !body.publishedAt) body.publishedAt = before.publishedAt ?? new Date()

    const post = await BlogPost.findOneAndUpdate({ slug }, body, { new: true, runValidators: true })
    if (!post) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })

    await notifyNewPost(post, before.published === true)
    revalidateBlog()
    if (post.published) await submitIndexNow([`/blog/${post.slug}`, '/blog'])

    return NextResponse.json(post)
  } catch (error) {
    console.error('[blog post PUT]', error)
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }
}

/** Suppression (admin) : l'article répond 404 et sort du sitemap. */
export async function DELETE(request: Request, { params }: { params: Params }) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
  const { slug } = await params
  try {
    await connectDB()
    const post = await BlogPost.findOneAndDelete({ slug })
    if (!post) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    revalidateBlog()
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('[blog post DELETE]', error)
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 })
  }
}
