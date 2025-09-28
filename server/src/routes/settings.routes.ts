import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { getMySettings, patchMySettings } from '../controllers/settings.controller'

const router = Router()
router.get('/me', requireAuth as any, asyncHandler(getMySettings))
router.patch('/me', requireAuth as any, asyncHandler(patchMySettings))
export default router