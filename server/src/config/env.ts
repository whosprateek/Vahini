import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(6).optional(),
  PREDICT_OVERLOAD_THRESHOLD: z.coerce.number().default(100),
  PREDICT_SHORT_CCT_THRESHOLD: z.coerce.number().default(200),
  PREDICT_BREAK_MIN_START: z.coerce.number().default(50),
  PREDICT_BALANCE_TOLERANCE: z.coerce.number().default(0.1),
})

type Env = z.infer<typeof EnvSchema>

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('[env] Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env: Env = parsed.data
