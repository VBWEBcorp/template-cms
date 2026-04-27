'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavLink {
  to: string
  label: string
}

const defaultLinks: NavLink[] = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Galerie' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<NavLink[]>(defaultLinks)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkFeatures = async () => {
      try {
        const [galleryRes, blogRes] = await Promise.all([
          fetch('/api/gallery/settings'),
          fetch('/api/blog/settings'),
        ])
        const gallery = await galleryRes.json()
        const blog = await blogRes.json()

        const dynamicLinks: NavLink[] = [
          { to: '/', label: 'Accueil' },
          { to: '/a-propos', label: 'À propos' },
          { to: '/services', label: 'Services' },
        ]

        if (gallery?.enabled !== false) dynamicLinks.push({ to: '/gallery', label: 'Galerie' })
        if (blog?.enabled !== false) dynamicLinks.push({ to: '/blog', label: 'Blog' })

        dynamicLinks.push({ to: '/contact', label: 'Contact' })
        setLinks(dynamicLinks)
      } catch {
        // Liens par défaut conservés en cas d'erreur
      }
    }

    checkFeatures()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <div
          className={cn(
            'flex h-14 items-center justify-between gap-2 rounded-2xl border border-border/60 bg-background/75 pl-4 pr-1.5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
            scrolled
              ? 'shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] border-border/80'
              : 'shadow-[0_4px_14px_-6px_rgba(15,23,42,0.08)]'
          )}
        >
          <Logo />

          <nav
            className="hidden items-center gap-0.5 lg:flex"
            aria-label="Navigation principale"
          >
            {links.map((l) => {
              const isActive = pathname === l.to
              return (
                <Link
                  key={l.to}
                  href={l.to}
                  className={cn(
                    'relative whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-lg bg-muted"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      aria-hidden
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <Button size="sm" className="hidden whitespace-nowrap rounded-xl sm:inline-flex" asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-0.5 p-3">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    href={l.to}
                    className={cn(
                      'rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted',
                      pathname === l.to
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-2 border-t border-border/60 pt-3">
                  <Button className="w-full rounded-full" asChild>
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      Nous contacter
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  )
}
