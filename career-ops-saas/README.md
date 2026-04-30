# Career-Ops SaaS

Launch-ready Career-Ops SaaS with Firebase auth, agentic evaluation, and polished dashboard UX.

## What is included
- Firebase email/password auth:
  - `/login`
  - `/signup`
  - client session gate in `src/app/page.tsx`
  - Firebase config in `src/lib/firebase.ts`
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

## Required env vars (Firebase + Vercel/Postgres)
- `DATABASE_URL` (Vercel Postgres connection string)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_OWNER_EMAIL` (owner gate for `/users` message)

## Firebase users
- Create users from `/signup`
- Or manage users from Firebase Console → Authentication

## Quality checks
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:smoke`
