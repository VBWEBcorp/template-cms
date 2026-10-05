'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Check, Eye, EyeOff, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageField } from '@/components/admin/field-editor'
import { RichEditor } from '@/components/admin/rich-editor'
import { useToast } from '@/components/admin/toast'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { AdminLoading } from '@/components/admin/admin-ui'
import { siteConfig } from '@/config/site'
import { BLOG_BASE } from '@/lib/blog-defaults'
import { adminJson, errorMessage } from '@/lib/admin-session'

interface BlogPost {
  _id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  author: string
  published: boolean
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
  notifyOnPublish?: boolean
  newsletterSentAt?: string
  /** 'phare' : article déposé par l'outil SEO de l'agence. */
  source?: string
}

const siteHost = siteConfig.url.replace(/^https?:\/\//, '')

const emptyPost: BlogPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: '',
  tags: [],
  author: '',
  published: false,
  metaTitle: '',
  metaDescription: '',
  notifyOnPublish: true,
}

export default function BlogPostEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const isNew = slug === 'new'
  const router = useRouter()
  const { toast } = useToast()
  const confirm = useConfirm()
  const [post, setPost] = useState<BlogPost>(emptyPost)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tagsInput, setTagsInput] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    adminJson<{ categories?: string[] }>('/api/blog/settings')
      .then((s) => setCategories(s.categories || []))
      .catch(() => {
        // Sans catégories, le champ reste en saisie libre.
      })
  }, [])

  useEffect(() => {
    if (isNew) return
    const fetchPost = async () => {
      try {
        // Appel authentifié : les brouillons ne sont visibles que de l'admin.
        const data = await adminJson<BlogPost>(`/api/blog/posts/${slug}`)
        setPost(data)
        setTagsInput(data.tags?.join(', ') || '')
      } catch (err) {
        const message = errorMessage(err)
        if (message) toast.error(`Article introuvable : ${message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug, isNew, toast])

  const updateField = <K extends keyof BlogPost>(field: K, value: BlogPost[K]) => {
    setSaved(false)
    setPost((prev) => ({ ...prev, [field]: value }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSave = async () => {
    if (!post.title) {
      toast.error('Le titre est obligatoire')
      return
    }

    setSaving(true)
    try {
      const newSlug = post.slug || generateSlug(post.title)
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      const body = { ...post, slug: newSlug, tags }

      // Mise à jour : on vise l'adresse ACTUELLE de l'article (slug de l'URL),
      // même si le slug vient d'être modifié dans le formulaire.
      const url = isNew ? '/api/blog/posts' : `/api/blog/posts/${slug}`
      const saved = await adminJson<BlogPost>(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(body) })
      setSaved(true)
      toast.success(saved.published ? 'Article enregistré et publié' : 'Brouillon enregistré')
      setTimeout(() => setSaved(false), 3000)

      if (isNew || saved.slug !== slug) {
        router.replace(`/admin/blog/${saved.slug}`)
      } else {
        setPost(saved)
      }
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!(await confirm({ title: 'Supprimer l’article', message: 'Cette action est définitive et irréversible.', danger: true, confirmLabel: 'Supprimer' }))) return
    try {
      await adminJson(`/api/blog/posts/${slug}`, { method: 'DELETE' })
      toast.success('Article supprimé')
      router.push('/admin/blog')
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    }
  }

  if (loading) return <AdminLoading />

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 bg-muted/30 backdrop-blur-sm border-b border-border/30 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-4xl">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-foreground">
              {isNew ? 'Nouvel article' : 'Modifier l\'article'}
            </h1>
          </div>
          <div className="flex items-center gap-2 pl-11 sm:pl-0">
            {!isNew && (
              <Button size="sm" variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="size-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateField('published', !post.published)}
            >
              {post.published ? (
                <><EyeOff className="size-3.5" /> <span className="hidden sm:inline">Repasser en</span> Brouillon</>
              ) : (
                <><Eye className="size-3.5" /> Publier</>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className={saved ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
            >
              {saved ? (
                <><Check className="size-3.5" /> Sauvegardé</>
              ) : (
                <><Save className="size-3.5" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-5">
        {/* Main info */}
        <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
            <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              Informations principales
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Titre de l&apos;article
              </Label>
              <Input
                value={post.title}
                onChange={(e) => {
                  updateField('title', e.target.value)
                  if (isNew) updateField('slug', generateSlug(e.target.value))
                }}
                placeholder="Ex : Comment améliorer sa visibilité en ligne"
                className="text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Adresse de la page (URL)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">/blog/</span>
                <Input
                  value={post.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="comment-ameliorer-sa-visibilite"
                />
              </div>
              <p className="text-[11px] text-muted-foreground/60">
                Généré automatiquement depuis le titre. Modifiez-le si besoin.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Introduction / Résumé
              </Label>
              <textarea
                value={post.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                placeholder="Un court résumé qui apparaîtra sur la page du blog et dans les résultats Google"
                rows={2}
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
              />
            </div>

            <ImageField
              label="Image de couverture"
              value={post.coverImage}
              onChange={(v) => updateField('coverImage', v)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
            <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              Contenu de l&apos;article
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Texte complet
              </Label>
              {post.source === 'phare' ? (
                <>
                  {/* L'éditeur visuel supprimerait tableaux, sommaire et ancres : on édite le HTML brut. */}
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                    Article publié par PHARE. Corrigez-le de préférence dans PHARE : une nouvelle publication
                    remplacera ce texte. Ici, seul le code HTML est modifiable, pour préserver tableaux et sommaire.
                  </p>
                  <textarea
                    value={post.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    rows={18}
                    spellCheck={false}
                    className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </>
              ) : (
                <>
                  <RichEditor
                    content={post.content}
                    onChange={(html) => updateField('content', html)}
                    placeholder="Commencez à rédiger votre article..."
                  />
                  <p className="text-[11px] text-muted-foreground/60">
                    Utilisez la barre d&apos;outils pour mettre en forme : titres, gras, listes, liens, images...
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
            <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              Organisation
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Catégorie
                </Label>
                {categories.length > 0 ? (
                  <select
                    value={post.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={post.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    placeholder="Ex : Conseils, Actualités, Tutoriel..."
                  />
                )}
                <p className="text-[11px] text-muted-foreground/60">
                  {categories.length > 0
                    ? 'Les catégories se gèrent dans l\'onglet "Page & Catégories"'
                    : 'Saisissez une catégorie ou créez-en depuis les paramètres du blog'}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Auteur
                </Label>
                <Input
                  value={post.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  placeholder="Nom de l'auteur"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="publishedAt" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Date de publication
              </Label>
              <Input
                id="publishedAt"
                type="date"
                value={post.publishedAt ? post.publishedAt.slice(0, 10) : ''}
                onChange={(e) => updateField('publishedAt', e.target.value ? new Date(`${e.target.value}T09:00:00`).toISOString() : undefined)}
                className="max-w-48"
              />
              <p className="text-[11px] text-muted-foreground/60">
                Vide : date du jour à la publication. Une date future programme l&apos;article (invisible jusqu&apos;à ce jour).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Mots-clés
              </Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="marketing, seo, web design (séparés par des virgules)"
              />
              <p className="text-[11px] text-muted-foreground/60">
                Les mots-clés aident à organiser vos articles et améliorent le référencement.
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
            <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              Newsletter
            </h3>
          </div>
          <div className="p-5">
            {post.newsletterSentAt ? (
              <p className="flex items-center gap-2 text-sm text-emerald-600">
                <Check className="size-4 shrink-0" />
                Abonnés déjà notifiés le {new Date(post.newsletterSentAt).toLocaleDateString('fr-FR')}.
              </p>
            ) : (
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={post.notifyOnPublish !== false}
                  onChange={(e) => updateField('notifyOnPublish', e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                />
                <span className="text-sm text-foreground">
                  Prévenir les abonnés à la publication
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                    À la première mise en ligne de cet article, un e-mail d&apos;annonce est envoyé aux abonnés
                    de la newsletter (une seule fois).
                  </span>
                </span>
              </label>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
            <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              Référencement (SEO)
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Titre affiché sur Google
              </Label>
              <Input
                value={post.metaTitle || ''}
                onChange={(e) => updateField('metaTitle', e.target.value)}
                placeholder="Laissez vide pour utiliser le titre de l'article"
              />
              <p className="text-[11px] text-muted-foreground/60">
                Idéalement entre 50 et 60 caractères. {post.metaTitle ? `${post.metaTitle.length} caractères` : post.title ? `${post.title.length} caractères (titre actuel)` : ''}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description affichée sur Google
              </Label>
              <textarea
                value={post.metaDescription || ''}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                placeholder="Laissez vide pour utiliser le résumé. Cette description apparaît sous le titre dans les résultats de recherche."
                rows={2}
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
              />
              <p className="text-[11px] text-muted-foreground/60">
                Idéalement entre 120 et 160 caractères. {post.metaDescription ? `${post.metaDescription.length} caractères` : ''}
              </p>
            </div>

            {/* SEO Preview */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide mb-2">
                Aperçu Google
              </p>
              <p className="text-[#1a0dab] text-base font-medium truncate">
                {post.metaTitle || post.title || 'Titre de l\'article'}
              </p>
              <p className="text-[#006621] text-xs truncate">
                {siteHost}{BLOG_BASE}/{post.slug || 'adresse-de-l-article'}
              </p>
              <p className="text-xs text-[#545454] line-clamp-2">
                {post.metaDescription || post.excerpt || 'Description de l\'article...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
