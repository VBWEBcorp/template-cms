import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Subscriber } from '@/models/Newsletter'
import { verifyAuth } from '@/lib/auth'
import { Types } from 'mongoose'

type Params = Promise<{ id: string }>

// DELETE : retirer un abonné (admin uniquement)
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const sub = await Subscriber.findByIdAndDelete(id)
    if (!sub) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Subscriber deleted' })
  } catch (error) {
    console.error('Newsletter delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
