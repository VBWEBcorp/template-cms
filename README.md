# Template site vitrine VBWEB

Point de départ de chaque site vitrine client : Next.js 16 (App Router), React 19,
Tailwind CSS 4, MongoDB (facultatif), espace admin intégré, articles déposés par PHARE.

Le site est rendu côté serveur (le texte, les titres et les données structurées sont
dans le HTML servi), les animations sont en CSS, et le JavaScript envoyé au navigateur
se limite à quelques petits îlots interactifs.

- Pages publiques : accueil, services, à propos, contact, blog, galerie, plan du site,
  pages légales, 404 utile.
- Admin (`/admin`) : textes et photos de chaque page, blog, galerie, newsletter,
  popup et bandeau marketing, avec aperçu en direct de la vraie page.
- SEO : métadonnées par page, canonical absolu, JSON-LD en graphe, sitemap avec images,
  robots, RSS, IndexNow, `/llms.txt`, favicons et image de partage.

## Démarrer un nouveau site client (moins d'une heure)

1. **Copier le template** dans un nouveau dépôt, puis `npm install`.
2. **Configurer le site** dans `src/config/site.ts` (le seul fichier d'identité) :
   nom, raison sociale, description (155 caractères maximum), coordonnées, horaires,
   type d'entreprise pour Google (`business.type`), zones desservies, réseaux (`social`),
   teinte de marque (`theme.brandHue`, et `theme.themeColor` en hexadécimal),
   note des avis (`rating`, vrais chiffres ou `null`), interrupteurs (`features`).
3. **Écrire les textes** dans `src/content/pages.ts` : accueil, services, à propos,
   contact, témoignages, avec leurs balises `seo` (titre 60 caractères, description 155).
   Remplacer les photos Unsplash par celles du client.
4. **Variables d'environnement** : `cp .env.example .env.local`, renseigner au minimum
   `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`.
5. **Icônes et image de partage** : `NEXT_PUBLIC_SITE_URL=https://www.client.fr npm run images`
   génère `src/app/icon.png` (512), `src/app/apple-icon.png` (180), `src/app/favicon.ico`
   (16/32/48) et `public/og-default.png` (1200 x 630) aux couleurs de la configuration.
   Si le client a un vrai logo, remplacer ces fichiers (carrés, mêmes tailles).
6. **Pages légales** (`src/app/(site)/mentions-legales`, `politique-de-confidentialite`,
   `conditions-generales`, `politique-cookies`) : compléter les crochets `[...]`
   (hébergeur, SIRET, date de mise à jour).
7. **Vérifier** : `npm run lint && npm run typecheck && npm test && npm run build`,
   puis les contrôles de la section « Vérifier un site » ci-dessous.

## Où modifier quoi

| Je veux changer... | Fichier |
| --- | --- |
| Nom, domaine, coordonnées, couleur, réseaux, lien de rendez-vous | `src/config/site.ts` |
| Textes et photos par défaut des pages | `src/content/pages.ts` (puis l'admin) |
| Couleurs, ombres, animations | `src/index.css` (tokens dérivés de `--brand-hue`) |
| Menu, pied de page | `src/lib/navigation.ts`, `src/components/layout/` |
| Sections de l'accueil | `src/components/pages/home-page.tsx`, `src/components/sections/` |
| Métadonnées, JSON-LD | `src/lib/seo.ts`, `src/lib/structured-data.ts` |
| Texte par défaut de `/llms.txt` | `src/app/llms.txt/route.ts` |
| Rendu des articles (tableaux, sommaire) | `src/lib/article-html.ts`, `.blog-content` dans `src/index.css` |
| Domaines d'images autorisés | `next.config.ts` (`images.remotePatterns`) |

## Comment c'est construit

- **Contenu** : les valeurs par défaut vivent dans le code (`src/content/pages.ts`) ; la base
  ne stocke que les écarts saisis dans l'admin (`sitecontents`). Sans base, le site reste
  entièrement lisible. Un champ vidé par erreur dans l'admin ne vide jamais le site.
- **Rendu** : pages statiques régénérées dès qu'on enregistre dans l'admin ou que PHARE
  publie (`revalidatePath`), et au plus toutes les heures. Si la base ne répond pas pendant
  une régénération, Next garde la version précédente (jamais une page remplie du texte de démo).
- **Îlots client** : barre de navigation, rotation des photos du hero, formulaire de contact,
  filtres du blog, boutons du carrousel, visionneuse de la galerie, popup, bandeau cookies,
  bouton haut de page. Dans ces fichiers, assembler les classes avec `cx` (`src/lib/cx.ts`)
  et non `cn` : `cn` embarque tailwind-merge.
- **Animations** (CSS, compatibles `prefers-reduced-motion`) : `animate-fade-up`,
  `animate-fade-in`, `animate-scale-in` (délai par `--delay`), apparitions au défilement
  `reveal`, `reveal-left`, `reveal-right`, `reveal-scale` (décalage par `--stagger`),
  `parallax-y`, `fill-y-on-scroll`, `gradient-ring` pour la bordure dégradée.
- **Aperçu de l'admin** : `/apercu/[pageId]?brouillon=...` rend la vraie page avec le
  brouillon en cours (mêmes composants que le site).

## Espace admin

- Connexion par `ADMIN_EMAIL` / `ADMIN_PASSWORD` (sans base), ou comptes admin en base
  (`npm run create-admin -- email@client.fr "mot de passe" "Prénom"`).
- Session de 30 jours. Un jeton expiré est détecté et purgé avant la redirection vers la
  connexion. Tous les appels passent par `adminFetch` / `adminJson` (`src/lib/admin-session.ts`).
- Données d'exemple (blog, galerie) : bouton du tableau de bord.
- Une connexion réussie ne prouve pas que la base fonctionne (le compte de l'environnement
  n'en a pas besoin) : en cas de « je suis connecté et je ne vois rien », tester l'API avec
  un jeton neuf avant de chercher ailleurs.

## Formulaire de contact (Resend)

`/api/contact` envoie une notification au propriétaire (le visiteur en `reply_to`), puis un
accusé de réception au visiteur. Pot de miel `company`, limite de 5 messages par 10 minutes
et par adresse IP.

- `EMAIL_FROM` doit être une adresse du domaine du client **validé dans Resend**.
- Une adresse `@resend.dev` est refusée et remplacée par `contact@<domaine du site>`
  (avertissement dans les journaux) : le bac à sable Resend n'écrit qu'au titulaire du
  compte, les visiteurs ne recevraient rien.
- « delivered » dans Resend ne veut pas dire « reçu » : tester avec une adresse tierce.

Le bloc d'appel à l'action ne propose que deux voies : le formulaire et le lien de
rendez-vous (`NEXT_PUBLIC_APPOINTMENT_URL`). Le téléphone et l'e-mail restent dans le pied de
page. Le bouton d'appel flottant existe mais est désactivé (`features.floatingCallButton`).

## PHARE

Route `POST /api/phare/publish`, secret `x-phare-secret` = `PHARE_WEBHOOK_SECRET` :

| Requête | Réponse |
| --- | --- |
| `x-phare-test: 1` | `{ ok: true }`, rien n'est écrit |
| publication (corps : `title`, `slug`, `html`, `metaTitle`, `metaDescription`, `jsonLd`, `coverImageUrl`, `publishedAt`...) | `{ url }`, upsert par slug |
| `x-phare-action: delete` | `{ deleted: true }` : 404, hors liste et hors sitemap, sans redirection |
| `x-phare-action: file`, corps `{ path: "llms.txt", content, contentType }` | `{ written: true }`, llms.txt seulement |
| erreur | `{ message }` |

`publishedAt` envoyé par PHARE est honoré (article antidaté). Les couvertures sont servies
par `app.vbweb.fr`, déjà autorisé dans `next.config.ts`. Un article PHARE s'édite dans l'admin
en HTML brut (l'éditeur visuel supprimerait tableaux et sommaire).

## Vérifier un site

```bash
npm run lint && npm run typecheck && npm test
npm run build && npx next start -p 3200
```

Puis, pour chaque page publique : `curl -s http://localhost:3200/services | grep -c "<h1"`
(un seul h1), présence de `application/ld+json`, de la balise canonical et du texte de la
page dans le HTML servi. Et :

```bash
curl -s localhost:3200/sitemap.xml | head
curl -s localhost:3200/robots.txt
curl -s localhost:3200/llms.txt | head
curl -s localhost:3200/blog/rss.xml | head
curl -s -o /dev/null -w "%{http_code}\n" localhost:3200/page-absente     # 404
curl -s -X POST localhost:3200/api/phare/publish -H "x-phare-secret: faux"   # 401
curl -s -X POST localhost:3200/api/phare/publish -H "x-phare-secret: $PHARE_WEBHOOK_SECRET" -H "x-phare-test: 1"   # {"ok":true}
```

## Checklist de mise en ligne

- [ ] `src/config/site.ts` et `src/content/pages.ts` remplis, plus aucun texte de démo
      (`grep -ri "atelier exemple" src`)
- [ ] Icônes et image de partage aux couleurs du client (`npm run images` ou vrai logo) ;
      vérifier `/icon.png`, `/apple-icon.png`, `/favicon.ico` en 200 et carrés
- [ ] Pages légales complétées (hébergeur, SIRET, date)
- [ ] Variables de production posées chez l'hébergeur (voir `.env.example`), `JWT_SECRET` neuf
- [ ] `NEXT_PUBLIC_SITE_URL` = domaine définitif (avec ou sans www, comme la redirection)
- [ ] Resend : domaine validé (DKIM, SPF), `EMAIL_FROM` sur ce domaine, envoi testé vers
      une adresse tierce, réponse du formulaire reçue
- [ ] PHARE : `PHARE_WEBHOOK_SECRET` posé, test de connexion vert dans la fiche client,
      un article de test publié puis retiré
- [ ] Images de l'admin : variables R2 posées, un envoi testé
- [ ] Search Console : propriété validée, sitemap `https://domaine/sitemap.xml` soumis
- [ ] IndexNow : `INDEXNOW_KEY` posée, `/indexnow-key.txt` répond
- [ ] Test des résultats enrichis Google sur l'accueil et un article
- [ ] Bandeau cookies : à garder si un traceur est ajouté (charger le traceur seulement si
      `hasCookieConsent()` est vrai)

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | développement |
| `npm run build` / `npm start` | production locale |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | tests vitest (câblage, session, PHARE, contenu, règles d'écriture) |
| `npm run images` | icônes et image de partage depuis la configuration |
| `npm run create-admin` | compte admin en base |
