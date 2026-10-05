import type { LucideProps } from 'lucide-react'
import { createElement } from 'react'

import { getIcon } from '@/lib/icons'

/** Icône lucide désignée par son nom (champ « iconName » du contenu éditable). */
export function NamedIcon({ name, ...props }: LucideProps & { name: string }) {
  return createElement(getIcon(name), props)
}
