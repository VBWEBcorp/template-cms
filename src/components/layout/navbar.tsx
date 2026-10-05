'use client'

import { ArrowRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type CSSProperties, useEffect, useRef, useState } from 'react'

import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { cn } from '@/lib/utils'

type NavLink = { href: string; label: string }

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Barre de navigation. Seul îlot interactif de l'en-tête : défilement, menu
 * mobile et pastille de survol. Les liens arrivent du serveur (getNavLinks).
 */
export function Navbar({
  links,
  siteName,
  showThemeToggle,
}: {
  links: NavLink[]
  siteName: string
  showThemeToggle: boolean
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Le menu mobile se ferme à chaque changement de page.
  useEffect(() => setOpen(false), [pathname])

  const showPill = (el: HTMLElement) => {
    const nav = navRef.current
    if (!nav) return
    const a = el.getBoundingClientRect()
    const n = nav.getBoundingClientRect()
    setPill({ left: a.left - n.left, width: a.width })
  }

  return (
    <header className="fixed inset-x-0 top-[var(--banner-h,0px)] z-50 pt-3 sm:pt-4">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
        <div
          className={cn(
            'relative rounded-2xl transition-all duration-500',
            scrolled
              ? 'shadow-[0_20px_50px_-20px_oklch(0.2_0.02_264/0.25),0_0_0_1px_oklch(0.55_0.2_var(--brand-hue)/0.08)]'
              : 'shadow-[0_8px_24px_-12px_oklch(0.2_0.02_264/0.12)]'
          )}
        >
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute -inset-x-8 -inset-y-4 -z-10 rounded-[2rem] bg-gradient-to-r from-primary/0 via-primary/[0.07] to-primary/0 blur-2xl transition-opacity duration-700',
              scrolled ? 'opacity-100' : 'opacity-0'
            )}
          />
          <div aria-hidden className="gradient-ring rounded-2xl" />

          <div className="flex h-14 items-center justify-between gap-2 rounded-2xl bg-background/70 pr-1.5 pl-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 sm:pl-4">
            <Logo name={siteName} />

            <nav
              ref={navRef}
              className="relative hidden items-center gap-0.5 lg:flex"
              aria-label="Navigation principale"
              onMouseLeave={() => setPill(null)}
            >
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-y-0 rounded-xl bg-foreground/[0.07] ring-1 ring-foreground/[0.04] transition-all duration-300 ease-[var(--ease-out-soft)]',
                  pill ? 'opacity-100' : 'opacity-0'
                )}
                style={pill ? { left: pill.left, width: pill.width } : undefined}
              />
              {links.map((l) => {
                const active = isActive(pathname, l.href)
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    onMouseEnter={(e) => showPill(e.currentTarget)}
                    onFocus={(e) => showPill(e.currentTarget)}
                    className={cn(
                      'relative rounded-xl px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none',
                      active ? 'text-foreground' : 'text-foreground hover:text-primary'
                    )}
                  >
                    <span className={cn('relative', active && 'font-semibold')}>{l.label}</span>
                    {active && (
                      <span
                        aria-hidden
                        className="animate-fade-in absolute inset-x-3 bottom-0.5 h-[2px] rounded-full bg-primary"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5">
              {showThemeToggle && <ThemeToggle />}

              <Link
                href="/contact"
                className="group/cta relative hidden h-8 items-center gap-1.5 overflow-hidden rounded-xl px-3 text-[13px] font-medium text-primary-foreground shadow-[var(--shadow-primary)] transition-all hover:shadow-[var(--shadow-primary-hover)] active:translate-y-px sm:inline-flex"
              >
                <span aria-hidden className="bg-brand-gradient absolute inset-0" />
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                <span className="relative">Nous contacter</span>
                <ArrowRight
                  aria-hidden
                  className="relative size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5"
                />
              </Link>

              <button
                type="button"
                className="relative inline-flex size-8 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none lg:hidden"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
                onClick={() => setOpen((v) => !v)}
              >
                <Menu
                  aria-hidden
                  className={cn('absolute size-5 transition-all duration-200', open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100')}
                />
                <X
                  aria-hidden
                  className={cn('absolute size-5 transition-all duration-200', open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0')}
                />
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div
            id="mobile-nav"
            className="animate-fade-up relative mt-2 overflow-hidden rounded-2xl bg-background/95 shadow-[0_30px_60px_-20px_oklch(0.2_0.02_264/0.25)] backdrop-blur-xl lg:hidden"
            style={{ animationDuration: '240ms' }}
          >
            <div aria-hidden className="gradient-ring rounded-2xl [--ring-alpha:0.3]" />
            <nav className="relative flex flex-col gap-1 p-3" aria-label="Navigation mobile">
              {links.map((l, i) => {
                const active = isActive(pathname, l.href)
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    style={{ '--delay': `${40 + i * 35}ms`, animationDuration: '220ms' } as CSSProperties}
                    className={cn(
                      'animate-fade-up flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-foreground ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
                    )}
                  >
                    <span>{l.label}</span>
                    {active && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
                  </Link>
                )
              })}
              <div className="mt-2 border-t border-border/60 pt-3">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="relative flex h-10 w-full items-center justify-center gap-1.5 overflow-hidden rounded-xl text-sm font-medium text-primary-foreground shadow-[var(--shadow-primary)]"
                >
                  <span aria-hidden className="bg-brand-gradient absolute inset-0" />
                  <span className="relative">Nous contacter</span>
                  <ArrowRight aria-hidden className="relative size-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
