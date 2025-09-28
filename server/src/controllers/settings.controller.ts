import { Response } from 'express'
import { z } from 'zod'
import { Settings } from '../models/Settings'
import { AuthRequest } from '../middleware/auth'

const patchSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  maintenanceUpdates: z.boolean().optional(),
})

export async function getMySettings(req: AuthRequest, res: Response) {
  const userId = req.user!.id
  let s = await Settings.findOne({ user: userId })
  if (!s) {
    s = await Settings.create({ user: userId })
  }
  res.json({ settings: serialize(s) })
}

export async function patchMySettings(req: AuthRequest, res: Response) {
  const userId = req.user!.id
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' })
  const s = await Settings.findOneAndUpdate({ user: userId }, { $set: parsed.data }, { new: true, upsert: true })
  res.json({ settings: serialize(s!) })
}

function serialize(s: any) {
  return {
    twoFactorEnabled: !!s.twoFactorEnabled,
    systemAlerts: !!s.systemAlerts,
    maintenanceUpdates: !!s.maintenanceUpdates,
  }
}