'use client'

import { useRef, useState } from 'react'
import { Upload, Link as LinkIcon, X, Loader2, ImageIcon, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/admin/toast'
import { adminFetch, errorMessage } from '@/lib/admin-session'
import { useSectionsExpanded } from '@/components/admin/page-editor'
import { cn } from '@/lib/utils'

interface FieldEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'textarea' | 'url'
  placeholder?: string
  /** Force le champ sur toute la largeur de la grille. */
  wide?: boolean
}

export function FieldEditor({ label, value, onChange, type = 'text', placeholder, wide }: FieldEditorProps) {
  const fullWidth = wide || type === 'textarea'
  return (
    <div className={cn('space-y-1.5', fullWidth && 'md:col-span-2')}>
      <Label className="text-[13px] font-medium text-foreground/80">{label}</Label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type === 'url' ? 'url' : 'text'}
          className="bg-background"
        />
      )}
    </div>
  )
}

interface SectionEditorProps {
  title: string
  description?: string
  /** Icône affichée dans l'en-tête de la section. */
  icon?: React.ComponentType<{ className?: string }>
  /** Disposition des enfants : 2 colonnes (défaut) ou 1 colonne. */
  cols?: 1 | 2
  children: React.ReactNode
}

export function SectionEditor({ title, description, icon: Icon, cols = 2, children }: SectionEditorProps) {
  const expandedAll = useSectionsExpanded()
  const [open, setOpen] = useState(expandedAll)
  // Suit le bouton global « Tout replier / Tout déplier » (ajustement pendant le rendu).
  const [lastExpandedAll, setLastExpandedAll] = useState(expandedAll)
  if (expandedAll !== lastExpandedAll) {
    setLastExpandedAll(expandedAll)
    setOpen(expandedAll)
  }

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border bg-card transition-all duration-200',
        open ? 'border-border shadow-sm' : 'border-border/70 hover:border-border hover:shadow-sm'
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-[18px]" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>}
        </div>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
              {open && (
          <div
            key="content" 
            className="animate-fade-in overflow-hidden">
            <div
              className={cn(
                'grid grid-cols-1 gap-x-5 gap-y-4 border-t border-border/60 p-5',
                cols === 2 && 'md:grid-cols-2'
              )}
            >
              {children}
            </div>
          </div>
        )}
          </section>
  )
}

interface ImageFieldProps {
  label?: string
  value: string
  onChange: (value: string) => void
}

export function ImageField({ label, value, onChange }: ImageFieldProps) {
  const { toast } = useToast()
  const [mode, setMode] = useState<'link' | 'upload'>(
    value && !value.startsWith('/uploads') && !value.includes('r2') ? 'link' : 'upload'
  )
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadInfo, setUploadInfo] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      // adminFetch : jeton posé, session expirée traitée (redirection vers la connexion).
      const response = await adminFetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de l’envoi de l’image')
        return
      }
      onChange(data.url)
      setUploadInfo(`${data.originalSize} → ${data.optimizedSize} (${data.storage})`)
      toast.success('Image importée')
    } catch (err) {
      const message = errorMessage(err)
      if (message) toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleUpload(file)
    }
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <div className={cn('flex items-center', label ? 'justify-between' : 'justify-end')}>
        {label && <Label className="text-[13px] font-medium text-foreground/80">{label}</Label>}
        <div className="flex gap-1 rounded-lg bg-muted/60 p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={cn(
              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              mode === 'upload'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Upload className="size-3" />
            Envoyer
          </button>
          <button
            type="button"
            onClick={() => setMode('link')}
            className={cn(
              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              mode === 'link'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LinkIcon className="size-3" />
            Lien
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Preview */}
        {value ? (
          <div className="group relative w-full shrink-0 sm:w-44">
            <div className="aspect-video overflow-hidden rounded-lg border border-border/50 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              title="Retirer l'image"
              className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="flex aspect-video w-full shrink-0 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/40 text-muted-foreground/40 sm:w-44">
            <ImageIcon className="size-7" />
          </div>
        )}

        {/* Input zone */}
        <div className="min-w-0 flex-1">
          {mode === 'link' ? (
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              type="url"
              className="bg-background"
            />
          ) : (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-5 text-center transition-colors cursor-pointer',
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-primary/40 hover:bg-muted/40',
                  uploading && 'pointer-events-none opacity-60'
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Envoi en cours…</span>
                  </>
                ) : (
                  <>
                    <Upload className="size-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Cliquez ou glissez une image</span>
                    <span className="text-[11px] text-muted-foreground/70">JPG, PNG, WebP ou GIF, 10 Mo maximum</span>
                  </>
                )}
              </div>
            </>
          )}
          {value && mode === 'upload' && (
            <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{value}</p>
          )}
          {uploadInfo && <p className="mt-0.5 text-[11px] text-primary">{uploadInfo}</p>}
        </div>
      </div>
    </div>
  )
}
