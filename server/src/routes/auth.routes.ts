import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { login, me, register, logout, changePassword, sessionInfo } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.get('/me', asyncHandler(me))
router.post('/logout', asyncHandler(logout))
router.post('/change-password', requireAuth as any, asyncHandler(changePassword))
router.get('/session', requireAuth as any, asyncHandler(sessionInfo))

export default router
