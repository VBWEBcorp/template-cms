// Icônes dessinées à la main pour les 4 étapes du concept ARTI.
// Style "trait fin noir", cohérent avec les screenshots fournis.

type IconProps = { className?: string }

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
}

export function IconCups({ className }: IconProps) {
  return (
    <svg viewBox="0 0 72 64" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <g {...stroke}>
        {/* Tasse arrière */}
        <path d="M12 14c0-1.5 1.2-2.7 2.7-2.7h20c1.5 0 2.7 1.2 2.7 2.7v22c0 5-4 9-9 9h-7.4c-5 0-9-4-9-9V14Z" />
        <path d="M37.4 18c4 0 6 2 6 4.7s-2 4.7-6 4.7" />
        {/* Tasse avant */}
        <path d="M30 28c0-1.5 1.2-2.7 2.7-2.7h22c1.5 0 2.7 1.2 2.7 2.7v22c0 5-4 9-9 9h-9.4c-5 0-9-4-9-9V28Z" />
        <path d="M57.4 32c4 0 6 2 6 4.7s-2 4.7-6 4.7" />
      </g>
    </svg>
  )
}

export function IconVase({ className }: IconProps) {
  return (
    <svg viewBox="0 0 72 64" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <g {...stroke}>
        {/* Vase rond */}
        <path d="M28 14c-1 0-1.5.7-1.2 1.6.5 1.4 1.2 3.2 1.2 5.4 0 3-2 4.4-4 7-3 4-3 12 1 17 4 5 12 5 17 2 6-3.5 7-12 3-17-2-2.5-4-4-4-7 0-2.2.7-4 1.2-5.4.3-1-.2-1.6-1.2-1.6h-13Z" />
        {/* Feuille en haut */}
        <path d="M32 10c1.5-3 4-4 6-4 1.5 3 0 5.5-2 6.5" />
        <path d="M38 10c2-2 5-2 6-1.5-1 2.5-3 4-5 4" />
      </g>
    </svg>
  )
}

export function IconKiln({ className }: IconProps) {
  return (
    <svg viewBox="0 0 72 64" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <g {...stroke}>
        {/* Four céramique */}
        <path d="M18 22c0-1.5 1.2-2.7 2.7-2.7h30c1.5 0 2.7 1.2 2.7 2.7v25c0 1.5-1.2 2.7-2.7 2.7h-30c-1.5 0-2.7-1.2-2.7-2.7V22Z" />
        <path d="M22 28h28" />
        {/* Pièce à l'intérieur */}
        <path d="M30 33c0-1.5 1.2-2.7 2.7-2.7h6c1.5 0 2.7 1.2 2.7 2.7v10c0 1.5-1.2 2.7-2.7 2.7h-6c-1.5 0-2.7-1.2-2.7-2.7V33Z" />
        {/* Cheminée */}
        <path d="M30 19v-5h4v5" />
        <path d="M38 19v-5h4v5" />
      </g>
    </svg>
  )
}

export function IconJugs({ className }: IconProps) {
  return (
    <svg viewBox="0 0 72 64" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <g {...stroke}>
        {/* Grand pichet à gauche */}
        <path d="M14 22c0-2 1.5-3.5 3.5-3.5h12c2 0 3.5 1.5 3.5 3.5v20c0 3-2.5 5.5-5.5 5.5h-8c-3 0-5.5-2.5-5.5-5.5V22Z" />
        <path d="M33 26c2.5 0 4.2 1.5 4.2 3.5S35.5 33 33 33" />
        <path d="M18 18c-1-2-.5-4 1.5-5" />
        {/* Petit pichet à droite */}
        <path d="M44 28c0-1.7 1.2-3 3-3h10c1.7 0 3 1.3 3 3v16c0 2.5-2 4.5-4.5 4.5h-7c-2.5 0-4.5-2-4.5-4.5V28Z" />
        <path d="M60 32c2 0 3.4 1.2 3.4 2.7s-1.4 2.7-3.4 2.7" />
      </g>
    </svg>
  )
}
