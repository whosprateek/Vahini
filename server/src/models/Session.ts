import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISession extends Document {
  user: mongoose.Types.ObjectId
  jti: string
  userAgent?: string
  ip?: string
  createdAt: Date
  lastSeen: Date
  revokedAt?: Date
}

const SessionSchema = new Schema<ISession>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jti: { type: String, required: true, unique: true, index: true },
  userAgent: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: () => new Date() },
  lastSeen: { type: Date, default: () => new Date() },
  revokedAt: { type: Date }
})

export const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)
