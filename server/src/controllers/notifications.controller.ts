import { z } from 'zod'
import { Request, Response } from 'express'
import { Notification, NotificationType } from '../models/Notification'

const createNotificationSchema = z.object({
  type: z.nativeEnum(NotificationType).default(NotificationType.INFO),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
})

export async function listNotifications(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    const { unread } = req.query
    const filter: any = { user: userId }
    if (typeof unread !== 'undefined') {
      filter.read = unread === 'true' ? false : true
    }
    const items = await Notification.find(filter).sort({ createdAt: -1 }).limit(200)
    res.json({ items })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}

export async function createNotification(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    const parsed = createNotificationSchema.parse(req.body)
    const notif = await Notification.create({ ...parsed, user: userId })
    res.status(201).json({ notification: notif })
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Invalid payload', details: err.issues })
    }
    res.status(500).json({ error: 'Failed to create notification' })
  }
}

export async function markNotificationRead(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    const { id } = req.params
    const notif = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { read: true } },
      { new: true }
    )
    if (!notif) return res.status(404).json({ error: 'Not found' })
    res.json({ notification: notif })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' })
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' })
  }
}
