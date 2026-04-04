import mongoose, { Schema, Document } from 'mongoose'

export interface IGalleryImage extends Document {
  title: string
  description?: string
  imageUrl: string
  category?: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IGallerySettings extends Document {
  enabled: boolean
  title: string
  description?: string
  updatedAt: Date
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: String,
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    category: {
      type: String,
      default: 'general',
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const GallerySettingsSchema = new Schema<IGallerySettings>(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Galerie',
    },
    description: String,
  },
  {
    timestamps: true,
  }
)

export const GalleryImage = mongoose.models.GalleryImage ||
  mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema)

export const GallerySettings = mongoose.models.GallerySettings ||
  mongoose.model<IGallerySettings>('GallerySettings', GallerySettingsSchema)
