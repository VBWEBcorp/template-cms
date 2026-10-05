import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { GalleryImage, GallerySettings } from '@/models/Gallery'
import { BlogPost, BlogSettings } from '@/models/Blog'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    await connectDB()
    const results: string[] = []

    // ─── Gallery: 4 example photos ───
    const existingImages = await GalleryImage.countDocuments()
    if (existingImages === 0) {
      const galleryImages = [
        {
          title: 'Refonte site e-commerce',
          description: 'Redesign complet d\'une boutique en ligne avec une expérience utilisateur optimisée et un tunnel de conversion performant.',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
          category: 'Web Design',
          order: 1,
          active: true,
        },
        {
          title: 'Application mobile fitness',
          description: 'Conception et développement d\'une application de suivi sportif avec tableau de bord personnalisé.',
          imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
          category: 'Application',
          order: 2,
          active: true,
        },
        {
          title: 'Identité visuelle restaurant',
          description: 'Création d\'une identité de marque complète : logo, charte graphique et supports de communication.',
          imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
          category: 'Branding',
          order: 3,
          active: true,
        },
        {
          title: 'Dashboard analytique',
          description: 'Interface de visualisation de données en temps réel pour une startup SaaS B2B.',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
          category: 'Web Design',
          order: 4,
          active: true,
        },
      ]

      await GalleryImage.insertMany(galleryImages)
      results.push('4 images galerie créées')

      // Update gallery settings
      const gallerySettings = await GallerySettings.findOne()
      if (!gallerySettings) {
        await GallerySettings.create({
          enabled: true,
          title: 'Nos réalisations',
          description: 'Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire.',
          eyebrow: 'Galerie',
        })
      } else {
        gallerySettings.enabled = true
        await gallerySettings.save()
      }
      results.push('Galerie activée')
    } else {
      results.push('Galerie déjà peuplée, ignorée')
    }

    // ─── Blog: 2 example articles + categories ───
    const existingPosts = await BlogPost.countDocuments()
    if (existingPosts === 0) {
      const blogPosts = [
        {
          title: '5 tendances web design à suivre en 2026',
          slug: '5-tendances-web-design-2026',
          excerpt: 'Le web design évolue constamment. Découvrez les tendances incontournables de cette année pour créer des sites modernes, accessibles et performants.',
          content: `<p>Le web évolue vite. Voici les tendances qui comptent vraiment cette année, et comment les appliquer sans alourdir votre site.</p><h2>Sommaire</h2><ol><li>Le design immersif en 3D</li><li>Le minimalisme fonctionnel : moins mais mieux</li><li>Les micro-interactions</li><li>L'accessibilité comme standard</li><li>Le mode sombre natif</li><li>Comparatif des tendances</li></ol><h2>1. Le design immersif en 3D</h2><p>Les expériences en trois dimensions ne sont plus réservées aux grandes marques. Utilisées avec mesure, elles captent l'attention sans ralentir la page.</p><h2>2. Le minimalisme fonctionnel</h2><p>Moins, c'est plus : des interfaces épurées qui vont droit au but, des espaces blancs qui guident l'œil.</p><h2>3. Les micro-interactions</h2><p>De petites animations au survol ou au clic rendent la navigation plus intuitive, à condition de rester discrètes.</p><h2>4. L'accessibilité comme standard</h2><p>Contrastes suffisants, navigation au clavier, textes alternatifs : l'accessibilité se pense dès la conception.</p><h2>5. Le mode sombre natif</h2><p>Les visiteurs l'attendent : un basculement fluide entre thème clair et sombre, qui respecte leurs préférences.</p><h2>6. Comparatif des tendances</h2><table><thead><tr><th>Tendance</th><th>Effort</th><th>Effet sur la conversion</th></tr></thead><tbody><tr><td>Design 3D</td><td>Élevé</td><td>Variable</td></tr><tr><td>Minimalisme</td><td>Faible</td><td>Fort</td></tr><tr><td>Micro-interactions</td><td>Moyen</td><td>Moyen</td></tr><tr><td>Accessibilité</td><td>Moyen</td><td>Fort</td></tr><tr><td>Mode sombre</td><td>Faible</td><td>Faible</td></tr></tbody></table>`,
          coverImage: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80',
          category: 'Web Design',
          tags: ['design', 'tendances', 'UX', 'accessibilité'],
          author: 'L\'équipe',
          published: true,
          publishedAt: new Date('2026-03-15'),
          metaTitle: '5 tendances web design incontournables en 2026',
          metaDescription: 'Découvrez les 5 grandes tendances du web design en 2026 : 3D immersif, minimalisme, micro-interactions, accessibilité et dark mode.',
        },
        {
          title: 'Comment améliorer le référencement de votre site',
          slug: 'ameliorer-referencement-site',
          excerpt: 'Le SEO est un levier essentiel pour attirer du trafic qualifié. Voici nos conseils pratiques pour optimiser votre visibilité sur les moteurs de recherche.',
          content: `<h2>Optimisez vos balises meta</h2><p>Chaque page de votre site doit avoir un titre unique (balise title) et une description pertinente (meta description). Ces éléments sont les premiers éléments que vos visiteurs voient dans les résultats de recherche, soignez-les.</p><h2>Créez du contenu de qualité</h2><p>Google privilégie les contenus utiles, originaux et bien structurés. Publiez régulièrement des articles de blog qui répondent aux questions de votre audience. Utilisez des titres hiérarchisés (H2, H3) pour organiser votre texte.</p><h2>Améliorez la vitesse de chargement</h2><p>Un site lent fait fuir les visiteurs et pénalise votre classement. Optimisez vos images (format WebP, compression), activez la mise en cache et utilisez un hébergement performant. Visez un score supérieur à 90 sur Google PageSpeed.</p><h2>Pensez mobile-first</h2><p>Plus de 60% du trafic web provient des mobiles. Votre site doit être parfaitement responsive et offrir une navigation fluide sur smartphone. Google indexe désormais en priorité la version mobile de votre site.</p><h2>Travaillez vos liens</h2><p>Les liens internes aident Google à comprendre la structure de votre site. Les liens externes (backlinks) provenant de sites de confiance renforcent votre autorité. Développez une stratégie de netlinking cohérente et progressive.</p>`,
          coverImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
          category: 'SEO',
          tags: ['seo', 'référencement', 'marketing', 'performance'],
          author: 'L\'équipe',
          published: true,
          publishedAt: new Date('2026-03-28'),
          metaTitle: 'Guide pratique : améliorer le référencement de votre site web',
          metaDescription: 'Conseils SEO concrets pour optimiser votre site : balises meta, contenu de qualité, vitesse, mobile-first et stratégie de liens.',
        },
      ]

      await BlogPost.insertMany(blogPosts)
      results.push('2 articles blog créés')

      // Update blog settings with categories
      const blogSettings = await BlogSettings.findOne()
      if (!blogSettings) {
        await BlogSettings.create({
          enabled: true,
          title: 'Nos dernières actualités',
          description: 'Retrouvez nos conseils, nos projets récents et les tendances du secteur.',
          eyebrow: 'Blog',
          categories: ['Web Design', 'SEO', 'Conseils'],
        })
      } else {
        blogSettings.enabled = true
        if (!blogSettings.categories || blogSettings.categories.length === 0) {
          blogSettings.categories = ['Web Design', 'SEO', 'Conseils']
        }
        await blogSettings.save()
      }
      results.push('Blog activé avec catégories')
    } else {
      results.push('Blog déjà peuplé, ignoré')
    }

    // Pages statiques régénérées : la modification est visible tout de suite.
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
