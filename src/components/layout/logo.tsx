import Link from 'next/link'

import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'text-xl gap-1.5',
  md: 'text-2xl gap-2',
  lg: 'text-3xl gap-2.5',
} as const

/**
 * Logo ARTI : capitales serif fines + petits pichets/tasses dessinés à la main.
 */
export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="ARTI Café Céramique — Accueil"
      className={cn(
        'group inline-flex items-center font-logo text-foreground transition-opacity hover:opacity-80',
        sizes[size],
        className
      )}
    >
      <span>ARTI</span>
      <PotsMark className="h-[1.1em] w-auto translate-y-[-2px]" aria-hidden />
    </Link>
  )
}

function PotsMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Petite tasse */}
        <path d="M5 12c0-1 .8-2 2-2h9c1.2 0 2 1 2 2v10c0 3-2 5-5 5h-3c-3 0-5-2-5-5V12Z" />
        <path d="M18 14c2.2 0 3.5 1.2 3.5 2.8s-1.3 2.7-3.5 2.7" />
        {/* Petit pichet à droite */}
        <path d="M28 14c0-2 1.5-3.5 3.5-3.5h6c2 0 3.5 1.5 3.5 3.5v8c0 3-2.2 5-5 5h-3c-2.8 0-5-2-5-5v-8Z" />
        <path d="M40 17c1.5 0 2.5.8 2.5 2.2s-1 2-2.5 2" />
        <path d="M30 10.5c-.4-1.2-.2-2.8 1.2-3.5" />
      </g>
    </svg>
  )
}
