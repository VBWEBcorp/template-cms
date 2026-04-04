'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'

interface GalleryImage {
  _id: string
  title: string
  description?: string
  imageUrl: string
  category?: string
}

interface GallerySettings {
  enabled: boolean
  title: string
  description?: string
}

export default function GalleryPage() {
  const [settings, setSettings] = useState<GallerySettings | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGallery = async () => {
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

    fetchGallery()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!settings?.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">La galerie n'est pas disponible pour le moment</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {settings.title}
          </h1>
          {settings.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {settings.description}
            </p>
          )}
        </motion.div>

        {/* Gallery Grid */}
        {images.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {images.map((image) => (
              <motion.div
                key={image._id}
                variants={itemVariants}
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <Image
                        src={image.imageUrl}
                        alt={image.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">
                        {image.title}
                      </h3>
                      {image.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {image.description}
                        </p>
                      )}
                      {image.category && (
                        <div className="mt-3">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {image.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">Aucune image dans la galerie</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
