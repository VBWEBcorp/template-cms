import mongoose, { type Model, Schema } from 'mongoose'

/** Écarts du contenu d'une page par rapport à src/content/pages.ts (une entrée par page). */
export interface ISiteContent {
  pageId: string
  content: Record<string, unknown>
  updatedAt: Date
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    pageId: { type: String, required: true, unique: true },
    content: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { timestamps: true, minimize: false }
)

const SiteContent: Model<ISiteContent> =
  (mongoose.models.SiteContent as Model<ISiteContent>) || mongoose.model<ISiteContent>('SiteContent', SiteContentSchema)

export default SiteContent
