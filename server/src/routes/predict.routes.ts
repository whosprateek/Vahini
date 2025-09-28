import { Router } from 'express'
import { predictFault, getPredictConfig } from '../controllers/predict.controller'

const router = Router()

router.get('/', getPredictConfig)
router.post('/', predictFault)

export default router
