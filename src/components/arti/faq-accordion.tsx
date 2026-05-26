'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { cn } from '@/lib/utils'

type FaqItem = {
  q: string
  a: string
}

type FaqAccordionProps = {
  items: FaqItem[]
  className?: string
}

/** Petite tasse dessinée à la main, utilisée comme indicateur ouvert/fermé */
function CupGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10c0-1 .8-1.7 1.7-1.7h14c1 0 1.7.8 1.7 1.7v9c0 3.4-2.8 6.2-6.2 6.2h-5c-3.4 0-6.2-2.8-6.2-6.2v-9Z" />
        <path d="M23 12c2 0 3.3 1.2 3.3 2.7s-1.3 2.7-3.3 2.7" />
      </g>
    </svg>
  )
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <div className={cn('divide-y divide-foreground/15', className)}>
      {items.map((item, i) => {
        const isOpen = openIdx === i
        return (
          <div key={item.q}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left text-foreground/85 transition-colors hover:text-foreground"
            >
              <span className="text-[15px] font-normal">{item.q}</span>
              <CupGlyph
                className={cn(
                  'h-6 w-auto shrink-0 text-terracotta transition-transform duration-300',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-10 text-[13.5px] leading-relaxed text-foreground/75">
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
