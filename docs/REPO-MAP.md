# Vahini — Repository Map (Appendix)

This appendix lists notable files and directories in the repository to help navigation. It is generated from the current tree and may evolve as the project changes.

client/
- app/
  - dashboard/page.tsx — Dashboard route
  - forgot-password/page.tsx — Forgot password route
  - globals.css — Global CSS
  - layout.tsx — Root layout & providers
  - login/page.tsx — Login route
  - page.tsx — Landing page
  - profile/page.tsx — Profile route
  - register/page.tsx — Registration route
- components/ — UI building blocks and domain components
  - auth/
    - login-form.tsx — Login form
    - manage-account.tsx — Update account
    - signup-form.tsx — Registration form
  - ui/ — Common UI primitives (accordion, dialog, input, table, etc.)
  - google-map-wrapper.tsx — Google Maps wrapper
  - grid-map.tsx / map-markers.tsx — Map visualization
  - dashboard.tsx / settings.tsx / sidebar.tsx — App UI sections
  - ... (other components as named)
- contexts/
  - auth-context.tsx — Authentication context/provider
  - lines-context.tsx — Grid lines context/provider
  - notifications-context.tsx — Notifications provider
- hooks/
  - use-mobile.ts, use-toast.ts — Utility hooks
- lib/
  - api.ts — Fetch helper w/ retry & base URL logic
  - auth-token.ts — Token storage helpers
  - stations.ts — Station data
  - utils.ts — General utilities
- next.config.mjs — Next.js config (build-time flags)
- postcss.config.mjs — PostCSS/Tailwind config
- styles/globals.css — Styles
- package.json — Frontend scripts & deps

server/
- src/index.ts — Express app: CORS, middlewares, routes, startup
- src/config/
  - env.ts — Zod env schema & loader
  - db.ts — Mongoose connection
- src/routes/
  - index.ts — API router mount points
  - auth.routes.ts — Auth endpoints
  - attendance.routes.ts — Attendance endpoints
  - tasks.routes.ts — Task endpoints
  - settings.routes.ts — Settings endpoints
  - sessions.routes.ts — Session endpoints
  - notifications.routes.ts — Notifications endpoints
  - apikeys.routes.ts — API key endpoints
  - health.routes.ts — Health endpoint
  - predict.routes.ts — Predict endpoint
- src/models/
  - User.ts — Users (collection: vahini_users)
  - Task.ts — Tasks
  - Attendance.ts — Attendance records
  - Notification.ts — Notifications
  - Session.ts — Login sessions
  - Settings.ts — Per-user settings
  - ApiKey.ts — API keys
- src/controllers/ — Business logic per route
- src/middleware/
  - auth.ts — Auth guard
  - error.ts — Error/404 handlers
- src/utils/
  - ApiError.ts — Error class
  - asyncHandler.ts — Async wrapper
  - seedAdmin.ts — Optional admin bootstrap
- package.json — Backend scripts & deps
- tsconfig.json — TypeScript config (CommonJS)

root
- DEPLOY.md — Deployment instructions (Vercel + Render)
- render.yaml — Optional Render blueprint
- docs/OVERVIEW.md — Non-technical overview
- docs/TECHNICAL.md — Technical documentation
- docs/REPO-MAP.md — This file
