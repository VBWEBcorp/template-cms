# Articles planifiés (publication différée)

## Comment ça marche

Le filtre de visibilité du blog applique une règle unique partout (site public, admin, sitemap) : un article n'est visible que si `published: true` **et** `publishedAt <= maintenant`. Tout article dont la date de publication est dans le futur est donc complètement invisible — y compris dans l'admin du client, qui ne peut ni le voir, ni l'éditer, ni le supprimer via l'interface ou l'API. Quand la date arrive, l'article apparaît automatiquement (avec jusqu'à 1h de délai sur les pages statiques à cause du cache `revalidate = 3600` ; le sitemap, lui, est instantané).

## Publier un ou plusieurs articles à des dates futures

Il faut insérer les articles **directement en base MongoDB** (le CMS ne propose pas de champ "date de publication" dans son UI, donc impossible depuis l'admin). Exemple de script :

```js
// scripts/publish-scheduled.js
const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const BlogPostSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true }, excerpt: String,
  content: String, coverImage: String, category: String, tags: [String],
  author: String, published: Boolean, publishedAt: Date,
  metaTitle: String, metaDescription: String,
}, { timestamps: true })

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema)

const articles = [
  {
    title: 'Article semaine 1',
    slug: 'article-semaine-1',
    excerpt: '...',
    content: '<h2>Intro</h2><p>...</p>',
    coverImage: 'https://...',
    category: 'Conseils',
    tags: ['seo'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-05-05T08:00:00'),
  },
  {
    title: 'Article semaine 2',
    slug: 'article-semaine-2',
    // ...
    published: true,
    publishedAt: new Date('2026-05-12T08:00:00'),
  },
  // autant d'articles que tu veux, espacés sur l'année
]

;(async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  await BlogPost.insertMany(articles)
  console.log(`${articles.length} articles planifiés`)
  await mongoose.disconnect()
})()
```

Lancé avec `node scripts/publish-scheduled.js`. Chaque article a `published: true` (donc actif dès que sa date arrive) avec un `publishedAt` futur (donc invisible jusque-là). Pour générer ces articles tu donnes simplement le schéma et l'URI Mongo à un LLM, il te produit le tableau `articles` prêt à insérer.
