# Vahini — Technical Documentation

This document covers architecture, tech stack, environments, build/deploy, API endpoints, models, and a file-by-file index of this monorepo.

Monorepo layout
- client/ — Next.js 14 (React + TypeScript) frontend
- server/ — Node.js (Express + TypeScript + Mongoose) backend API
- render.yaml — Render blueprint for backend (optional)
- DEPLOY.md — Quick deployment steps for both services

Architecture overview
- Frontend (Next.js App Router)
  - UI components built with modern React patterns, Tailwind CSS, and Radix-based components.
  - Business logic lives in contexts (auth, notifications, lines) and lib helpers.
  - Talks to the backend via fetch() to the API base URL configured in NEXT_PUBLIC_API_BASE_URL.
- Backend (Express + Mongoose)
  - API routes grouped by domain (auth, tasks, attendance, notifications, settings, predict, health, api-keys, sessions).
  - JWT-based authentication; session metadata tracked in MongoDB.
  - Zod-validated environment configuration; CORS and cookies configured for browser auth.
  - MongoDB models for users, tasks, attendance, notifications, sessions, and settings.

Tech stack
- Frontend
  - Next.js 14, React 18, TypeScript 5, Tailwind CSS 4
  - UI: Radix UI, Lucide Icons
  - Charts: Recharts
  - Maps: @googlemaps/react-wrapper
- Backend
  - Node 18+ (Render uses Node 22), Express 4, TypeScript 5
  - Auth: jsonwebtoken, bcryptjs
  - DB: MongoDB with Mongoose 8
  - Validation/Config: zod, dotenv
  - Logging: morgan (dev), error handler middleware

Environment variables
- Frontend (Vercel)
  - NEXT_PUBLIC_API_BASE_URL: Base URL of the API (e.g., https://<render-app>.onrender.com/api)
  - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: Optional Google Maps key for map rendering
- Backend (Render)
  - NODE_ENV: production
  - PORT: 4000 (default)
  - MONGO_URI: MongoDB connection string (required)
  - JWT_SECRET: Long random secret string (required)
  - CORS_ORIGIN: Comma-separated list of allowed origins (e.g., https://<vercel-app>.vercel.app,http://localhost:3000)
  - ADMIN_EMAIL, ADMIN_PASSWORD: Optional bootstrap admin creation on start
  - Predict thresholds (optional): PREDICT_OVERLOAD_THRESHOLD, PREDICT_SHORT_CCT_THRESHOLD, PREDICT_BREAK_MIN_START, PREDICT_BALANCE_TOLERANCE

Build & deploy
- Frontend (Vercel)
  - Root Directory: client
  - Build: npm run build
  - Output: .next
  - Env: NEXT_PUBLIC_API_BASE_URL set to backend /api URL
- Backend (Render)
  - Root Directory: server
  - Build: npm ci && npm run build (ensure dev deps: server/.npmrc has production=false)
  - Start: npm start
  - Env: MONGO_URI, JWT_SECRET, CORS_ORIGIN (set to your Vercel domain), etc.

CORS policy
- Server accepts:
  - Any origin listed in CORS_ORIGIN (comma-separated)
  - http://localhost:3000
  - *.vercel.app (can be tightened if desired)

API endpoints (selected)
- Base: /api
- Health
  - GET /api/health → { status, timestamp }
- Auth
  - POST /api/auth/register → Create user
  - POST /api/auth/login → Obtain JWT
  - GET /api/auth/me → Current user info
  - POST /api/auth/logout → Clear cookie session
  - POST /api/auth/change-password → Change password (auth required)
  - GET /api/auth/session → Session info (auth required)
- Tasks (auth required)
  - GET /api/tasks → List tasks
  - GET /api/tasks/:id → Get task detail
  - POST /api/tasks → Create task
  - PATCH /api/tasks/:id → Update task
- Attendance (auth required)
  - POST /api/attendance/punch → Punch in/out
  - GET /api/attendance/me → My punches
- Settings (auth required)
  - GET /api/settings/me → My settings
  - PATCH /api/settings/me → Update my settings
- Notifications (auth required)
  - GET /api/notifications → List
  - POST /api/notifications → Create
  - POST /api/notifications/:id/read → Mark read
  - POST /api/notifications/read-all → Mark all read
- API Keys (auth required)
  - GET /api/api-keys → List keys
  - POST /api/api-keys → Generate
  - POST /api/api-keys/revoke → Revoke
- Predict
  - GET /api/predict → Get current thresholds/config
  - POST /api/predict → Run prediction

Data models (Mongo/Mongoose)
- User (collection: vahini_users)
  - firstName, lastName, email (unique), passwordHash, role ('admin'|'user'), createdAt
- Task
  - taskName, type, priority ('low'|'medium'|'high'|'critical'), dueDate, zone,
    assignedTechnician, createdBy (User ref), status, createdAt
- Attendance
  - user (User ref), type ('in'|'out'), timestamp, createdAt
- Notification
  - user (User ref), type ('INFO'|'WARNING'|'ALERT'), title, message, read, createdAt, metadata
- Session
  - user (User ref), jti, userAgent, ip, createdAt, lastSeen, revokedAt
- Settings
  - user (User ref, unique), twoFactorEnabled, systemAlerts, maintenanceUpdates, createdAt

Frontend structure (high level)
- app/ — Next.js routes and root layout
- components/ — UI building blocks
  - auth/ — auth forms and management
  - ui/ — common UI primitives (accordion, dialog, table, etc.)
  - domain components — dashboard, maps, maintenance, etc.
- contexts/ — global state providers (auth, lines, notifications)
- hooks/ — reusable hooks
- lib/ — API helpers, token utilities, constants
- styles/ — global CSS

Operational considerations
- JWT & cookies: Token sent via Authorization header, cookie retained for compatibility.
- Error handling:
  - Known errors return structured JSON; duplicate key errors map to 409.
  - Unknown exceptions return 500 with generic message (server logs capture details).
- Cold starts & transient errors: Client includes retry/backoff for GET requests on 502/503/504.

File-by-file index (generated summary)
- See the repository tree for complete coverage. Key files:
  - client/app/layout.tsx: Root React layout, theme providers, analytics, and shell
  - client/lib/api.ts: Fetch helper, base URL resolution, retry/backoff
  - client/components/*: UI and domain modules (dashboard, maps, charts, etc.)
  - server/src/index.ts: Express app bootstrap, CORS, middleware, routes
  - server/src/config/env.ts: Zod-validated env schema and loader
  - server/src/routes/*.ts: REST endpoints grouped by domain
  - server/src/models/*.ts: Mongoose schemas for core entities
  - server/src/middleware/*.ts: Auth and error handling
  - server/src/controllers/*.ts: Route handlers
  - DEPLOY.md: How to deploy to Render and Vercel
  - render.yaml: Optional Render blueprint

Contributing
- Standard GitHub flow: feature branch, PRs, code review.
- Node versions: Align local Node with cloud (Node 18+ recommended; Render uses Node 22).
- Install, build, test locally:
  - Backend: npm --prefix server ci && npm --prefix server run build && npm --prefix server start
  - Frontend: set NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api then npm --prefix client ci && npm --prefix client run dev
