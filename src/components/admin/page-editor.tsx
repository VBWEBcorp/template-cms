'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageEditorProps {
  pageId: string
  title: string
  defaultContent: Record<string, any>
  children: (
    content: Record<string, any>,
    updateField: (path: string, value: any) => void
  ) => React.ReactNode
}

export function PageEditor({ pageId, title, defaultContent, children }: PageEditorProps) {
  const [content, setContent] = useState(defaultContent)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${pageId}`)
        const result = await response.json()

        if (result.content && Object.keys(result.content).length > 0) {
          setContent({ ...defaultContent, ...result.content })
        }
      } catch (error) {
        console.error('Failed to load content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  const updateField = useCallback((path: string, value: any) => {
    setSaved(false)
    setContent((prev) => {
      const keys = path.split('.')
      const newContent = JSON.parse(JSON.stringify(prev))
      let obj = newContent
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in obj)) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return newContent
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/content/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 bg-muted/30 backdrop-blur-sm border-b border-border/30 mb-6">
        <div className="flex items-center justify-between max-w-4xl pt-8 md:pt-0">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className={saved ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
          >
            {saved ? (
              <>
                <Check className="size-3.5" />
                Sauvegardé
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </>
            )}
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 max-w-4xl"
      >
        {children(content, updateField)}
      </motion.div>
    </div>
  )
}
