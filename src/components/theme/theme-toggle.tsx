'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cx as cn } from '@/lib/cx'

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Le thème est posé avant hydratation par ThemeScript : on s'aligne une fois monté.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture d'un état du DOM après hydratation
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // stockage indisponible : le choix vaut pour la page en cours
    }
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:bg-foreground/[0.04] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
        className
      )}
      aria-label={dark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      aria-pressed={dark}
      onClick={toggle}
    >
      {dark ? <Sun className="size-[13px]" strokeWidth={1.5} /> : <Moon className="size-[13px]" strokeWidth={1.5} />}
    </button>
  )
}
