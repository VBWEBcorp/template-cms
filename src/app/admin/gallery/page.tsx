'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Check, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
}

export default function AdminGalleryPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<GallerySettings>({ enabled: false, title: 'Galerie' })
  const [images, setImages] = useState<GalleryImage[]>([])
  const [newImage, setNewImage] = useState({ title: '', description: '', imageUrl: '', category: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Vérifier auth
  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/admin/login')
    }
  }, [router])

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, imagesRes] = await Promise.all([
          fetch('/api/gallery/settings'),
          fetch('/api/gallery/images'),
        ])

        const settingsData = await settingsRes.json()
        const imagesData = await imagesRes.json()

        setSettings(settingsData)
        setImages(imagesData)
      } catch (error) {
        console.error('Failed to load gallery:', error)
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
      const response = await fetch('/api/gallery/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('✅ Paramètres sauvegardés')
      }
    } catch (error) {
      alert('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddImage = async () => {
    if (!newImage.title || !newImage.imageUrl) {
      alert('Remplissez au moins le titre et l\'URL')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/gallery/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newImage),
      })

      if (response.ok) {
        const image = await response.json()
        setImages([...images, image])
        setNewImage({ title: '', description: '', imageUrl: '', category: '' })
        alert('✅ Image ajoutée')
      }
    } catch (error) {
      alert('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Êtes-vous sûr?')) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/gallery/images/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        setImages(images.filter(img => img._id !== id))
        alert('✅ Image supprimée')
      }
    } catch (error) {
      alert('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    }
  }

  const handleToggleImage = async (id: string, active: boolean) => {
    try {
      const token = localStorage.getItem('authToken')
      const image = images.find(img => img._id === id)
      if (!image) return

      const response = await fetch(`/api/gallery/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...image, active: !active }),
      })

      if (response.ok) {
        setImages(images.map(img =>
          img._id === id ? { ...img, active: !active } : img
        ))
      }
    } catch (error) {
      alert('❌ Erreur')
    }
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin/dashboard"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Galerie Photos</h1>
      </div>
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de la galerie</CardTitle>
          <CardDescription>Activez/désactivez la galerie et modifiez ses informations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="enabled" className="flex items-center gap-2 cursor-pointer">
              <input
                id="enabled"
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="size-4"
              />
              <span>Galerie activée</span>
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="galleryTitle">Titre</Label>
            <Input
              id="galleryTitle"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="Galerie"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="galleryDesc">Description</Label>
            <Input
              id="galleryDesc"
              value={settings.description || ''}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Description optionnelle"
            />
          </div>

          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full gap-2"
          >
            <Check className="size-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </Button>
        </CardContent>
      </Card>

      {/* Add Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter une image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={newImage.title}
              onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              placeholder="Titre de l'image"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newImage.description}
              onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
              placeholder="Description optionnelle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de l'image</Label>
            <Input
              id="imageUrl"
              value={newImage.imageUrl}
              onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              value={newImage.category}
              onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
              placeholder="Ex: paysage, portrait..."
            />
          </div>

          <Button
            onClick={handleAddImage}
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Ajout...' : 'Ajouter l\'image'}
          </Button>
        </CardContent>
      </Card>

      {/* Images List */}
      <Card>
        <CardHeader>
          <CardTitle>Images ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="space-y-3">
              {images.map((image) => (
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{image.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{image.imageUrl}</p>
                    {image.category && (
                      <p className="text-xs text-primary mt-1">{image.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleToggleImage(image._id, image.active)}
                      title={image.active ? 'Désactiver' : 'Activer'}
                    >
                      {image.active ? (
                        <Check className="size-4 text-primary" />
                      ) : (
                        <X className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteImage(image._id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune image</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
