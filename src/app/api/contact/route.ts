import { NextResponse } from 'next/server'

import { siteConfig } from '@/config/site'
import { getSiteInfo } from '@/lib/content'
import { emailEnabled, sendEmail } from '@/lib/email'

/**
 * Formulaire de contact : notification au propriétaire du site (le visiteur en
 * reply_to, il suffit de répondre), puis accusé de réception au visiteur.
 *
 * Variables : RESEND_API_KEY, EMAIL_FROM (adresse du domaine validé dans
 * Resend), CONTACT_TO (destinataires, séparés par des virgules ; à défaut,
 * l'e-mail de contact du site). Voir src/lib/sender.ts pour le garde-fou
 * contre l'adresse bac à sable de Resend.
 */

export const runtime = 'nodejs'

type Payload = {
  firstname?: unknown
  lastname?: unknown
  name?: unknown
  email?: unknown
  phone?: unknown
  message?: unknown
  /** Pot de miel : champ invisible, rempli uniquement par les robots. */
  company?: unknown
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)

// Limite simple par adresse IP (par instance) : 5 envois par tranche de 10 minutes.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function tooManyRequests(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
}

export async function POST(req: Request) {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  // Un robot a rempli le champ caché : réponse positive, rien n'est envoyé.
  if (clean(body.company, 200)) return NextResponse.json({ ok: true })

  const firstname = clean(body.firstname, 100)
  const lastname = clean(body.lastname, 100)
  const name = clean(body.name, 200) || [firstname, lastname].filter(Boolean).join(' ')
  const email = clean(body.email, 200).toLowerCase()
  const phone = clean(body.phone, 40)
  const message = clean(body.message, 5000)

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Indiquez votre nom.'
  if (!isEmail(email)) errors.email = 'Adresse e-mail invalide.'
  if (phone && phone.replace(/\D/g, '').length < 9) errors.phone = 'Numéro de téléphone incomplet.'
  if (message.length < 10) errors.message = 'Décrivez votre demande en quelques mots (10 caractères minimum).'
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Formulaire incomplet', errors }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnue'
  if (tooManyRequests(ip)) {
    return NextResponse.json({ error: 'Trop de messages envoyés. Réessayez dans quelques minutes.' }, { status: 429 })
  }

  if (!emailEnabled) {
    console.error('[contact] RESEND_API_KEY absente : le message ne peut pas être transmis')
    return NextResponse.json(
      { error: 'Envoi indisponible pour le moment. Écrivez-nous directement par e-mail.' },
      { status: 503 }
    )
  }

  const info = await getSiteInfo().catch(() => null)
  const recipients = (process.env.CONTACT_TO || info?.email || siteConfig.contact.email)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const fields: Array<[string, string]> = (
    [
      ['Nom', name],
      ['E-mail', email],
      ['Téléphone', phone],
    ] as Array<[string, string]>
  ).filter(([, v]) => Boolean(v))

  const text = [...fields.map(([k, v]) => `${k} : ${v}`), '', message].join('\n')
  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <p style="margin:0 0 12px"><strong>Nouveau message depuis ${escapeHtml(siteConfig.url)}</strong></p>
      <table style="border-collapse:collapse">
        ${fields
          .map(
            ([k, v]) =>
              `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td><td style="padding:2px 0">${
                k === 'E-mail' ? `<a href="mailto:${escapeHtml(v)}">${escapeHtml(v)}</a>` : escapeHtml(v)
              }</td></tr>`
          )
          .join('')}
      </table>
      <p style="margin:16px 0 0;white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>`

  try {
    await sendEmail({
      to: recipients,
      replyTo: email,
      subject: `Contact : ${name}`,
      text,
      html,
    })
  } catch (err) {
    console.error('[contact] notification', err)
    return NextResponse.json({ error: 'Envoi impossible pour le moment. Réessayez dans un instant.' }, { status: 502 })
  }

  // Accusé de réception : son échec ne fait pas échouer la demande, déjà transmise.
  sendEmail({
    to: [email],
    subject: `Bien reçu : ${siteConfig.name} vous répond rapidement`,
    text:
      `Bonjour ${firstname || name},\n\n` +
      `Nous avons bien reçu votre message et nous vous répondons sous 48 heures ouvrées.\n\n` +
      `Pour mémoire, votre message :\n${message}\n\n` +
      `${siteConfig.name}\n${siteConfig.url}`,
    html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <p>Bonjour ${escapeHtml(firstname || name)},</p>
      <p>Nous avons bien reçu votre message et nous vous répondons sous 48 heures ouvrées.</p>
      <p style="color:#666;margin-top:20px">Pour mémoire, votre message :</p>
      <blockquote style="margin:0;padding:8px 14px;border-left:3px solid #ddd;color:#444;white-space:pre-wrap">${escapeHtml(message)}</blockquote>
      <p style="margin-top:20px">${escapeHtml(siteConfig.name)}<br><a href="${siteConfig.url}">${escapeHtml(siteConfig.url)}</a></p>
    </div>`,
  }).catch((err) => console.error('[contact] accusé de réception', err))

  return NextResponse.json({ ok: true })
}
