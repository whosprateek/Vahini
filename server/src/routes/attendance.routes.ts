import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { punch, myAttendance } from '../controllers/attendance.controller'

const router = Router()

router.post('/punch', requireAuth as any, asyncHandler(punch))
router.get('/me', requireAuth as any, asyncHandler(myAttendance))

export default router