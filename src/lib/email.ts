import 'server-only'

import crypto from 'node:crypto'

import { siteConfig } from '@/config/site'
import { resolveSender } from '@/lib/sender'

const API_KEY = process.env.RESEND_API_KEY
const SITE_URL = siteConfig.url
const UNSUB_SECRET = process.env.JWT_SECRET || 'secret-de-developpement-uniquement'

// Expéditeur unique de tous les envois (formulaire, newsletter, annonces).
// EMAIL_FROM : « Nom <contact@domaine-du-client.fr> », domaine validé dans Resend.
const sender = resolveSender({
  configured: process.env.EMAIL_FROM || process.env.NEWSLETTER_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL,
  siteName: siteConfig.name,
  siteUrl: siteConfig.url,
})
if (sender.warning && API_KEY) console.warn('[email]', sender.warning)
const FROM = sender.from

/** Vrai si l'envoi d'e-mails est configuré (clé Resend présente). */
export const emailEnabled = Boolean(API_KEY)

// ── Désinscription : jeton signé (HMAC) pour ne pas exposer une désinscription
//    arbitraire d'un e-mail tiers, sans avoir à stocker un token par abonné. ──
export function unsubscribeToken(email: string): string {
  return crypto.createHmac('sha256', UNSUB_SECRET).update(email.toLowerCase()).digest('hex').slice(0, 32)
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = unsubscribeToken(email)
  if (token.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

function unsubscribeUrl(email: string): string {
  return `${SITE_URL}/api/newsletter/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface SendArgs {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
}

/**
 * Envoi d'un e-mail via l'API REST de Resend, sans dépendance npm.
 * - Retourne { sent: false } si l'envoi n'est pas configuré (pas de clé / expéditeur).
 * - Lève une erreur en cas d'échec réseau ou réponse non-2xx (à attraper par l'appelant).
 */
export async function sendEmail({ to, subject, html, text, replyTo }: SendArgs): Promise<{ sent: boolean }> {
  if (!emailEnabled) return { sent: false }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend ${res.status}: ${detail}`)
  }
  return { sent: true }
}

/** Mail de bienvenue (en français) envoyé au nouvel abonné à la newsletter. */
export async function sendNewsletterWelcome(to: string): Promise<{ sent: boolean }> {
  const brand = siteConfig.name
  const subject = `Bienvenue dans la newsletter de ${brand}`

  const text =
    `Bonjour,\n\n` +
    `Merci de votre inscription à la newsletter de ${brand} !\n` +
    `Vous recevrez désormais nos actualités, conseils et nouveautés directement par e-mail.\n\n` +
    `À très bientôt,\nL'équipe ${brand}\n\n` +
    `-- \n` +
    `Vous recevez cet e-mail car cette adresse a été inscrite sur ${siteConfig.url}. ` +
    `Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.`

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr><td style="padding:32px 32px 8px;">
            <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#18181b;">Bienvenue ! 🎉</h1>
            <p style="margin:0;color:#71717a;font-size:13px;">Newsletter de ${brand}</p>
          </td></tr>
          <tr><td style="padding:16px 32px 8px;font-size:15px;line-height:1.6;color:#3f3f46;">
            <p style="margin:0 0 12px;">Bonjour,</p>
            <p style="margin:0 0 12px;">Merci de votre inscription à la newsletter de <strong>${brand}</strong> !</p>
            <p style="margin:0 0 12px;">Vous recevrez désormais nos actualités, conseils et nouveautés directement dans votre boîte mail.</p>
            <p style="margin:0 0 4px;">À très bientôt,</p>
            <p style="margin:0;">L'équipe ${brand}</p>
          </td></tr>
          <tr><td style="padding:16px 32px 28px;">
            <a href="${siteConfig.url}" style="display:inline-block;background:${siteConfig.theme.themeColor};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:10px;">Visiter le site</a>
          </td></tr>
          <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:11px;line-height:1.5;color:#a1a1aa;">
            Vous recevez cet e-mail car cette adresse a été inscrite sur ${siteConfig.url}.
            Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

  return sendEmail({ to, subject, html, text })
}

/** Construit le HTML/texte d'un e-mail de campagne (avec lien de désinscription). */
function buildCampaignEmail(subject: string, message: string, unsubUrl: string): { html: string; text: string } {
  const brand = siteConfig.name
  // Texte saisi par l'admin -> paragraphes ; on échappe le HTML par sécurité.
  const paragraphs = message
    .trim()
    .split(/\n{2,}/)
    .map((p) => escapeHtml(p).replace(/\n/g, '<br>'))
  const bodyHtml = paragraphs.map((p) => `<p style="margin:0 0 14px;">${p}</p>`).join('')

  const text =
    `${message}\n\n-- \n${brand}\n` +
    `Se désinscrire : ${unsubUrl}`

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr><td style="padding:28px 32px 4px;">
            <p style="margin:0;color:#71717a;font-size:13px;font-weight:600;">${escapeHtml(brand)}</p>
          </td></tr>
          <tr><td style="padding:8px 32px 8px;font-size:15px;line-height:1.6;color:#3f3f46;">
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:20px 32px 28px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:11px;line-height:1.6;color:#a1a1aa;">
            Vous recevez cet e-mail car vous êtes inscrit à la newsletter de ${escapeHtml(brand)}.
            <a href="${unsubUrl}" style="color:#71717a;text-decoration:underline;">Se désinscrire</a>.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

  return { html, text }
}

/**
 * Envoie une campagne à une liste d'e-mails via l'API batch de Resend (100 max
 * par requête, lien de désinscription personnalisé par destinataire).
 * Ne lève pas : renvoie le décompte envoyés/échecs.
 */
export async function sendCampaign(
  recipients: string[],
  subject: string,
  message: string
): Promise<{ sent: number; failed: number; total: number; configured: boolean }> {
  const total = recipients.length
  if (!emailEnabled) return { sent: 0, failed: total, total, configured: false }

  let sent = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100)
    const payload = chunk.map((email) => {
      const { html, text } = buildCampaignEmail(subject, message, unsubscribeUrl(email))
      return { from: FROM, to: email, subject, html, text }
    })

    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        sent += chunk.length
      } else {
        failed += chunk.length
        console.error('Resend batch error:', res.status, await res.text().catch(() => ''))
      }
    } catch (err) {
      failed += chunk.length
      console.error('Resend batch exception:', err)
    }
  }

  return { sent, failed, total, configured: true }
}

export interface BlogNotice {
  title: string
  excerpt?: string
  slug: string
  coverImage?: string
}

/** Construit l'e-mail d'annonce d'un nouvel article (avec lien de désinscription). */
function buildBlogEmail(post: BlogNotice, unsubUrl: string): { subject: string; html: string; text: string } {
  const brand = siteConfig.name
  const articleUrl = `${SITE_URL}/blog/${post.slug}`
  // Les images locales (/uploads/…) doivent être en URL absolue pour les clients mail
  const cover = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `${SITE_URL}${post.coverImage}`
    : ''
  const subject = `Nouvel article : ${post.title}`

  const text =
    `${post.title}\n\n` +
    (post.excerpt ? `${post.excerpt}\n\n` : '') +
    `Lire l'article : ${articleUrl}\n\n-- \n${brand}\n` +
    `Se désinscrire : ${unsubUrl}`

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
          ${cover ? `<tr><td><img src="${cover}" alt="" width="560" style="display:block;width:100%;max-height:260px;object-fit:cover;" /></td></tr>` : ''}
          <tr><td style="padding:28px 32px 4px;">
            <p style="margin:0 0 6px;color:${siteConfig.theme.themeColor};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Nouvel article</p>
            <h1 style="margin:0;font-size:21px;font-weight:700;line-height:1.3;">${escapeHtml(post.title)}</h1>
          </td></tr>
          ${post.excerpt ? `<tr><td style="padding:12px 32px 4px;font-size:15px;line-height:1.6;color:#3f3f46;"><p style="margin:0;">${escapeHtml(post.excerpt)}</p></td></tr>` : ''}
          <tr><td style="padding:20px 32px 28px;">
            <a href="${articleUrl}" style="display:inline-block;background:${siteConfig.theme.themeColor};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;border-radius:10px;">Lire l'article</a>
          </td></tr>
          <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:11px;line-height:1.6;color:#a1a1aa;">
            Vous recevez cet e-mail car vous êtes inscrit à la newsletter de ${escapeHtml(brand)}.
            <a href="${unsubUrl}" style="color:#71717a;text-decoration:underline;">Se désinscrire</a>.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`

  return { subject, html, text }
}

/**
 * Annonce un nouvel article à une liste d'abonnés via l'API batch de Resend.
 * Ne lève pas : renvoie le décompte envoyés/échecs.
 */
export async function sendBlogNotification(
  recipients: string[],
  post: BlogNotice
): Promise<{ sent: number; failed: number; total: number; configured: boolean }> {
  const total = recipients.length
  if (!emailEnabled) return { sent: 0, failed: total, total, configured: false }

  let sent = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100)
    const payload = chunk.map((email) => {
      const { subject, html, text } = buildBlogEmail(post, unsubscribeUrl(email))
      return { from: FROM, to: email, subject, html, text }
    })

    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        sent += chunk.length
      } else {
        failed += chunk.length
        console.error('Resend batch error (blog):', res.status, await res.text().catch(() => ''))
      }
    } catch (err) {
      failed += chunk.length
      console.error('Resend batch exception (blog):', err)
    }
  }

  return { sent, failed, total, configured: true }
}
