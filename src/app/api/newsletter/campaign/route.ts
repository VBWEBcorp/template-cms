import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Subscriber } from '@/models/Newsletter'
import { verifyAuth } from '@/lib/auth'
import { sendCampaign, emailEnabled } from '@/lib/email'

// POST : envoie une campagne à tous les abonnés actifs (admin uniquement)
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    if (!emailEnabled) {
      return NextResponse.json(
        { error: "L'envoi d'e-mails n'est pas configuré (clé Resend manquante)." },
        { status: 400 }
      )
    }

    const { subject, message } = await request.json()
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Objet et message sont obligatoires.' }, { status: 400 })
    }

    await connectDB()
    const subs = await Subscriber.find({ status: { $ne: 'unsubscribed' } })
      .select('email')
      .lean()
    const emails = subs.map((s) => s.email)

    if (emails.length === 0) {
      return NextResponse.json({ error: 'Aucun abonné actif à qui envoyer.' }, { status: 400 })
    }

    const result = await sendCampaign(emails, subject.trim(), message)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Newsletter campaign error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
