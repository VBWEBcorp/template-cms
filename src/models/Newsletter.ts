import mongoose, { Schema, Document } from 'mongoose'

export interface ISubscriber extends Document {
  email: string
  source: string
  status: 'active' | 'unsubscribed'
  createdAt: Date
  updatedAt: Date
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // D'où vient l'inscription (footer, popup, page blog...), utile pour les statistiques
    source: { type: String, default: 'site' },
    status: { type: String, enum: ['active', 'unsubscribed'], default: 'active' },
  },
  { timestamps: true }
)

export const Subscriber = mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>('Subscriber', SubscriberSchema)
