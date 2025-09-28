import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { ApiKey } from '../models/ApiKey'

export async function listApiKeys(req: AuthRequest, res: Response) {
  const keys = await ApiKey.find({ user: req.user!.id }).sort({ createdAt: -1 })
  res.json({ keys: keys.map(k => ({ id: k.id, lastFour: k.key.slice(-4), createdAt: k.createdAt, revokedAt: k.revokedAt })) })
}

export async function generateApiKey(req: AuthRequest, res: Response) {
  // demo-only generator
  const key = 'vk_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  const doc = await ApiKey.create({ user: req.user!.id, key })
  res.status(201).json({ apiKey: { id: doc.id, key: doc.key, createdAt: doc.createdAt } })
}

export async function revokeApiKey(req: AuthRequest, res: Response) {
  const { id } = req.body || {}
  if (!id) return res.status(400).json({ error: 'id required' })
  const doc = await ApiKey.findOne({ _id: id, user: req.user!.id })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  doc.revokedAt = new Date()
  await doc.save()
  res.json({ success: true })
}