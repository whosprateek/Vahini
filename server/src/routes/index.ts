import { Router } from 'express'
import auth from './auth.routes'
import health from './health.routes'
import predict from './predict.routes'
import attendance from './attendance.routes'
import tasks from './tasks.routes'
import settings from './settings.routes'
import sessions from './sessions.routes'
import notifications from './notifications.routes'
import apiKeys from './apikeys.routes'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    name: 'Vahini API',
    version: '0.1.0',
    endpoints: ['/api/health', '/api/auth/register', '/api/auth/login', '/api/auth/me', '/api/auth/logout', '/api/predict'],
    status: 'ok'
  })
})

router.use('/auth', auth)
router.use('/health', health)
router.use('/predict', predict)
router.use('/attendance', attendance)
router.use('/tasks', tasks)
router.use('/settings', settings)
router.use('/auth/sessions', sessions)
router.use('/notifications', notifications)
router.use('/api-keys', apiKeys)

export default router
