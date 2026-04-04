'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash2, Check, X, ArrowLeft, Pencil, Eye, EyeOff, Calendar } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  category: string
  published: boolean
  publishedAt?: string
  createdAt: string
}

interface BlogSettings {
  enabled: boolean
  title: string
  description?: string
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<BlogSettings>({ enabled: false, title: 'Blog' })
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const [settingsRes, postsRes] = await Promise.all([
          fetch('/api/blog/settings'),
          fetch('/api/blog/posts', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setSettings(await settingsRes.json())
        setPosts(await postsRes.json())
      } catch (error) {
        console.error('Failed to load blog:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/blog/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      })
      if (response.ok) alert('Paramètres sauvegardés')
    } catch {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Supprimer cet article ?')) return
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/blog/posts/${slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setPosts(posts.filter((p) => p.slug !== slug))
      }
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/blog/posts/${post.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...post, published: !post.published }),
      })
      if (response.ok) {
        setPosts(posts.map((p) => p.slug === post.slug ? { ...p, published: !p.published } : p))
      }
    } catch {
      alert('Erreur')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) return <div className="p-6">Chargement...</div>

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">Blog</h1>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/blog/new">
            <Plus className="size-4" />
            Nouvel article
          </Link>
        </Button>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du blog</CardTitle>
          <CardDescription>Activez ou désactivez le blog sur votre site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="blogEnabled" className="flex items-center gap-2 cursor-pointer">
            <input
              id="blogEnabled"
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="size-4"
            />
            <span>Blog visible sur le site</span>
          </Label>

          <div className="space-y-2">
            <Label htmlFor="blogTitle">Titre de la page blog</Label>
            <Input
              id="blogTitle"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="Blog"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blogDesc">Description courte</Label>
            <Input
              id="blogDesc"
              value={settings.description || ''}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Nos derniers articles et actualités"
            />
          </div>

          <Button onClick={handleSaveSettings} disabled={saving} className="w-full gap-2">
            <Check className="size-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </CardContent>
      </Card>

      {/* Posts list */}
      <Card>
        <CardHeader>
          <CardTitle>Articles ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length > 0 ? (
            <div className="space-y-2">
              {posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition"
                >
                  {/* Cover thumbnail */}
                  {post.coverImage && (
                    <div className="hidden sm:block size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={post.coverImage} alt="" className="size-full object-cover" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{post.title}</p>
                      {post.published ? (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Publié
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Brouillon
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {post.category && <span>{post.category}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleTogglePublish(post)}
                      title={post.published ? 'Repasser en brouillon' : 'Publier'}
                    >
                      {post.published ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Eye className="size-4 text-primary" />
                      )}
                    </Button>
                    <Button size="icon-sm" variant="ghost" asChild>
                      <Link href={`/admin/blog/${post.slug}`} title="Modifier">
                        <Pencil className="size-4 text-muted-foreground" />
                      </Link>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(post.slug)}
                      title="Supprimer"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucun article. Cliquez sur &quot;Nouvel article&quot; pour commencer.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
