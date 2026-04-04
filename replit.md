# DBA Forge

SQL Server DBA training platform for aspiring and junior DBAs. Freemium model — Module 1 is free, Modules 2-5 require a one-time premium unlock ($69).

## Architecture

**Monorepo (pnpm workspaces)**
- `artifacts/dba-forge` — React + Vite frontend (dark theme, forge-themed UI)
- `artifacts/api-server` — Express API server (TypeScript, compiled with esbuild)
- `lib/db` — Drizzle ORM + PostgreSQL schema
- `lib/api-spec` — OpenAPI spec
- `lib/api-client-react` — Orval-generated TanStack Query hooks
- `lib/api-zod` — Orval-generated Zod schemas

## Features

- 5 training modules: Fundamentals (free), Backups, Recovery Models, Security, SQL Agent
- Each module has 7 lessons: Scenario → Lesson → Code → Mistakes → Simulation → Lab → Checklist
- Free DBA Quick Reference section (6 categories, 24 cards) — no login required
- Progress tracking per user/module/lesson in PostgreSQL
- Clerk authentication (sign in / sign up)
- Stripe payment checkout ($69 one-time unlock) — graceful degradation without Stripe key

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET` — session secret (set)
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (set via Clerk integration)
- `CLERK_SECRET_KEY` — Clerk secret key (set via Clerk integration)
- `STRIPE_SECRET_KEY` — Stripe secret key (optional, set to enable real payments)

## API Routes

All routes under `/api`:
- `GET /modules` — list all modules with lock status
- `GET /modules/:moduleId` — module detail with lessons (403 if locked)
- `GET /progress` — user's progress across modules (auth required)
- `POST /progress/:moduleId` — update lesson progress (auth required)
- `GET /quick-reference` — all quick reference sections/cards (public)
- `GET /user/profile` — user profile + premium status (auth required)
- `POST /payments/create-checkout` — create Stripe checkout session (auth required)
- `GET /payments/verify` — verify payment and unlock premium (auth required)
- `GET /stats/overview` — platform-wide stats (public)

## DB Schema

- `users` — userId, email, isPremium, premiumSince, createdAt
- `module_progress` — userId, moduleId, completedLessonIds[], percentComplete, completedAt
- `payments` — userId, stripeSessionId, status, createdAt

## Frontend Pages

- `/` — Landing page (public, redirects to /modules if signed in)
- `/modules` — Module library with progress/lock status (auth required)
- `/modules/:moduleId` — Lesson player with sidebar and content area (auth required)
- `/quick-reference` — Searchable quick reference (public)
- `/settings` — User profile and premium status (auth required)
- `/payment-success` — Payment verification and redirect (auth required)
- `/sign-in` — Clerk sign in
- `/sign-up` — Clerk sign up

## Content

All module and lesson content is hardcoded in `artifacts/api-server/src/lib/content.ts`.
Quick reference content is in `artifacts/api-server/src/lib/quickReference.ts`.
No database tables for content — static files only.
