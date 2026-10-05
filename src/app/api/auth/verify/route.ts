import { NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  const { authenticated, user } = await verifyAuth(request)
  if (!authenticated) {
    return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
  }
  return NextResponse.json({ user })
}
