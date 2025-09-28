import { Response } from 'express'
import { Attendance } from '../models/Attendance'
import { AuthRequest } from '../middleware/auth'
import { z } from 'zod'

export async function punch(req: AuthRequest, res: Response) {
  const userId = req.user!.id
  const schema = z.object({ type: z.enum(['in', 'out']) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })

  const entry = await Attendance.create({ user: userId, type: parsed.data.type })
  res.status(201).json({ attendance: { id: entry.id, type: entry.type, timestamp: entry.timestamp } })
}

export async function myAttendance(req: AuthRequest, res: Response) {
  const userId = req.user!.id
  const logs = await Attendance.find({ user: userId }).sort({ timestamp: -1 }).limit(50)
  res.json({ attendance: logs.map(l => ({ id: l.id, type: l.type, timestamp: l.timestamp })) })
}