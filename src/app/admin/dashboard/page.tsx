'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Home,
  Users,
  Briefcase,
  Phone,
  MessageSquare,
  Images,
  ArrowRight,
  FileText,
  Database,
  Megaphone,
  Plus,
  ImagePlus,
  ExternalLink,
  PenLine,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowUpRight,
  Mail,
} from 'lucide-react'

import { adminJson, errorMessage, getUser } from '@/lib/admin-session'

interface AdminUser {
  email: string
  name?: string
}

interface Post {
  _id: string
  title: string
  slug: string
  category?: string
  published: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

const modules = [
  { href: '/admin/pages/accueil', label: 'Accueil', desc: 'Hero, histoire, CTA, bandeau', icon: Home },
  { href: '/admin/pages/a-propos', label: 'À propos', desc: 'Présentation, valeurs', icon: Users },
  { href: '/admin/pages/services', label: 'Services', desc: 'Liste des services', icon: Briefcase },
  { href: '/admin/pages/contact', label: 'Contact', desc: 'Formulaire, coordonnées', icon: Phone },
  { href: '/admin/pages/temoignages', label: 'Témoignages', desc: 'Avis clients', icon: MessageSquare },
  { href: '/admin/gallery', label: 'Galerie', desc: 'Photos du site', icon: Images },
  { href: '/admin/blog', label: 'Blog', desc: 'Articles et actualités', icon: FileText },
  { href: '/admin/newsletter', label: 'Newsletter', desc: 'Abonnés et inscriptions', icon: Mail },
  { href: '/admin/marketing', label: 'Marketing', desc: 'Popup et bandeau promo', icon: Megaphone },
]

const quickActions = [
  { href: '/admin/blog/new', label: 'Nouvel article', icon: Plus, accent: 'bg-primary text-white hover:bg-primary/90' },
  { href: '/admin/gallery', label: 'Ajouter une photo', icon: ImagePlus, accent: 'bg-card text-foreground hover:bg-muted border border-border' },
  { href: '/admin/pages/accueil', label: "Modifier l'accueil", icon: PenLine, accent: 'bg-card text-foreground hover:bg-muted border border-border' },
  { href: '/', label: 'Voir le site', icon: ExternalLink, accent: 'bg-card text-foreground hover:bg-muted border border-border', external: true },
]

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'sans date'

export default function AdminDashboardPage() {
  // Page rendue uniquement dans le navigateur (le layout admin attend la session) : lecture directe.
  const [user] = useState<AdminUser>(() => getUser() ?? { email: '' })
  const [statsLoading, setStatsLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [imageCount, setImageCount] = useState(0)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [statsError, setStatsError] = useState('')

  const loadStats = useCallback(async () => {
    try {
      const [postsData, imagesData] = await Promise.all([
        adminJson<Post[]>('/api/blog/posts'),
        adminJson<unknown[]>('/api/gallery/images'),
      ])
      setPosts(Array.isArray(postsData) ? postsData : [])
      setImageCount(Array.isArray(imagesData) ? imagesData.length : 0)
    } catch (err) {
      const message = errorMessage(err)
      if (message) setStatsError(message)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement réseau au montage
    loadStats()
  }, [loadStats])

  const firstName = user.name?.split(' ')[0] || 'admin'
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dateLabel = today.charAt(0).toUpperCase() + today.slice(1)

  const totalPosts = posts.length
  const publishedCount = posts.filter((p) => p.published).length
  const draftCount = totalPosts - publishedCount
  const recentPosts = posts.slice(0, 5)
  const isEmpty = !statsLoading && totalPosts === 0 && imageCount === 0

  const stats = [
    { label: 'Articles', value: totalPosts, hint: `${publishedCount} publié${publishedCount > 1 ? 's' : ''}`, icon: FileText, tint: 'bg-blue-500/10 text-blue-600', href: '/admin/blog' },
    { label: 'Brouillons', value: draftCount, hint: draftCount ? 'à finaliser' : 'aucun', icon: PenLine, tint: 'bg-amber-500/10 text-amber-600', href: '/admin/blog' },
    { label: 'Photos galerie', value: imageCount, hint: 'en ligne', icon: Images, tint: 'bg-violet-500/10 text-violet-600', href: '/admin/gallery' },
    { label: 'Pages éditables', value: 5, hint: 'du site', icon: Layers, tint: 'bg-emerald-500/10 text-emerald-600', href: '/admin/pages/accueil' },
  ]

  const handleSeed = async () => {
    setSeeding(true)
    setSeedMsg(null)
    try {
      await adminJson('/api/seed', { method: 'POST' })
      setSeedMsg({ type: 'ok', text: 'Données d’exemple ajoutées. Statistiques mises à jour.' })
      setStatsLoading(true)
      await loadStats()
    } catch (err) {
      const message = errorMessage(err)
      if (message) setSeedMsg({ type: 'err', text: message })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div 
          className="animate-fade-in relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-6 sm:p-7">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{dateLabel}</p>
              <h1 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">
                Bonjour {firstName} 👋
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-white/60">
                Gérez le contenu de votre site depuis cet espace.
              </p>
            </div>
            <Link
              href="/"
              target="_blank"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white/90"
            >
              <Eye className="size-4" />
              Voir le site
            </Link>
          </div>
        </div>

        {statsError && (
          <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            Statistiques indisponibles : {statsError}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div className="animate-fade-in"
                key={stat.label}>
                <Link
                  href={stat.href}
                  className="group block rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex size-9 items-center justify-center rounded-lg ${stat.tint}`}>
                      <Icon className="size-[18px]" />
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
                  </div>
                  {statsLoading ? (
                    <div className="mt-3 h-8 w-12 animate-pulse rounded-md bg-muted" />
                  ) : (
                    <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  )}
                  <p className="mt-0.5 text-xs font-medium text-foreground/80">{stat.label}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.hint}</p>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Recent posts + Quick actions */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Recent posts */}
          <div 
            className="animate-fade-in rounded-2xl border border-border bg-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Articles récents</h2>
              <Link href="/admin/blog" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Gérer le blog <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {statsLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                <FileText className="size-7 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium text-foreground">Aucun article pour le moment</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Publiez votre premier article de blog.</p>
                <Link
                  href="/admin/blog/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <Plus className="size-4" /> Créer un article
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentPosts.map((post) => (
                  <li key={post._id}>
                    <Link
                      href={`/admin/blog/${post.slug}`}
                      className="group flex items-center gap-3 py-2.5 transition-colors"
                    >
                      <span
                        className={`mt-0.5 size-2 shrink-0 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        title={post.published ? 'Publié' : 'Brouillon'}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                          {post.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {post.category || 'Général'} · {formatDate(post.publishedAt || post.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          post.published
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {post.published ? 'Publié' : 'Brouillon'}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick actions */}
          <div 
            className="animate-fade-in rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Actions rapides</h2>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    {...(action.external ? { target: '_blank' } : {})}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${action.accent}`}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {action.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="animate-fade-in">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Gérer le contenu</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod) => {
              const Icon = mod.icon
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70 transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{mod.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{mod.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Seed : données d'exemple */}
        <div 
          className="animate-fade-in rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70">
                <Database className="size-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Données d&apos;exemple</p>
                <p className="text-xs text-muted-foreground">
                  {isEmpty
                    ? 'Votre site est vide : ajoutez des photos et articles de démonstration.'
                    : 'Ajouter des photos galerie et articles blog pour tester le template.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="w-full shrink-0 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {seeding ? 'Chargement…' : 'Charger les données'}
            </button>
          </div>

          {seedMsg && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm ${
                seedMsg.type === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-700'
                  : 'bg-red-500/10 text-red-700'
              }`}
            >
              {seedMsg.type === 'ok' ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              {seedMsg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
