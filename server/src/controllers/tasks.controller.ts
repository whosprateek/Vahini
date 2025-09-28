import { Response } from 'express'
import { z } from 'zod'
import { Task } from '../models/Task'
import { AuthRequest } from '../middleware/auth'

const createSchema = z.object({
  taskName: z.string().min(1),
  type: z.string().min(1),
  priority: z.enum(['low','medium','high','critical']),
  dueDate: z.coerce.date(),
  zone: z.string().min(1),
  assignedTechnician: z.string().min(1),
})

export async function createTask(req: AuthRequest, res: Response) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })
  const doc = await Task.create({ ...parsed.data, createdBy: req.user!.id })
  res.status(201).json({ task: serialize(doc) })
}

export async function listTasks(req: AuthRequest, res: Response) {
  const tasks = await Task.find({}).sort({ dueDate: 1 })
  res.json({ tasks: tasks.map(serialize) })
}

export async function getTask(req: AuthRequest, res: Response) {
  const id = req.params.id
  const t = await Task.findById(id)
  if (!t) return res.status(404).json({ error: 'Not found' })
  res.json({ task: serialize(t) })
}

const updateSchema = z.object({
  taskName: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  priority: z.enum(['low','medium','high','critical']).optional(),
  dueDate: z.union([z.coerce.date(), z.string()]).optional(),
  zone: z.string().min(1).optional(),
  assignedTechnician: z.string().min(1).optional(),
  status: z.enum(['scheduled','in_progress','completed','pending_approval']).optional(),
})

export async function updateTask(req: AuthRequest, res: Response) {
  const id = req.params.id
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })
  const update: any = { ...parsed.data }
  if (typeof update.dueDate === 'string') {
    const d = new Date(update.dueDate)
    if (!isNaN(d.getTime())) update.dueDate = d
  }
  const t = await Task.findByIdAndUpdate(id, update, { new: true })
  if (!t) return res.status(404).json({ error: 'Not found' })
  res.json({ task: serialize(t) })
}

function serialize(t: any) {
  return {
    id: t.id,
    taskName: t.taskName,
    type: t.type,
    priority: t.priority,
    dueDate: t.dueDate,
    zone: t.zone,
    assignedTechnician: t.assignedTechnician,
    status: t.status,
    createdAt: t.createdAt,
  }
}