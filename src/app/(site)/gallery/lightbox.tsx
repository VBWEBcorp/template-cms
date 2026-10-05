'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Item = { src: string; title: string; description: string }

/**
 * Visionneuse de la galerie. La grille est rendue côté serveur ; chaque vignette
 * porte data-lightbox-src (et titre, description). Ce composant écoute les clics
 * et ouvre un <dialog> natif (Échap, focus et fond gérés par le navigateur).
 */
export function Lightbox() {
  const [item, setItem] = useState<Item | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox-src]')
      if (!trigger) return
      e.preventDefault()
      setItem({
        src: trigger.dataset.lightboxSrc ?? '',
        title: trigger.dataset.lightboxTitle ?? '',
        description: trigger.dataset.lightboxDescription ?? '',
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (item && !dialog.open) dialog.showModal()
    if (!item && dialog.open) dialog.close()
  }, [item])

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setItem(null)}
      onClick={(e) => {
        if (e.target === e.currentTarget) setItem(null)
      }}
      aria-label={item?.title}
      className="m-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-card p-0 shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      {item && (
        <div className="animate-scale-in relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- image pleine taille, chargée à la demande */}
          <img src={item.src} alt={item.title} decoding="async" className="h-auto max-h-[70vh] w-full bg-black object-contain" />
          <div className="p-5">
            <p className="font-display text-lg font-bold text-foreground">{item.title}</p>
            {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
          </div>
          <button
            type="button"
            onClick={() => setItem(null)}
            aria-label="Fermer"
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </dialog>
  )
}
