import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISettings extends Document {
  user: mongoose.Types.ObjectId
  twoFactorEnabled: boolean
  systemAlerts: boolean
  maintenanceUpdates: boolean
  createdAt: Date
}

const SettingsSchema = new Schema<ISettings>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  twoFactorEnabled: { type: Boolean, default: false },
  systemAlerts: { type: Boolean, default: true },
  maintenanceUpdates: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
})

export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)