import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { siteConfig } from '@/config/site'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { connectDB, isDbConfigured } from '@/lib/db'
import { submitIndexNow } from '@/lib/indexnow'
import {
  type PharePayload,
  deleteCandidates,
  firstImageInHtml,
  jsonLdToString,
  markdownToHtml,
  parsePublishedAt,
  safeEqual,
  slugify,
  stripHtml,
} from '@/lib/phare'
import { isAllowedSiteFile, normalizeSiteFilePath, writeSiteFile } from '@/lib/site-files'
import { BlogPost } from '@/models/Blog'

/**
 * Webhook PHARE (outil SEO de l'agence) : dépôt, retrait d'articles et dépôt
 * du fichier llms.txt. Contrat (identique sur tout le parc) :
 *
 * - en-tête `x-phare-secret` comparé à PHARE_WEBHOOK_SECRET (temps constant) ;
 * - `x-phare-test: 1` : `{ ok: true }`, rien n'est écrit ;
 * - publication : upsert par slug, réponse `{ url }` ; `publishedAt` envoyé est
 *   HONORÉ (article antidaté), sinon l'article prend la date du dépôt ;
 * - `x-phare-action: delete` : `{ deleted: true }`, l'article répond 404, sort
 *   de la liste et du sitemap, sans redirection ;
 * - `x-phare-action: file`, corps `{ path, content, contentType }` :
 *   `{ written: true }`, uniquement pour llms.txt ;
 * - toute erreur : `{ message }`.
 *
 * Les visuels sont hébergés par PHARE (adresses absolues) : rien n'est recopié.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function fail(message: string, status: number) {
  return NextResponse.json({ message }, { status })
}

/**
 * Vide le cache de Netlify placé DEVANT Next. revalidatePath ne vide que celui
 * de Next ; mesuré sur le parc, Netlify servait encore une copie périmée deux
 * minutes après une publication. Hors Netlify (jeton absent), rien à faire.
 * Une purge ratée ne fait jamais échouer une publication réussie.
 */
async function purgeNetlifyCache(): Promise<void> {
  const token = process.env.NETLIFY_PURGE_API_TOKEN
  const siteId = process.env.SITE_ID ?? process.env.NETLIFY_SITE_ID
  if (!token || !siteId) return
  try {
    const r = await fetch('https://api.netlify.com/api/v1/purge', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ site_id: siteId }),
      signal: AbortSignal.timeout(10_000),
    })
    console.log(`[phare] purge Netlify : ${r.status}`)
  } catch (e) {
    console.warn('[phare] purge Netlify impossible :', e)
  }
}

/** Visibilité immédiate : liste, article, sitemap, flux, menu et plan du site. */
async function refresh(): Promise<void> {
  revalidatePath('/', 'layout')
  revalidatePath('/sitemap.xml')
  revalidatePath(`${BLOG_BASE}/rss.xml`)
  await purgeNetlifyCache()
}

export async function POST(req: Request) {
  // 1. Secret partagé
  const secret = process.env.PHARE_WEBHOOK_SECRET
  const provided = req.headers.get('x-phare-secret')
  if (!secret || !provided || !safeEqual(provided, secret)) {
    return fail('Non autorisé', 401)
  }

  // 2. Test de connexion : on ne touche à rien.
  if (req.headers.get('x-phare-test') === '1') {
    return NextResponse.json({ ok: true })
  }

  const action = req.headers.get('x-phare-action')

  // 3. Corps (un retrait peut arriver avec un corps vide)
  let body: PharePayload = {}
  try {
    body = ((await req.json()) ?? {}) as PharePayload
  } catch {
    if (action !== 'delete') return fail('Corps JSON invalide', 400)
  }

  if (!isDbConfigured()) {
    return fail('Base de données non configurée sur ce site (MONGODB_URI absent)', 503)
  }

  try {
    await connectDB()

    // 4. Fichier de la racine (llms.txt)
    if (action === 'file' || body.action === 'file') {
      const path = body.path?.trim()
      if (!path || typeof body.content !== 'string' || !body.content.trim()) {
        return fail('Dépôt impossible : `path` et `content` sont requis', 400)
      }
      if (!isAllowedSiteFile(path)) {
        return fail(`Fichier non autorisé : ${path}. Seul llms.txt est accepté.`, 400)
      }
      const relative = normalizeSiteFilePath(path)
      await writeSiteFile({ path: relative, content: body.content, contentType: body.contentType })
      revalidatePath(`/${relative}`)
      return NextResponse.json({ written: true, url: `${siteConfig.url}/${relative}` })
    }

    // 5. Retrait : 404 à l'adresse, hors liste et hors sitemap, sans redirection.
    if (action === 'delete' || body.action === 'delete') {
      const slugs = deleteCandidates(body)
      if (slugs.length === 0) return fail('Retrait impossible : ni `slug` ni `url` fournis', 400)
      await BlogPost.deleteMany({ slug: { $in: slugs } })
      await refresh()
      // Idempotent : si l'article n'existait pas (ou plus), le but est atteint.
      return NextResponse.json({ deleted: true })
    }

    // 6. Publication
    const title = body.title?.trim()
    if (!title) return fail('Champ `title` manquant', 400)

    const slug = slugify(body.slug || title)
    if (!slug) return fail('Slug invalide', 400)

    const markdown = body.markdown?.trim() ?? ''
    const content = body.html?.trim() || markdownToHtml(markdown)
    if (!content) return fail('Article vide : ni `html` ni `markdown` fournis', 400)

    const existing = await BlogPost.findOne({ slug }).select('coverImage').lean<{ coverImage?: string } | null>()
    const metaDescription = body.metaDescription?.trim() ?? ''
    const coverImage = body.coverImageUrl?.trim() || firstImageInHtml(content) || existing?.coverImage || ''
    const jsonLd = jsonLdToString(body.jsonLd)
    const publishedAt = parsePublishedAt(body.publishedAt)

    const res = await BlogPost.updateOne(
      { slug },
      {
        $set: {
          title,
          content,
          markdown,
          excerpt: metaDescription || stripHtml(content).slice(0, 200),
          coverImage,
          coverImageAlt: body.coverImageAlt?.trim() || title,
          metaTitle: body.metaTitle?.trim() || title,
          metaDescription,
          ...(jsonLd ? { jsonLd } : {}),
          ...(body.keyword?.trim() ? { tags: [body.keyword.trim()] } : {}),
          source: 'phare',
          // Déposé EN LIGNE : jamais en brouillon (un brouillon répondrait 404).
          published: true,
          // Date envoyée par PHARE : honorée à la création comme à la mise à jour.
          ...(publishedAt ? { publishedAt } : {}),
        },
        $setOnInsert: {
          ...(publishedAt ? {} : { publishedAt: new Date() }),
          category: 'Actualités',
          // Pas d'annonce newsletter automatique pour les articles de PHARE.
          notifyOnPublish: false,
        },
      },
      { upsert: true }
    )

    await refresh()
    await submitIndexNow([`${BLOG_BASE}/${slug}`, BLOG_BASE])

    return NextResponse.json(
      { url: `${siteConfig.url}${BLOG_BASE}/${slug}` },
      { status: res.upsertedCount > 0 ? 201 : 200 }
    )
  } catch (e) {
    console.error('[phare/publish]', e)
    return fail(e instanceof Error ? e.message : 'Erreur interne lors de la publication', 500)
  }
}
