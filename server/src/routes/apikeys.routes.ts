import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { listApiKeys, generateApiKey, revokeApiKey } from '../controllers/apikeys.controller'

const router = Router()
router.get('/', requireAuth as any, asyncHandler(listApiKeys))
router.post('/', requireAuth as any, asyncHandler(generateApiKey))
router.post('/revoke', requireAuth as any, asyncHandler(revokeApiKey))
export default router