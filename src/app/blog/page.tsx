'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, User, Tag } from 'lucide-react'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
}

interface BlogSettings {
  enabled: boolean
  title: string
  description?: string
}

const ease = [0.22, 1, 0.36, 1] as const

export default function BlogPage() {
  const [settings, setSettings] = useState<BlogSettings | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const [settingsRes, postsRes] = await Promise.all([
          fetch('/api/blog/settings'),
          fetch('/api/blog/posts'),
        ])
        setSettings(await settingsRes.json())
        setPosts(await postsRes.json())
      } catch (error) {
        console.error('Failed to load blog:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
  }, [])

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!settings?.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Le blog n&apos;est pas disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="font-display text-xs font-semibold tracking-[0.22em] text-primary uppercase mb-4">
              Blog
            </p>
            <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              {settings.title}
            </h1>
            {settings.description && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {settings.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: i * 0.08 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="h-full rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
                    {/* Cover image */}
                    {post.coverImage && (
                      <div className="aspect-[16/9] overflow-hidden bg-muted">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      {/* Category + Date */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {post.category && (
                          <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {post.category}
                          </span>
                        )}
                        {post.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="font-display text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Author + Read more */}
                      <div className="flex items-center justify-between pt-2">
                        {post.author && (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="size-3" />
                            {post.author}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                          Lire la suite
                          <ArrowRight className="size-3" />
                        </span>
                      </div>

                      {/* Tags */}
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg">Aucun article pour le moment.</p>
            <p className="text-sm text-muted-foreground/60 mt-2">Revenez bientôt !</p>
          </motion.div>
        )}
      </section>
    </div>
  )
}
