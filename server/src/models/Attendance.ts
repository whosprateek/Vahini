import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId
  type: 'in' | 'out'
  timestamp: Date
  createdAt: Date
}

const AttendanceSchema = new Schema<IAttendance>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  timestamp: { type: Date, default: () => new Date() },
  createdAt: { type: Date, default: () => new Date() },
})

export const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema)