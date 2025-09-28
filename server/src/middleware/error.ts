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

  // Handle Mongo duplicate key errors gracefully (e.g., email already registered)
  const anyErr = err as any
  if (anyErr && typeof anyErr === 'object' && anyErr.code === 11000) {
    const key = anyErr.keyPattern ? Object.keys(anyErr.keyPattern)[0] : undefined
    const msg = key === 'email' ? 'Email already registered' : 'Duplicate value'
    return res.status(409).json({ error: msg, key, value: anyErr.keyValue })
  }

  console.error('[error]', err)
  return res.status(500).json({ error: 'Internal Server Error' })
}
