import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Subscriber } from '@/models/Newsletter'
import { verifyUnsubscribeToken } from '@/lib/email'
import { siteConfig } from '@/config/site'

function htmlPage(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <div style="max-width:480px;margin:64px auto;padding:0 16px;text-align:center;">
      <div style="background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:40px 32px;">
        <h1 style="margin:0 0 12px;font-size:22px;">${title}</h1>
        <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">${body}</p>
        <a href="${siteConfig.url}" style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:10px;">Retour au site</a>
      </div>
    </div>
  </body>
</html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}

// GET — désinscription via lien signé présent dans les e-mails de campagne (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = (searchParams.get('e') || '').trim().toLowerCase()
    const token = searchParams.get('t') || ''

    if (!email || !token || !verifyUnsubscribeToken(email, token)) {
      return htmlPage(
        'Lien invalide',
        'Ce lien de désinscription est invalide. Vous pouvez nous contacter directement si besoin.',
        400
      )
    }

    await connectDB()
    await Subscriber.updateOne({ email }, { status: 'unsubscribed' })

    return htmlPage(
      'Désinscription confirmée',
      `L'adresse <strong>${email}</strong> ne recevra plus nos e-mails. Vous pouvez vous réinscrire à tout moment depuis le site.`
    )
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return htmlPage('Une erreur est survenue', 'Veuillez réessayer plus tard.', 500)
  }
}
