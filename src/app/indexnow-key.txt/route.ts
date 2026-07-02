import { NextResponse } from 'next/server'

// Sert la clé IndexNow en texte brut sur /indexnow-key.txt (référencée par keyLocation).
// 404 si aucune clé configurée (fonctionnalité désactivée).
export function GET() {
  const key = process.env.INDEXNOW_KEY
  if (!key) {
    return new NextResponse('Not found', { status: 404 })
  }
  return new NextResponse(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
