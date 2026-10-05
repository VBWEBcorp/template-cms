'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { type CSSProperties, useEffect, useRef, useState } from 'react'

export type GalleryGridItem = { id: string; title: string; description: string; imageUrl: string; category: string }

/**
 * Grille de la galerie + visionneuse. La grille est rendue côté serveur ; la
 * visionneuse utilise <dialog> (Échap, focus et fond gérés par le navigateur).
 */
export function GalleryGrid({ images }: { images: GalleryGridItem[] }) {
  const [current, setCurrent] = useState<GalleryGridItem | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (current && !dialog.open) dialog.showModal()
    if (!current && dialog.open) dialog.close()
  }, [current])

  return (
    <>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image, i) => (
          <li key={image.id} className="animate-fade-up" style={{ '--delay': `${Math.min(i, 8) * 60}ms` } as CSSProperties}>
            <button
              type="button"
              onClick={() => setCurrent(image)}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/50 bg-card text-left transition-all hover:border-primary/20 hover:shadow-lg"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={image.imageUrl}
                  alt={image.title}
                  fill
                  sizes="(min-width: 1152px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              <span className="block space-y-2 p-5">
                <span className="block font-display font-semibold text-foreground transition-colors group-hover:text-primary">
                  {image.title}
                </span>
                {image.description && (
                  <span className="line-clamp-2 block text-sm leading-relaxed text-muted-foreground">{image.description}</span>
                )}
                {image.category && (
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {image.category}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setCurrent(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCurrent(null)
        }}
        aria-label={current?.title}
        className="m-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-card p-0 shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        {current && (
          <div className="animate-scale-in relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- taille réelle de l'image, à la demande */}
            <img
              src={current.imageUrl}
              alt={current.title}
              decoding="async"
              className="h-auto max-h-[70vh] w-full bg-black object-contain"
            />
            <div className="p-5">
              <p className="font-display text-lg font-bold text-foreground">{current.title}</p>
              {current.description && <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => setCurrent(null)}
              aria-label="Fermer"
              className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </dialog>
    </>
  )
}
