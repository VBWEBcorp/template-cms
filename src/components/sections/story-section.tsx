'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useContent } from '@/hooks/use-content'

const ease = [0.22, 1, 0.36, 1] as const

const defaults = {
  eyebrow: 'Notre histoire',
  title: 'Une approche humaine, des résultats concrets',
  paragraph1: 'Depuis nos débuts, nous croyons qu\'un bon site commence par une bonne écoute. Nous prenons le temps de comprendre votre métier, vos clients et vos objectifs avant de concevoir quoi que ce soit.',
  paragraph2: 'Le résultat : des projets qui vous ressemblent, qui parlent à votre audience, et qui travaillent pour vous 24h/24.',
  image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
}

export function StorySection() {
  const { data } = useContent('home', { story: defaults })
  const story = data.story ?? defaults

  return (
    <section className="border-b border-border/60 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease }}
            className="relative"
          >
            <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-linear-to-br from-primary/10 via-transparent to-transparent blur-2xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-[var(--shadow-md)] ring-1 ring-foreground/5">
              <img
                src={story.image}
                alt="Équipe au travail"
                className="size-full object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease, delay: 0.06 }}
            className="space-y-6"
          >
            <p className="font-display text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              {story.eyebrow}
            </p>
            <h2 className="font-display text-balance text-3xl leading-[1.12] tracking-[-0.02em] text-foreground sm:text-4xl">
              {story.title}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {story.paragraph1}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {story.paragraph2}
            </p>
            <Button variant="outline" className="group" asChild>
              <Link href="/a-propos">
                Lire plus
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
