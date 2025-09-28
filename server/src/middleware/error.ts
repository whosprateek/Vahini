import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError'

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' })
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err)

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details })
  }

  console.error('[error]', err)
  return res.status(500).json({ error: 'Internal Server Error' })
}
