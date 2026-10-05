'use client'

import {
  ArrowLeft,
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  ExternalLink,
  Eye,
  Maximize2,
  Monitor,
  RefreshCw,
  Save,
  Smartphone,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { AdminLoading } from '@/components/admin/admin-ui'
import { useToast } from '@/components/admin/toast'
import { Button } from '@/components/ui/button'
import { type PageId, pageDefaults, pagePaths } from '@/content/pages'
import { adminJson, errorMessage } from '@/lib/admin-session'
import { deepMerge } from '@/lib/merge'
import { cn } from '@/lib/utils'

/* eslint-disable @typescript-eslint/no-explicit-any -- contenu éditable libre, typé par src/content/pages.ts */

interface PageEditorProps {
  pageId: PageId
  title: string
  children: (content: Record<string, any>, updateField: (path: string, value: any) => void) => React.ReactNode
}

/* ── Repli/dépli global des sections ────────────────────────── */
const ExpandContext = createContext<boolean>(true)

export function useSectionsExpanded() {
  return useContext(ExpandContext)
}

/** Délai avant de rafraîchir l'aperçu après une frappe. */
const PREVIEW_DEBOUNCE_MS = 700

/**
 * Éditeur d'une page du site.
 *
 * - Les valeurs par défaut viennent de src/content/pages.ts (les mêmes que le
 *   site) : jamais de champ vide à l'ouverture, mêmes noms de champs des deux côtés.
 * - L'aperçu est la VRAIE page du site (/apercu/[pageId]) rendue avec le
 *   brouillon en cours : il ne peut pas mentir sur le rendu.
 * - Tous les appels passent par adminJson : une session expirée renvoie à la
 *   connexion, une erreur serveur s'affiche (jamais de faux « Enregistré »).
 */
export function PageEditor({ pageId, title, children }: PageEditorProps) {
  const { toast } = useToast()
  const defaults = pageDefaults[pageId] as Record<string, any>
  const [content, setContent] = useState<Record<string, any>>(defaults)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [draftKey, setDraftKey] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const modalIframeRef = useRef<HTMLIFrameElement | null>(null)
  const railIframeRef = useRef<HTMLIFrameElement | null>(null)
  const [expanded, setExpanded] = useState(true)

  const previewPath = pagePaths[pageId]
  const hash = pageId === 'testimonials' ? '#temoignages' : ''
  const previewSrc = `/apercu/${pageId}?${new URLSearchParams({
    ...(draftKey ? { brouillon: draftKey } : {}),
    v: String(reloadToken),
  }).toString()}${hash}`

  // Chargement : écarts enregistrés fusionnés sur les valeurs par défaut.
  useEffect(() => {
    let cancelled = false
    adminJson<{ content?: Record<string, unknown>; database?: boolean }>(`/api/content/${pageId}`)
      .then((result) => {
        if (cancelled) return
        if (result.database === false) {
          setLoadError('Base de données non configurée : les modifications ne pourront pas être enregistrées.')
        }
        setContent(deepMerge(defaults, result.content ?? {}))
      })
      .catch((err) => {
        const message = errorMessage(err)
        if (message && !cancelled) setLoadError(`Contenu enregistré illisible : ${message}`)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [pageId, defaults])

  // Aperçu en direct : le brouillon est déposé côté serveur, puis l'aperçu se recharge.
  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(() => {
      adminJson<{ key: string }>(`/api/content/${pageId}/brouillon`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
        .then(({ key }) => setDraftKey(key))
        .catch(() => {
          // Aperçu indisponible (base absente) : l'édition reste possible.
        })
    }, PREVIEW_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [content, dirty, pageId])

  // Avertir avant de quitter si des modifications ne sont pas enregistrées.
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const updateField = useCallback((path: string, value: any) => {
    setSaved(false)
    setDirty(true)
    setContent((prev) => {
      const keys = path.split('.')
      const next = structuredClone(prev)
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in obj) || typeof obj[keys[i]] !== 'object') obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }, [])

  const reloadRail = () => setReloadToken((t) => t + 1)

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminJson(`/api/content/${pageId}`, { method: 'PUT', body: JSON.stringify({ content }) })
      setSaved(true)
      setDirty(false)
      toast.success('Modifications enregistrées et publiées')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLoading />
  }

  return (
    <ExpandContext.Provider value={expanded}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header sticky */}
        <div className="sticky top-0 z-20 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-3.5 bg-background/80 backdrop-blur border-b border-border mb-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto pt-8 md:pt-0">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
                <p className="flex items-center gap-1.5 text-[11px] font-medium">
                  {dirty ? (
                    <>
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      <span className="text-amber-600">Modifications non enregistrées</span>
                    </>
                  ) : (
                    <>
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">À jour</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button onClick={() => setExpanded((v) => !v)} variant="outline" size="sm">
                {expanded ? <ChevronsDownUp className="size-3.5" /> : <ChevronsUpDown className="size-3.5" />}
                <span className="hidden sm:inline">{expanded ? 'Tout replier' : 'Tout déplier'}</span>
              </Button>
              {previewPath && (
                <Button onClick={() => setPreviewOpen(true)} variant="outline" size="sm">
                  <Eye className="size-3.5" />
                  <span className="hidden sm:inline">Aperçu</span>
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !dirty}
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
        </div>

        {loadError && (
          <p role="alert" className="mx-auto mb-6 max-w-6xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            {loadError}
          </p>
        )}

        {/* Layout 2 colonnes : éditeur + aperçu live sticky */}
        <div
          className={cn(
            'mx-auto grid max-w-6xl items-start gap-6',
            previewPath
              ? 'lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_440px]'
              : 'max-w-3xl'
          )}
        >
          <div 
            className="animate-fade-in min-w-0 space-y-3">
            {children(content, updateField)}
          </div>

          {previewPath && (
            <aside className="sticky top-[92px] hidden lg:block">
              <div className="flex h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {/* En-tête du rail */}
                <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="relative flex size-2 shrink-0">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="truncate text-xs font-semibold text-foreground">Aperçu en direct</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={reloadRail}
                      title="Recharger l'aperçu"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <RefreshCw className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      title="Plein écran"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Maximize2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Iframe live */}
                <div className="relative flex-1 bg-white">
                  <iframe
                    ref={railIframeRef}
                    src={previewSrc}
                    className="absolute inset-0 size-full"
                    title="Aperçu en direct de la page"
                  />
                </div>
              </div>
            </aside>
          )}
        </div>

        {previewOpen && previewPath && (
          <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex flex-col p-3 sm:p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <div
              className="relative w-full h-full bg-zinc-100 rounded-xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/40 bg-white">
                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate min-w-0">
                  <Eye className="size-3.5 shrink-0" />
                  <span className="font-medium">Aperçu</span>
                  <span className="truncate hidden sm:inline">{previewPath}</span>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-0.5">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    title="Ordinateur"
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                      previewDevice === 'desktop'
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Monitor className="size-3.5" />
                    <span className="hidden sm:inline">Ordinateur</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    title="Mobile"
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                      previewDevice === 'mobile'
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Smartphone className="size-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={previewPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ouvrir dans un onglet"
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    title="Fermer"
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto flex items-start justify-center p-4 sm:p-6">
                <div
                  className={cn(
                    'bg-white shadow-lg transition-all duration-300 overflow-hidden',
                    previewDevice === 'mobile'
                      ? 'w-[390px] h-[780px] max-w-full max-h-full rounded-[28px] border-[10px] border-zinc-900'
                      : 'w-full h-full rounded-md'
                  )}
                >
                  <iframe
                    ref={modalIframeRef}
                    src={previewSrc}
                    className="w-full h-full bg-white"
                    title="Aperçu de la page"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ExpandContext.Provider>
  )
}
