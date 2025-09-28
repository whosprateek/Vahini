import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  firstName?: string
  lastName?: string
  email: string
  passwordHash: string
  role: 'admin' | 'user'
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'vahini_users' })

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
