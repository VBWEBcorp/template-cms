import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { BlogPost } from '@/models/Blog'
import { verifyAuth } from '@/lib/auth'
import { visiblePostFilter } from '@/lib/blog-filters'

type Params = Promise<{ slug: string }>

// GET single post by slug
// Admin sees own drafts + visible posts. Posts with future publishedAt are
// hidden everywhere — even admin gets a 404 here, so they cannot be edited
// or deleted via the CMS (only via direct DB access).
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { slug } = await params
    await connectDB()

    const { authenticated, user } = await verifyAuth(request)
    const isAdmin = authenticated && user?.role === 'admin'
    const filter = isAdmin
      ? { slug, $or: [visiblePostFilter(), { published: false }] }
      : { slug, ...visiblePostFilter() }

    const post = await BlogPost.findOne(filter)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Blog post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update post (admin only)
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    await connectDB()

    const body = await request.json()

    if (body.published && !body.publishedAt) {
      body.publishedAt = new Date()
    }

    const editableFilter = {
      slug,
      $or: [visiblePostFilter(), { published: false }],
    }
    const post = await BlogPost.findOneAndUpdate(editableFilter, body, {
      new: true,
      runValidators: true,
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Blog post update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE post (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    await connectDB()

    const post = await BlogPost.findOneAndDelete({
      slug,
      $or: [visiblePostFilter(), { published: false }],
    })
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Post deleted' })
  } catch (error) {
    console.error('Blog post delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
