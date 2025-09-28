import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IApiKey extends Document {
  user: mongoose.Types.ObjectId
  key: string // demo-only: store plaintext; do not use in production
  createdAt: Date
  revokedAt?: Date
}

const ApiKeySchema = new Schema<IApiKey>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  key: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
  revokedAt: { type: Date },
})

export const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema)