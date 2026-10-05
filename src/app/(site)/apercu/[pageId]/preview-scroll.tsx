'use client'

import { useEffect } from 'react'

/**
 * L'aperçu se recharge à chaque modification : on garde la position de
 * défilement pour que l'éditeur ne remonte pas en haut de page à chaque frappe.
 */
export function PreviewScroll({ pageId }: { pageId: string }) {
  useEffect(() => {
    const key = `apercu-scroll:${pageId}`
    try {
      const saved = Number(sessionStorage.getItem(key))
      if (saved > 0) window.scrollTo({ top: saved, behavior: 'instant' })
    } catch {
      // rien
    }
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        try {
          sessionStorage.setItem(key, String(Math.round(window.scrollY)))
        } catch {
          // rien
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pageId])
  return null
}
