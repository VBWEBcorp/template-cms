'use client'

import { ChevronDown, ChevronUp, Plus, Search, Trash2 } from 'lucide-react'

import { FieldEditor, ImageField, SectionEditor } from '@/components/admin/field-editor'
import { Button } from '@/components/ui/button'
import { DESCRIPTION_MAX, TITLE_MAX } from '@/lib/seo'
import { ICON_NAMES } from '@/lib/icons'
import { cn } from '@/lib/utils'

/* eslint-disable @typescript-eslint/no-explicit-any -- éléments de listes éditables libres */

/** Boutons monter / descendre / supprimer d'un élément de liste. */
function ItemActions({
  index,
  count,
  onMove,
  onRemove,
  label,
}: {
  index: number
  count: number
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  label: string
}) {
  const btn = 'rounded-md p-1 text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:opacity-30'
  return (
    <div className="flex items-center gap-1">
      <button type="button" title="Monter" aria-label={`Monter ${label}`} disabled={index === 0} onClick={() => onMove(index, index - 1)} className={btn}>
        <ChevronUp className="size-4" />
      </button>
      <button
        type="button"
        title="Descendre"
        aria-label={`Descendre ${label}`}
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        className={btn}
      >
        <ChevronDown className="size-4" />
      </button>
      <button
        type="button"
        title="Supprimer"
        aria-label={`Supprimer ${label}`}
        onClick={() => onRemove(index)}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/**
 * Liste d'éléments éditables (services, valeurs, questions...). `blank` est
 * l'élément ajouté par « Ajouter » : il porte des textes d'exemple, jamais
 * des champs vides qui laisseraient un trou sur le site.
 */
export function ListEditor<T extends Record<string, any>>({
  items,
  onChange,
  itemLabel,
  blank,
  renderItem,
  max = 30,
}: {
  items: T[]
  onChange: (items: T[]) => void
  itemLabel: string
  blank: T
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode
  max?: number
}) {
  return (
    <div className="space-y-3 md:col-span-2">
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border/50 bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/70">
              {itemLabel} {i + 1}
            </span>
            <ItemActions
              index={i}
              count={items.length}
              label={`${itemLabel} ${i + 1}`}
              onMove={(from, to) => onChange(move(items, from, to))}
              onRemove={(idx) => onChange(items.filter((_, j) => j !== idx))}
            />
          </div>
          {renderItem(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))), i)}
        </div>
      ))}
      {items.length < max && (
        <Button type="button" variant="outline" className="w-full gap-2" onClick={() => onChange([...items, structuredClone(blank)])}>
          <Plus className="size-4" />
          Ajouter : {itemLabel.toLowerCase()}
        </Button>
      )}
    </div>
  )
}

/** Liste d'images (carrousel, galerie). */
export function ImageListEditor({ images, onChange, label }: { images: string[]; onChange: (images: string[]) => void; label: string }) {
  return (
    <div className="space-y-3 md:col-span-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      {images.map((img, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/70">Image {i + 1}</span>
            <ItemActions
              index={i}
              count={images.length}
              label={`l'image ${i + 1}`}
              onMove={(from, to) => onChange(move(images, from, to))}
              onRemove={(idx) => onChange(images.filter((_, j) => j !== idx))}
            />
          </div>
          <ImageField value={img} onChange={(v) => onChange(images.map((x, j) => (j === i ? v : x)))} />
        </div>
      ))}
      <Button type="button" variant="outline" className="w-full gap-2" onClick={() => onChange([...images, ''])}>
        <Plus className="size-4" />
        Ajouter une image
      </Button>
    </div>
  )
}

/** Choix d'une icône parmi celles que le site sait afficher (src/lib/icons.ts). */
export function IconSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-foreground/80">
        Icône
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 block w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function Counter({ length, max }: { length: number; max: number }) {
  return (
    <span className={cn('text-[11px] tabular-nums', length > max ? 'font-semibold text-red-600' : 'text-muted-foreground')}>
      {length} / {max} caractères
    </span>
  )
}

/** Balises title et meta description d'une page, avec compteurs et aperçu Google. */
export function SeoEditor({
  seo,
  onChange,
  path,
}: {
  seo: { title: string; description: string }
  onChange: (path: 'seo.title' | 'seo.description', value: string) => void
  path: string
}) {
  return (
    <SectionEditor title="Référencement (Google)" icon={Search} description="Titre et description affichés dans les résultats de recherche" cols={1}>
      <div className="space-y-1">
        <FieldEditor label="Titre de la page" value={seo.title} onChange={(v) => onChange('seo.title', v)} />
        <Counter length={seo.title.length} max={TITLE_MAX} />
      </div>
      <div className="space-y-1">
        <FieldEditor label="Description" type="textarea" value={seo.description} onChange={(v) => onChange('seo.description', v)} />
        <Counter length={seo.description.length} max={DESCRIPTION_MAX} />
      </div>
      <div className="space-y-1 rounded-lg border border-border/40 bg-muted/20 p-4">
        <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Aperçu Google</p>
        <p className="truncate text-base font-medium text-[#1a0dab]">{seo.title}</p>
        <p className="truncate text-xs text-[#006621]">{path}</p>
        <p className="line-clamp-2 text-xs text-[#545454]">{seo.description}</p>
      </div>
    </SectionEditor>
  )
}
