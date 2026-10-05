import { cn } from '@/lib/utils'

/** Sépare les derniers mots d'un titre, mis en valeur en serif italique. */
export function splitTitle(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/)
  if (words.length <= 2) return { lead: '', accent: title }
  const accentCount = Math.min(2, Math.max(1, Math.floor(words.length / 3)))
  return {
    lead: words.slice(0, words.length - accentCount).join(' '),
    accent: words.slice(words.length - accentCount).join(' '),
  }
}

/** Contenu d'un grand titre : début en sans-serif, fin en serif italique colorée. */
export function AccentTitle({ title, accentClassName }: { title: string; accentClassName?: string }) {
  const { lead, accent } = splitTitle(title)
  if (!lead) return <>{accent}</>
  return (
    <>
      {lead}{' '}
      <span
        className={cn(
          'relative inline-block pb-1 font-serif font-normal tracking-[-0.01em] italic',
          accentClassName ?? 'text-primary'
        )}
      >
        {accent}
      </span>
    </>
  )
}
