import mongoose, { type Model, Schema } from 'mongoose'

/**
 * Brouillons de l'aperçu en direct de l'admin. Éphémères : supprimés
 * automatiquement par MongoDB au bout de 24 h (index TTL).
 */
export interface IContentDraft {
  key: string
  pageId: string
  content: Record<string, unknown>
  createdAt: Date
}

const ContentDraftSchema = new Schema<IContentDraft>({
  key: { type: String, required: true, unique: true },
  pageId: { type: String, required: true },
  content: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
})

export const ContentDraft: Model<IContentDraft> =
  (mongoose.models.ContentDraft as Model<IContentDraft>) ||
  mongoose.model<IContentDraft>('ContentDraft', ContentDraftSchema)
