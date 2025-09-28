import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITask extends Document {
  taskName: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate: Date
  zone: string
  assignedTechnician: string
  createdBy: mongoose.Types.ObjectId
  status: 'scheduled' | 'in_progress' | 'completed' | 'pending_approval'
  createdAt: Date
}

const TaskSchema = new Schema<ITask>({
  taskName: { type: String, required: true },
  type: { type: String, required: true },
  priority: { type: String, enum: ['low','medium','high','critical'], required: true },
  dueDate: { type: Date, required: true },
  zone: { type: String, required: true },
  assignedTechnician: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['scheduled','in_progress','completed','pending_approval'], default: 'scheduled' },
  createdAt: { type: Date, default: () => new Date() },
})

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)