# Vahini deployment

This repository is a monorepo:
- client/ — Next.js app (deploy on Vercel)
- server/ — Node + Express API (deploy on Render)

Quick start
1) Backend (Render)
- In Render, create a Web Service from this repo.
- Choose “Root Directory” = server
- Build command: npm install && npm run build
- Start command: npm start
- Environment variables:
  - NODE_ENV=production
  - MONGO_URI=your MongoDB URI (required)
  - JWT_SECRET=long random string (required)
  - CORS_ORIGIN=https://your-frontend-domain.vercel.app (set after frontend deploy)
- Alternatively, use the blueprint in render.yaml (in repo root) and fill env vars.

2) Frontend (Vercel)
- Import the repo in Vercel and set “Root Directory” = client
- Build command: npm run build
- Output directory: .next (default)
- Environment variables:
  - NEXT_PUBLIC_API_BASE_URL=https://<your-render-app>.onrender.com/api
- You can copy client/.env.local.example → .env.local for local testing.

Local prod sanity check
- Backend:
  npm --prefix server ci && npm --prefix server run build && npm --prefix server run start
- Frontend:
  set NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api (PowerShell)
  npm --prefix client ci && npm --prefix client run build && npm --prefix client run start

Notes
- The server already supports CORS via CORS_ORIGIN; ensure it matches your Vercel domain.
- Demo mode is supported in the client (Live demo) with limited write capabilities.
