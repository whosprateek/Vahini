import mongoose, { Schema, Document, Model } from 'mongoose'

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: Object.values(NotificationType), default: NotificationType.INFO },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: () => new Date(), index: true },
  metadata: { type: Schema.Types.Mixed },
})

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
