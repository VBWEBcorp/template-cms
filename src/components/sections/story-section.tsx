import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import type { homeDefaults } from '@/content/pages'

type Story = (typeof homeDefaults)['story']

const stagger = (i: number) => ({ '--stagger': i }) as CSSProperties

/** « Notre histoire » : apparition au défilement et parallaxe de la photo, en CSS seul. */
export function StorySection({ story }: { story: Story }) {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div className="max-w-xl">
            <p
              className="reveal-left inline-block font-display text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
              style={stagger(0)}
            >
              {story.eyebrow}
            </p>

            <h2
              className="reveal-left mt-5 font-display text-[32px] leading-[1.08] tracking-[-0.02em] text-balance text-foreground sm:text-[40px] lg:text-[48px]"
              style={stagger(1)}
            >
              {story.title}
            </h2>

            <div className="reveal mt-7 space-y-5" style={stagger(2)}>
              <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">{story.paragraph1}</p>
              <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">{story.paragraph2}</p>
            </div>

            <div className="reveal mt-8" style={stagger(3)}>
              <Link href="/a-propos" className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="border-b border-foreground/60 pb-0.5 transition-colors duration-300 group-hover:border-foreground">
                  Lire notre histoire
                </span>
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          <div className="reveal-right relative">
            <div className="parallax-scope relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] ring-1 ring-foreground/5 transition-transform duration-500 hover:-translate-y-1">
              <div className="parallax-y-scoped absolute inset-x-0 -inset-y-8">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  sizes="(min-width: 1152px) 528px, (min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
