import 'server-only'

import { cache } from 'react'

import { withDb } from '@/lib/db'
import { DEFAULT_MARKETING, type MarketingSettings, normalizeMarketing } from '@/lib/marketing'
import { MarketingPopup } from '@/models/Marketing'

/** Réglages marketing pour le rendu serveur (désactivés tant que rien n'est en base). */
export const getMarketing = cache(
  async (): Promise<MarketingSettings> =>
    withDb(
      async () => {
        const doc = await MarketingPopup.findOne().lean()
        return doc ? normalizeMarketing(doc) : DEFAULT_MARKETING
      },
      DEFAULT_MARKETING,
      'réglages marketing'
    )
)
