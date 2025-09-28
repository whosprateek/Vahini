import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { ApiError } from '../utils/ApiError'
import { Session } from '../models/Session'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string }
}

function getToken(req: Request): string | null {
  const auth = req.headers['authorization']
  if (auth && typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7)
  }
  const cookieToken = (req as any).cookies?.token
  return cookieToken || null
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = getToken(req)
  if (!token) throw new ApiError(401, 'Not authenticated')
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string; role: string; jti?: string }
    if (!decoded.jti) throw new ApiError(401, 'Invalid session')
    const sess = await Session.findOne({ jti: decoded.jti, user: decoded.sub })
    if (!sess || sess.revokedAt) throw new ApiError(401, 'Session revoked')
    sess.lastSeen = new Date()
    await sess.save().catch(()=>{})
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
    next()
  } catch {
    throw new ApiError(401, 'Invalid session')
  }
}
