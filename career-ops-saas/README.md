# Career-Ops SaaS

Launch-ready Career-Ops SaaS with minimal cookie auth, agentic evaluation, and polished dashboard UX.

## What is included
- Minimal auth with secure httpOnly cookie sessions:
  - `/login`
  - `/signup`
  - `/api/auth/signin`
  - `/api/auth/signout`
  - `/api/auth/me`
  - `src/proxy.ts`
- Agentic job evaluation with OpenAI primary path and fallback
- Hardened API envelope format (`success`, `data`, `error`, `traceId`)
- Rate-limited API endpoints for intake/evaluation/scan/billing
- Polished dashboard flow with onboarding, evaluate, pipeline, settings
- Owner user list page: `/users`
- Launch docs:
  - `docs/LAUNCH_CHECKLIST.md`
  - `docs/INCIDENT_ROLLBACK.md`

## Run locally
1. Copy `.env.example` to `.env`.
2. Install deps:
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Reset and seed clean launch data from zero:
   - `npm run db:reset`
   - `npm run db:seed:launch`
5. Start app:
   - `npm run dev`

## Required env vars (Vercel/Postgres ready)
- `DATABASE_URL` (Vercel Postgres connection string)
- `AUTH_SECRET` (long random secret for session hashing)
- `OWNER_EMAIL` (only this email can view `/users`)

## Seeded launch users
- `owner@careerops.app / Owner123!`
- `admin@careerops.app / Admin123!`
- `pro@careerops.app / ProUser123!`
- `free@careerops.app / FreeUser123!`

## Quality checks
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:smoke`
