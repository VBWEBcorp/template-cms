import { ArrowRight, X } from 'lucide-react'
import type { CSSProperties } from 'react'

import { type MarketingSettings, safeLink } from '@/lib/marketing'

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

/**
 * Carte de la popup marketing. LE rendu de la popup : le site (MarketingPopup)
 * et l'aperçu de l'admin affichent exactement ce composant.
 */
export function MarketingPopupCard({
  settings,
  onClose,
  preview = false,
}: {
  settings: MarketingSettings
  onClose?: () => void
  /** Aperçu de l'admin : le bouton ne navigue pas. */
  preview?: boolean
}) {
  const link = safeLink(settings.buttonLink)

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4)]"
      style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 size-40 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: settings.buttonColor }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 size-32 rounded-full opacity-15 blur-3xl"
        style={{ backgroundColor: settings.buttonColor }}
      />

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="animate-scale-in absolute top-4 right-4 z-20 flex size-9 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-black/5 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/10"
          style={{ color: settings.textColor, ...delay(300) }}
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
      )}

      {settings.imageUrl && (
        <div className="relative h-52 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- adresse libre saisie dans l'admin */}
          <img
            src={settings.imageUrl}
            alt=""
            width={420}
            height={208}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-20"
            style={{ background: `linear-gradient(to top, ${settings.bgColor}, transparent)` }}
          />
        </div>
      )}

      <div className={`relative px-7 ${settings.imageUrl ? 'pt-1 pb-7' : 'py-8'}`}>
        {!settings.imageUrl && <div className="mb-5 h-1 w-12 rounded-full" style={{ backgroundColor: settings.buttonColor }} />}

        <p className="animate-fade-up pr-10 text-2xl leading-tight font-extrabold tracking-tight" style={delay(150)}>
          {settings.title || 'Titre'}
        </p>

        {settings.description && (
          <p className="animate-fade-up mt-3 text-sm leading-relaxed opacity-70" style={delay(250)}>
            {settings.description}
          </p>
        )}

        {settings.buttonText && (
          <div className="animate-fade-up mt-6" style={delay(350)}>
            <a
              href={link?.href ?? '#'}
              {...(link?.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onClick={(e) => {
                if (preview || !link) e.preventDefault()
                onClose?.()
              }}
              className="group inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              style={{ backgroundColor: settings.buttonColor, boxShadow: `0 4px 14px -3px ${settings.buttonColor}80` }}
            >
              {settings.buttonText}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
