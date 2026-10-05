import { ArrowRight } from 'lucide-react'

import { type MarketingSettings, safeLink } from '@/lib/marketing'
import { cx as cn } from '@/lib/cx'

/**
 * Bandeau d'annonce au-dessus de la barre de navigation.
 * LE rendu du bandeau : l'aperçu de l'admin affiche exactement ce composant.
 */
export function MarketingBannerBar({
  settings,
  preview = false,
  className,
}: {
  settings: MarketingSettings
  /** Aperçu de l'admin : pas de navigation. */
  preview?: boolean
  className?: string
}) {
  const { bgColor, textColor } = settings.banner
  const link = safeLink(settings.banner.link)
  const label = settings.banner.text || (preview ? 'Votre annonce apparaît ici' : '')

  const inner = (
    <span className="inline-flex items-center gap-2">
      {label}
      {link && <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />}
    </span>
  )

  return (
    <div className={cn('w-full', className)} style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-center overflow-hidden px-4 text-center text-[13px] font-medium tracking-wide">
        {link && !preview ? (
          <a
            href={link.href}
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="group truncate transition-opacity hover:opacity-80"
          >
            {inner}
          </a>
        ) : (
          <span className="truncate">{inner}</span>
        )}
      </div>
    </div>
  )
}
