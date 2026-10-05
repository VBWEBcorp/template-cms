'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus, Check, Save, ArrowLeft, Eye, EyeOff, ImageOff, Images } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageField } from '@/components/admin/field-editor'
import { useToast } from '@/components/admin/toast'
import { useConfirm } from '@/components/admin/confirm-dialog'
import { AdminLoading } from '@/components/admin/admin-ui'
import { adminJson, errorMessage } from '@/lib/admin-session'
import { cn } from '@/lib/utils'

interface GalleryImage {
  _id: string
  title: string
  description?: string
  imageUrl: string
  category?: string
  active: boolean
}

interface GallerySettings {
  enabled: boolean
  title: string
  description?: string
  eyebrow?: string
  heroImage?: string
}

export default function AdminGalleryPage() {
  const { toast } = useToast()
  const confirm = useConfirm()
  const [settings, setSettings] = useState<GallerySettings>({ enabled: true, title: 'Nos réalisations', eyebrow: 'Galerie', description: 'Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire.', heroImage: '' })
  const [images, setImages] = useState<GalleryImage[]>([])
  const [newImage, setNewImage] = useState({ title: '', description: '', imageUrl: '', category: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSettings, setSavedSettings] = useState(false)

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Appels authentifiés : l'admin voit aussi les images masquées.
        const [settingsData, imagesData] = await Promise.all([
          adminJson<GallerySettings>('/api/gallery/settings'),
          adminJson<GalleryImage[]>('/api/gallery/images'),
        ])
        setSettings(settingsData)
        setImages(Array.isArray(imagesData) ? imagesData : [])
      } catch (err) {
        const message = errorMessage(err)
        if (message) toast.error(`Chargement de la galerie impossible : ${message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await adminJson('/api/gallery/settings', { method: 'PUT', body: JSON.stringify(settings) })
      setSavedSettings(true)
      setTimeout(() => setSavedSettings(false), 3000)
      toast.success('Réglages enregistrés')
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddImage = async () => {
    if (!newImage.title || !newImage.imageUrl) {
      toast.error('Remplissez au moins le titre et l\'image')
      return
    }

    setSaving(true)
    try {
      const image = await adminJson<GalleryImage>('/api/gallery/images', { method: 'POST', body: JSON.stringify(newImage) })
      setImages([...images, image])
      setNewImage({ title: '', description: '', imageUrl: '', category: '' })
      toast.success('Image ajoutée')
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (id: string) => {
    if (!(await confirm({ title: 'Supprimer l’image', message: 'Cette action est irréversible.', danger: true, confirmLabel: 'Supprimer' }))) return

    try {
      await adminJson(`/api/gallery/images/${id}`, { method: 'DELETE' })
      setImages(images.filter((img) => img._id !== id))
      toast.success('Image supprimée')
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    }
  }

  const handleToggleImage = async (id: string, active: boolean) => {
    try {
      const image = images.find((img) => img._id === id)
      if (!image) return
      await adminJson(`/api/gallery/images/${id}`, { method: 'PUT', body: JSON.stringify({ ...image, active: !active }) })
      setImages(images.map((img) => (img._id === id ? { ...img, active: !active } : img)))
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    }
  }

  if (loading) return <AdminLoading />

  const visibleCount = images.filter((img) => img.active).length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 pt-8 md:pt-0">
          <Link
            href="/admin/dashboard"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">Galerie Photos</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Images className="size-3.5" />
              {images.length} image{images.length > 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
              <Eye className="size-3.5" />
              {visibleCount} visible{visibleCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Top : réglages + ajout (2 colonnes) */}
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* Settings - Hero */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-5 py-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                Section d&apos;en-tête (Hero)
              </h3>
              <label className="flex cursor-pointer items-center gap-2">
                <div
                  className={cn('relative h-5 w-9 rounded-full transition-colors', settings.enabled ? 'bg-primary' : 'bg-muted-foreground/30')}
                  onClick={() => {
                    const newSettings = { ...settings, enabled: !settings.enabled }
                    setSettings(newSettings)
                    adminJson('/api/gallery/settings', { method: 'PUT', body: JSON.stringify(newSettings) })
                      .then(() => toast.success(newSettings.enabled ? 'Galerie affichée sur le site' : 'Galerie masquée'))
                      .catch((err) => {
                        setSettings(settings)
                        const message = errorMessage(err)
                        if (message) toast.error(message)
                      })
                  }}
                >
                  <div className={cn('absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform', settings.enabled && 'translate-x-4')} />
                </div>
                <span className="text-xs text-muted-foreground">{settings.enabled ? 'Visible' : 'Masquée'}</span>
              </label>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Petit texte au-dessus du titre
                </Label>
                <Input
                  value={settings.eyebrow || ''}
                  onChange={(e) => setSettings({ ...settings, eyebrow: e.target.value })}
                  placeholder="Galerie"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Titre principal
                </Label>
                <Input
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="Nos réalisations"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </Label>
                <textarea
                  value={settings.description || ''}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire."
                  rows={2}
                  className="w-full min-w-0 resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <ImageField
                label="Image de fond du Hero"
                value={settings.heroImage || ''}
                onChange={(v) => setSettings({ ...settings, heroImage: v })}
              />
              <p className="-mt-2 text-[11px] text-muted-foreground/60">
                Image affichée en arrière-plan de la section d&apos;en-tête. Laissez vide pour un fond uni.
              </p>

              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className={cn('w-full gap-2', savedSettings && 'bg-emerald-600 hover:bg-emerald-600')}
              >
                {savedSettings ? <><Check className="size-4" /> Sauvegardé</> : <><Save className="size-4" /> {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}</>}
              </Button>
            </div>
          </div>

          {/* Add Image */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/40 bg-muted/30 px-5 py-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                <Plus className="size-3.5" />
                Ajouter une image
              </h3>
            </div>
            <div className="space-y-4 p-5">
              <ImageField
                label="Image"
                value={newImage.imageUrl}
                onChange={(v) => setNewImage({ ...newImage, imageUrl: v })}
              />

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titre</Label>
                <Input
                  id="title"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  placeholder="Titre de l'image"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</Label>
                  <Input
                    id="description"
                    value={newImage.description}
                    onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                    placeholder="Optionnelle"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Catégorie</Label>
                  <Input
                    id="category"
                    value={newImage.category}
                    onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                    placeholder="Ex : paysage, portrait..."
                  />
                </div>
              </div>

              <Button onClick={handleAddImage} disabled={saving} className="w-full gap-2">
                <Plus className="size-4" />
                {saving ? 'Ajout...' : 'Ajouter à la galerie'}
              </Button>
            </div>
          </div>
        </div>

        {/* Library grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Bibliothèque <span className="text-muted-foreground">({images.length})</span>
          </h2>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {images.map((image) => (
                <div
                  key={image._id}
                  className={cn(
                    'animate-fade-in group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-muted shadow-sm transition-all hover:shadow-md',
                    !image.active && 'opacity-70'
                  )}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className={cn(
                      'size-full object-cover transition-transform duration-300 group-hover:scale-105',
                      !image.active && 'grayscale'
                    )}
                  />

                  {/* État (visible / masquée) */}
                  <span
                    className={cn(
                      'absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur',
                      image.active
                        ? 'bg-emerald-500/85 text-white'
                        : 'bg-zinc-900/70 text-white'
                    )}
                  >
                    {image.active ? <Eye className="size-2.5" /> : <EyeOff className="size-2.5" />}
                    {image.active ? 'Visible' : 'Masquée'}
                  </span>

                  {/* Actions au survol */}
                  <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleToggleImage(image._id, image.active)}
                      title={image.active ? 'Masquer' : 'Afficher'}
                      className="rounded-md bg-black/55 p-1.5 text-white backdrop-blur transition-colors hover:bg-black/75"
                    >
                      {image.active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image._id)}
                      title="Supprimer"
                      className="rounded-md bg-black/55 p-1.5 text-white backdrop-blur transition-colors hover:bg-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Légende */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2.5 pt-6">
                    <p className="truncate text-sm font-medium text-white">{image.title}</p>
                    {image.category && (
                      <p className="truncate text-[11px] text-white/70">{image.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
              <ImageOff className="mx-auto mb-3 size-10 text-muted-foreground/20" />
              <p className="font-medium text-muted-foreground">Aucune image pour le moment</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Ajoutez votre première image avec le formulaire ci-dessus.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
