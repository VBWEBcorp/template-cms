import { createHash, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

import { generateToken } from '@/lib/auth'
import { connectDB, isDbConfigured } from '@/lib/db'
import User from '@/models/User'

/**
 * Connexion à l'espace admin.
 *
 * Deux sources de comptes, dans cet ordre :
 * 1. ADMIN_EMAIL + ADMIN_PASSWORD (variables d'environnement) : le compte du
 *    client, sans base de données. C'est le mode courant sur le parc.
 * 2. Les comptes `admin` de la collection users (scripts/create-admin.js).
 *
 * Attention : une connexion réussie ne prouve pas que la base fonctionne
 * (le compte 1 n'en a pas besoin). Voir README, section dépannage.
 */

function sameSecret(a: string, b: string): boolean {
  // Empreintes de même longueur : comparaison à temps constant sans fuite de longueur.
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export async function POST(request: Request) {
  let email = ''
  let password = ''
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown }
    email = String(body.email ?? '').trim().toLowerCase()
    password = String(body.password ?? '')
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  }

  const envEmail = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
  const envPassword = process.env.ADMIN_PASSWORD ?? ''

  if (envEmail && envPassword && email === envEmail) {
    if (!sameSecret(password, envPassword)) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }
    const user = { id: 'admin', email: envEmail, name: process.env.ADMIN_NAME ?? '', role: 'admin' }
    return NextResponse.json({ token: generateToken({ userId: 'admin', email: envEmail, role: 'admin' }), user })
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: 'Aucun compte admin configuré (ADMIN_EMAIL et ADMIN_PASSWORD manquants).' },
      { status: 401 }
    )
  }

  try {
    await connectDB()
    const user = await User.findOne({ email }).select('+password')
    if (!user || user.role !== 'admin' || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email, role: user.role })
    return NextResponse.json({
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
    })
  } catch (error) {
    console.error('[auth/login]', error)
    return NextResponse.json({ error: 'Base de données injoignable' }, { status: 503 })
  }
}
