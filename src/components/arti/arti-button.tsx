import Link from 'next/link'

import { cn } from '@/lib/utils'

type ArtiButtonProps = {
  href: string
  children: React.ReactNode
  variant?: 'sauge' | 'outline-light' | 'outline-dark'
  className?: string
  external?: boolean
}

export function ArtiButton({
  href,
  children,
  variant = 'sauge',
  className,
  external,
}: ArtiButtonProps) {
  const styles = {
    sauge:
      'bg-sauge text-white hover:bg-sauge-deep',
    'outline-light':
      'border border-white/80 text-white hover:bg-white hover:text-foreground',
    'outline-dark':
      'border border-foreground/80 text-foreground hover:bg-foreground hover:text-beige',
  }
  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-sm px-7 text-[15px] font-light tracking-wide transition-colors',
        styles[variant],
        className
      )}
    >
      {children}
    </Link>
  )
}
