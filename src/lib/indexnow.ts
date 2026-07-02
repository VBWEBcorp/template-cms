import 'server-only'

import { siteConfig } from '@/lib/seo'

/**
 * Soumission instantanée d'URLs à IndexNow (Bing, Yandex, Naver…).
 * Appelée à la publication/mise à jour d'un article pour accélérer la découverte,
 * au lieu d'attendre le prochain passage de crawl.
 *
 * Ne fait rien tant que INDEXNOW_KEY n'est pas défini ou que le site n'est pas en
 * https public (localhost est rejeté par l'API). La clé est servie sur
 * /indexnow-key.txt (src/app/indexnow-key.txt/route.ts) et référencée via keyLocation.
 */
export async function submitIndexNow(paths: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY
  if (!key) return
  if (!siteConfig.url.startsWith('https://')) return
  if (paths.length === 0) return

  const host = new URL(siteConfig.url).host
  const urlList = paths.map((p) => (p.startsWith('http') ? p : `${siteConfig.url}${p}`))

  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${siteConfig.url}/indexnow-key.txt`,
        urlList,
      }),
    })
  } catch (error) {
    // Best-effort : ne jamais faire échouer l'action admin à cause d'IndexNow.
    console.error('IndexNow submit failed:', error)
  }
}
