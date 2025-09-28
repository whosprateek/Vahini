import express from 'express'
import { requireAuth } from '../middleware/auth'
import { listSessions, revokeSession, revokeAllOtherSessions } from '../controllers/sessions.controller'

const router = express.Router()

router.use(requireAuth)

router.get('/', listSessions)
router.post('/revoke/:id', revokeSession)
router.post('/revoke-others', revokeAllOtherSessions)

export default router
