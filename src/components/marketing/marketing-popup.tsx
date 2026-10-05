'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { MarketingPopupCard } from '@/components/marketing/popup-card'
import { type MarketingSettings, campaignKey } from '@/lib/marketing'

const STORAGE_KEY = 'popup-fermee'

/**
 * Popup marketing du site. Les réglages arrivent du serveur (aucun appel
 * réseau au chargement) ; la popup s'ouvre après le délai réglé, une fois par
 * session et par campagne.
 *
 * Test : ouvrir une page avec `?apercu-popup=1` force l'affichage immédiat,
 * sans rien mémoriser (bouton « Tester sur le site » de l'admin).
 */
export function MarketingPopup({ settings }: { settings: MarketingSettings }) {
  const [open, setOpen] = useState(false)
  const [forced, setForced] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const key = `${STORAGE_KEY}:${campaignKey(settings)}`

  useEffect(() => {
    const test = new URLSearchParams(window.location.search).get('apercu-popup') === '1'
    if (!test) {
      try {
        if (sessionStorage.getItem(key)) return
      } catch {
        // stockage indisponible : on affiche quand même
      }
    }
    const timer = setTimeout(
      () => {
        setForced(test)
        setOpen(true)
      },
      test ? 0 : settings.delay * 1000
    )
    return () => clearTimeout(timer)
  }, [key, settings.delay])

  const close = useCallback(() => {
    setOpen(false)
    if (forced) return
    try {
      sessionStorage.setItem(key, '1')
    } catch {
      // rien à faire
    }
  }, [forced, key])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    cardRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={close}>
      <div className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-md" aria-hidden />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={settings.title || 'Annonce'}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in relative z-10 w-full max-w-[420px] outline-none"
      >
        <MarketingPopupCard settings={settings} onClose={close} />
        {forced && (
          <p className="mt-3 text-center text-[11px] font-medium tracking-wide text-white/80">
            Aperçu forcé (visible seulement avec ?apercu-popup=1)
          </p>
        )}
      </div>
    </div>
  )
}
