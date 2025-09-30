import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { requireAuth } from '../middleware/auth'
import { createTask, listTasks, getTask, updateTask, deleteTask } from '../controllers/tasks.controller'

const router = Router()

router.get('/', requireAuth as any, asyncHandler(listTasks))
router.get('/:id', requireAuth as any, asyncHandler(getTask))
router.post('/', requireAuth as any, asyncHandler(createTask))
router.patch('/:id', requireAuth as any, asyncHandler(updateTask))
router.delete('/:id', requireAuth as any, asyncHandler(deleteTask as any))

export default router
