import 'server-only'

import { cache } from 'react'

import { siteConfig } from '@/config/site'
import { type PageContent, type PageId, pageDefaults } from '@/content/pages'
import { withDb } from '@/lib/db'
import { deepMerge } from '@/lib/merge'
import SiteContent from '@/models/SiteContent'

/**
 * Contenu d'une page tel que le site doit l'afficher : valeurs par défaut du
 * code (src/content/pages.ts) + écarts enregistrés dans l'admin.
 *
 * Lu côté serveur : le texte est dans le HTML servi (Google le lit sans
 * exécuter de JavaScript). Les pages sont statiques et régénérées dès qu'un
 * contenu est enregistré (revalidatePath dans /api/content/[pageId]).
 */
export const getPageContent = cache(async <P extends PageId>(pageId: P): Promise<PageContent<P>> => {
  const defaults = pageDefaults[pageId] as PageContent<P>
  const stored = await withDb(
    async () => {
      const doc = (await SiteContent.findOne({ pageId }).lean()) as { content?: unknown } | null
      return doc?.content ?? null
    },
    null,
    `contenu de la page ${pageId}`
  )
  return stored ? deepMerge(defaults, stored) : defaults
})

/** Fusionne un brouillon (aperçu admin) sur les valeurs par défaut. */
export function mergePageContent<P extends PageId>(pageId: P, draft: unknown): PageContent<P> {
  return deepMerge(pageDefaults[pageId] as PageContent<P>, draft)
}

export type SiteInfo = {
  phone: string
  /** Numéro au format international pour tel: et le JSON-LD. */
  phoneE164: string
  email: string
  address: { street: string; postalCode: string; city: string; region: string; country: string }
  hours: string
}

/** Convertit un numéro français saisi librement en +33... */
export function toE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('00')) return `+${digits.slice(2)}`
  if (digits.startsWith('0') && digits.length === 10) return `+33${digits.slice(1)}`
  return digits
}

/**
 * Coordonnées de l'entreprise : celles de src/config/site.ts, éventuellement
 * corrigées dans l'admin (page Contact). Utilisées par la page Contact, le
 * pied de page et les données structurées : un seul endroit à modifier.
 */
export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  const { info } = await getPageContent('contact')
  const c = siteConfig.contact
  const phoneChanged = info.phone !== c.phone
  return {
    phone: info.phone,
    phoneE164: phoneChanged ? toE164(info.phone) : c.phoneE164,
    email: info.email,
    address: {
      street: info.street,
      postalCode: info.postalCode,
      city: info.city,
      region: c.address.region,
      country: c.address.country,
    },
    hours: info.hours,
  }
})
