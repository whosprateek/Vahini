import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env } from './config/env'
import { connectDB } from './config/db'
import routes from './routes'
import { notFoundHandler, errorHandler } from './middleware/error'
import { seedAdmin } from './utils/seedAdmin'

const app = express()

// Allow multiple origins: comma-separated CORS_ORIGIN env, plus sensible defaults
const configuredOrigins = (env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean)
const defaultOrigins = ['http://localhost:3000', 'https://client-dj1ag2tsv-whosprateeks-projects.vercel.app']
const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]))

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    // Allow exact matches or any Vercel preview/prod domain
    const ok = allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/i.test(origin)
    return ok ? callback(null, true) : callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Base info route to prevent 404 on root
app.get('/', (req, res) => {
  res.json({ name: 'Vahini API', at: new Date().toISOString(), status: 'ok' })
})

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

const port = env.PORT

connectDB().then(async () => {
  await seedAdmin(process.env.ADMIN_EMAIL as string, process.env.ADMIN_PASSWORD as string)
  app.listen(port, () => {
    console.log(`[server] running on http://localhost:${port}`)
  })
}).catch((err) => {
  console.error('[server] failed to start:', err)
  process.exit(1)
})
