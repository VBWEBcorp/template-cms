import { type ComponentProps, type ReactElement, cloneElement, isValidElement } from 'react'

import { cn } from '@/lib/utils'

/**
 * Bouton du design system. `asChild` applique le style à l'unique enfant
 * (un <Link> par exemple) au lieu de rendre un <button>.
 * Écrit sans dépendance (anciennement class-variance-authority + Radix Slot).
 */

const base =
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const variants = {
  default:
    "relative isolate overflow-hidden bg-brand-gradient text-primary-foreground shadow-[0_4px_14px_-4px_oklch(0.48_0.22_var(--brand-hue)/0.45)] hover:shadow-[0_8px_24px_-6px_oklch(0.48_0.22_var(--brand-hue)/0.6)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-700 before:ease-out before:content-[''] hover:before:translate-x-full after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:content-['']",
  outline:
    'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
  destructive:
    'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
  link: 'text-primary underline-offset-4 hover:underline',
} as const

const sizes = {
  default: 'h-8 gap-1.5 px-2.5',
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
  sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
  lg: 'h-9 gap-1.5 px-2.5',
  icon: 'size-8',
  'icon-sm': 'size-7 rounded-[min(var(--radius-md),12px)]',
  'icon-lg': 'size-9',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export function buttonClasses({
  variant = 'default',
  size = 'default',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(base, variants[variant], sizes[size], className)
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

export function Button({ className, variant = 'default', size = 'default', asChild = false, children, ...props }: ButtonProps) {
  const classes = buttonClasses({ variant, size, className })

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, {
      ...(props as object),
      className: cn(classes, child.props.className),
    })
  }

  return (
    <button data-slot="button" data-variant={variant} data-size={size} className={classes} {...props}>
      {children}
    </button>
  )
}
