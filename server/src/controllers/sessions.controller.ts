import { Request, Response } from 'express'
import { z } from 'zod'
import { Session } from '../models/Session'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(50),
})

export async function listSessions(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    const { limit } = listQuerySchema.parse(req.query)
    const sessions = await Session.find({ user: userId }).sort({ lastSeen: -1 }).limit(limit)
    res.json({ items: sessions })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
}

export async function revokeSession(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    const { id } = req.params
    const session = await Session.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { revokedAt: new Date() } },
      { new: true }
    )
    if (!session) return res.status(404).json({ error: 'Not found' })
    res.json({ session })
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke session' })
  }
}

export async function revokeAllOtherSessions(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id

    // Extract current token and decode to get jti, so we don't revoke the active session
    let currentJti: string | undefined
    const auth = req.headers['authorization']
    const token = typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : undefined
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { jti?: string }
        currentJti = decoded.jti
      } catch {}
    }

    const filter: any = { user: userId, revokedAt: { $exists: false } }
    if (currentJti) filter.jti = { $ne: currentJti }

    await Session.updateMany(filter, { $set: { revokedAt: new Date() } })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke other sessions' })
  }
}
