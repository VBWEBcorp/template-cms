/**
 * Adresse d'expédition des e-mails (Resend).
 *
 * Garde-fou contre le piège du bac à sable : `onboarding@resend.dev` (ou toute
 * adresse en resend.dev) n'écrit qu'au titulaire du compte Resend. Le
 * propriétaire du site reçoit donc ses notifications, tout semble marcher, et
 * AUCUN visiteur ne reçoit jamais rien, sans le moindre message d'erreur.
 * Une telle adresse est donc refusée et remplacée par contact@<domaine du site>,
 * avec un avertissement dans les journaux.
 */

/** Domaine du site sans www, déduit de son adresse publique. */
export function siteDomain(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Extrait l'adresse d'un « Nom <adresse@domaine> » ou d'une adresse nue. */
export function extractAddress(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return (match ? match[1] : from).trim().toLowerCase()
}

export type SenderResolution = { from: string; warning?: string }

export function resolveSender(options: {
  configured?: string
  siteName: string
  siteUrl: string
}): SenderResolution {
  const domain = siteDomain(options.siteUrl)
  const fallback = `${options.siteName} <contact@${domain || 'example.com'}>`
  const configured = (options.configured ?? '').trim()

  if (!configured) {
    return { from: fallback }
  }

  if (extractAddress(configured).endsWith('@resend.dev')) {
    return {
      from: fallback,
      warning:
        `Adresse d'expédition « ${configured} » refusée : resend.dev est le bac à sable de Resend, ` +
        `qui n'écrit qu'au titulaire du compte (les visiteurs ne reçoivent rien). ` +
        `Envoi depuis « ${fallback} » : vérifiez que ce domaine est validé dans Resend.`,
    }
  }

  return { from: configured }
}
