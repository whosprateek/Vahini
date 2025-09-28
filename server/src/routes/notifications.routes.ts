import express from 'express'
import { requireAuth } from '../middleware/auth'
import { listNotifications, createNotification, markNotificationRead, markAllRead } from '../controllers/notifications.controller'

const router = express.Router()

router.use(requireAuth)

router.get('/', listNotifications)
router.post('/', createNotification)
router.post('/:id/read', markNotificationRead)
router.post('/read-all', markAllRead)

export default router
