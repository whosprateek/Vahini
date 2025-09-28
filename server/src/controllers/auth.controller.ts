import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { sign as jwtSign, verify as jwtVerify, type SignOptions, type Secret } from 'jsonwebtoken'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { User } from '../models/User'
import { Session } from '../models/Session'
import { ApiError } from '../utils/ApiError'
import { env } from '../config/env'
import { AuthRequest } from '../middleware/auth'

const registerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
})

function signToken(payload: object, expiresInSeconds: number, jti: string) {
  // Set JWT ID via options; do not duplicate jti in payload to avoid jsonwebtoken error
  const options: SignOptions = { expiresIn: expiresInSeconds, jwtid: jti }
  return jwtSign(payload as any, env.JWT_SECRET as Secret, options)
}

// Keep cookie for compatibility, but client uses Authorization header
function setAuthCookie(res: Response, token: string, maxAgeMs: number) {
  const isProd = env.NODE_ENV === 'production'
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/',
  })
}

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers['authorization']
  if (auth && typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7)
  }
  const cookieToken = (req as any).cookies?.token
  return cookieToken || null
}

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) throw new ApiError(400, 'Invalid input', parsed.error.format())

  const { email, password, firstName, lastName, role } = parsed.data
  const existing = await User.findOne({ email })
  if (existing) throw new ApiError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash, firstName, lastName, role })

const expiresMs = 7 * 24 * 60 * 60 * 1000
  const jti = randomUUID()
  const token = signToken({ sub: user.id, email: user.email, role: user.role }, Math.floor(expiresMs / 1000), jti)
setAuthCookie(res, token, expiresMs)
  try { await Session.create({ user: user.id, jti, userAgent: req.headers['user-agent'], ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress }) } catch {}

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      role: user.role,
    },
    token,
  })
}

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) throw new ApiError(400, 'Invalid input', parsed.error.format())

  const { email, password, rememberMe } = parsed.data
  const user = await User.findOne({ email })
  if (!user) throw new ApiError(401, 'Invalid credentials')

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new ApiError(401, 'Invalid credentials')

const expiresMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  const jti = randomUUID()
  const token = signToken({ sub: user.id, email: user.email, role: user.role }, Math.floor(expiresMs / 1000), jti)
setAuthCookie(res, token, expiresMs)
  try { await Session.create({ user: user.id, jti, userAgent: req.headers['user-agent'], ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress }) } catch {}

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      role: user.role,
    },
    token,
  })
}

export const me = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req)
  if (!token) throw new ApiError(401, 'Not authenticated')
  try {
    const decoded = jwtVerify(token, env.JWT_SECRET as Secret) as { sub: string; email: string; role: string }
    const user = await User.findById(decoded.sub)
    if (!user) throw new ApiError(401, 'Invalid session')
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        role: user.role,
      },
    })
  } catch {
    throw new ApiError(401, 'Invalid session')
  }
}

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token', { path: '/', httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production' })
  res.json({ success: true })
}

export const changePassword = async (req: AuthRequest, res: Response) => {
  const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) throw new ApiError(400, 'Invalid input')
  const userId = req.user?.id
  if (!userId) throw new ApiError(401, 'Not authenticated')
  const user = await User.findById(userId)
  if (!user) throw new ApiError(401, 'Invalid session')
  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!ok) throw new ApiError(400, 'Current password is incorrect')
  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await user.save()
  res.json({ success: true })
}

export const sessionInfo = async (req: AuthRequest, res: Response) => {
  const token = (req.headers['authorization'] as string)?.slice(7)
  if (!token) throw new ApiError(401, 'Not authenticated')
  try {
    const d = jwtVerify(token, env.JWT_SECRET as Secret) as any
    res.json({ session: { iat: d.iat, exp: d.exp } })
  } catch {
    throw new ApiError(401, 'Invalid session')
  }
}
