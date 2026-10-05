import { siteConfig } from '@/config/site'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { readSiteFile } from '@/lib/site-files'

/**
 * /llms.txt : présentation du site pour les moteurs génératifs. Texte brut.
 *
 * Deux sources, dans cet ordre : la version déposée par PHARE (action `file`
 * de /api/phare/publish), puis le texte par défaut ci-dessous, construit depuis
 * src/config/site.ts. Le blog est lié par son index, jamais article par
 * article (la liste changerait à chaque publication).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function defaultLlmsTxt(): string {
  const u = siteConfig.url
  const a = siteConfig.contact.address
  return `# ${siteConfig.name}

> ${siteConfig.description}

## Pages principales
- [Accueil](${u}/) : présentation de l'activité et réponses aux questions fréquentes
- [Services](${u}/services) : le détail des prestations
- [À propos](${u}/a-propos) : l'équipe, la méthode et les valeurs
- [Contact](${u}/contact) : formulaire de demande et prise de rendez-vous

## Articles
- [Tous les articles](${u}${BLOG_BASE}) : conseils et actualités

## Contact
- ${a.street}, ${a.postalCode} ${a.city}
- ${siteConfig.contact.phone} · ${siteConfig.contact.email}
${siteConfig.social.length ? `\n## Profils officiels\n${siteConfig.social.map((s) => `- ${s}`).join('\n')}\n` : ''}
Plan du site : ${u}/sitemap.xml
`
}

export async function GET() {
  let content = defaultLlmsTxt()
  try {
    const deposited = await readSiteFile('llms.txt')
    if (deposited) content = deposited
  } catch (e) {
    // Base injoignable : mieux vaut la version du code que pas de fichier.
    console.error('[llms.txt]', e)
  }

  return new Response(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  })
}
