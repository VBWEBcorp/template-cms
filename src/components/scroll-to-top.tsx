'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cx as cn } from '@/lib/cx'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      }}
      aria-label="Retour en haut"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        'group/scroll fixed right-6 bottom-6 z-[90] flex size-11 items-center justify-center overflow-hidden rounded-full text-primary-foreground shadow-[var(--shadow-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-primary-hover)] active:scale-95 sm:size-12',
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-75 opacity-0'
      )}
    >
      <span aria-hidden className="bg-brand-gradient absolute inset-0" />
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/scroll:translate-x-full"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
      <ArrowUp
        aria-hidden
        strokeWidth={2.25}
        className="relative size-5 transition-transform duration-300 group-hover/scroll:-translate-y-0.5"
      />
    </button>
  )
}
