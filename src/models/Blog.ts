import mongoose, { type Document, type Model, Schema } from 'mongoose'

import { BLOG_SETTINGS_DEFAULTS } from '@/lib/blog-defaults'

export interface IBlogPost extends Document {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  coverImageAlt?: string
  category: string
  tags: string[]
  author: string
  published: boolean
  /** Date de publication affichée. Future = article invisible jusqu'à cette date. */
  publishedAt?: Date
  metaTitle?: string
  metaDescription?: string
  /** JSON-LD fourni par PHARE, stocké tel quel (chaîne JSON). */
  jsonLd?: string
  /** Markdown d'origine envoyé par PHARE (archivé, le site affiche `content`). */
  markdown?: string
  /** Origine de l'article : 'phare' ou vide (rédigé dans l'admin). */
  source?: string
  notifyOnPublish: boolean
  newsletterSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IBlogSettings extends Document {
  enabled: boolean
  title: string
  description?: string
  eyebrow?: string
  heroImage?: string
  categories: string[]
  updatedAt: Date
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: [true, 'Le titre est obligatoire'] },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    coverImageAlt: { type: String, default: '' },
    category: { type: String, default: '' },
    tags: [{ type: String }],
    author: { type: String, default: '' },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    metaTitle: String,
    metaDescription: String,
    jsonLd: String,
    markdown: String,
    source: String,
    // Prévenir les abonnés newsletter à la première mise en ligne
    notifyOnPublish: { type: Boolean, default: true },
    // Horodatage de l'envoi (garde-fou : une seule annonce par article)
    newsletterSentAt: { type: Date },
  },
  { timestamps: true }
)

BlogPostSchema.index({ published: 1, publishedAt: -1 })

const BlogSettingsSchema = new Schema<IBlogSettings>(
  {
    enabled: { type: Boolean, default: BLOG_SETTINGS_DEFAULTS.enabled },
    title: { type: String, default: BLOG_SETTINGS_DEFAULTS.title },
    description: { type: String, default: BLOG_SETTINGS_DEFAULTS.description },
    eyebrow: { type: String, default: BLOG_SETTINGS_DEFAULTS.eyebrow },
    heroImage: String,
    categories: [{ type: String }],
  },
  { timestamps: true }
)

export const BlogPost: Model<IBlogPost> =
  (mongoose.models.BlogPost as Model<IBlogPost>) || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema)

export const BlogSettings: Model<IBlogSettings> =
  (mongoose.models.BlogSettings as Model<IBlogSettings>) ||
  mongoose.model<IBlogSettings>('BlogSettings', BlogSettingsSchema)
