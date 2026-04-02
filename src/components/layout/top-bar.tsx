'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

const message =
  'Offre de lancement \u2014 Profitez de -20\u00a0% sur nos services jusqu\u2019au 30 avril'

export function TopBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="relative z-50 overflow-hidden bg-primary/90 text-primary-foreground">
      <div className="flex h-7 items-center">
        <div className="animate-marquee-bar flex shrink-0 items-center gap-16 whitespace-nowrap text-[11px] font-medium tracking-wide opacity-75">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>{message}</span>
          ))}
        </div>
        <div className="animate-marquee-bar flex shrink-0 items-center gap-16 whitespace-nowrap text-[11px] font-medium tracking-wide opacity-75" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>{message}</span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-primary/60 p-0.5 opacity-50 transition-opacity hover:opacity-100"
        aria-label="Fermer la bannière"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
