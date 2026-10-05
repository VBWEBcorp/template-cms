import { Globe } from 'lucide-react'
import Link from 'next/link'

import { cx as cn } from '@/lib/cx'

/** Logo texte + pictogramme. Pour un vrai logo : remplacer le contenu du lien par une <Image>. */
export function Logo({ name, className }: { name: string; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${name}, retour à l'accueil`}
      className={cn(
        'group inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90',
        className
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-transform duration-300 group-hover:scale-[1.03]">
        <Globe className="size-[18px]" aria-hidden />
      </span>
      <span>{name}</span>
    </Link>
  )
}
