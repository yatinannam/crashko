# Crashko

AI-powered burnout prediction and recovery assistant for students. Log your daily metrics and receive a computed burnout score, risk classification, and a personalised AI-generated recovery plan — all in seconds.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Burnout Engine](#burnout-engine)
- [Authentication](#authentication)
- [Database](#database)
- [Data Lifecycle](#data-lifecycle)
- [Security](#security)
- [Observability](#observability)
- [Deployment](#deployment)

---

## Overview

Crashko helps engineering students monitor and prevent burnout. Each check-in captures sleep hours, study hours, stress level, pending tasks, and upcoming deadlines. A deterministic weighted engine computes a burnout score (0–100) and risk tier, and a Groq LLM call returns a structured recovery plan with actionable steps for the next 24 hours.

---

## Features

- Daily burnout check-in form with client-side validation
- Deterministic burnout score computation with trend amplification across the last 3 days
- AI recovery plan generated via Groq (Llama 3.3 70B) including diagnosis, recovery steps, study restructuring advice, and recommended Pomodoro duration
- 7-day and 30-day trend graphs for burnout score, sleep, study, and stress
- Paginated check-in history
- Google OAuth authentication via NextAuth.js (JWT strategy)
- Per-user in-memory rate limiting on all mutating API routes
- Zod schema validation on all API inputs — `userId` is always sourced from the authenticated session, never from request body
- Crash alert banner triggered when burnout score exceeds threshold
- Focus mode card with dynamically recommended Pomodoro duration
- Vercel Web Analytics and Speed Insights instrumented at the root layout

---

## Tech Stack

| Layer                   | Technology                                  |
| ----------------------- | ------------------------------------------- |
| Framework               | Next.js 16 (App Router)                     |
| Language                | TypeScript 5                                |
| Styling                 | Tailwind CSS v4                             |
| Animation               | Framer Motion                               |
| Charts                  | Recharts                                    |
| Icons                   | Lucide React                                |
| Auth                    | NextAuth.js v4 (Google OAuth, JWT)          |
| Database                | MongoDB via Mongoose                        |
| AI                      | Groq API (Llama 3.3 70B Versatile)          |
| Validation              | Zod v4                                      |
| Linting / Formatting    | Biome                                       |
| Secret Management (dev) | Doppler                                     |
| Observability           | Vercel Web Analytics, Vercel Speed Insights |
| Deployment              | Vercel                                      |

---

## Project Structure

```
src/
  app/
    layout.tsx              # Root layout — fonts, providers, Analytics, SpeedInsights
    page.tsx                # Public landing page
    legal/page.tsx          # Unified legal page (privacy + terms)
    dashboard/page.tsx      # Authenticated dashboard — check-in + analysis
    globals.css
    api/
      analyze/route.ts      # POST  /api/analyze  — compute burnout + call Groq
      chat/route.ts         # POST  /api/chat     — regenerate AI response
      history/route.ts      # GET   /api/history  — paginated burnout logs
      trends/route.ts       # GET   /api/trends   — time-series data for charts
      auth/
        [...nextauth]/route.ts
        signup/route.ts
    history/page.tsx
    settings/page.tsx
    signup/page.tsx
    trends/page.tsx
  components/
    BurnoutForm.tsx
    ChatbotPanel.tsx
    ScoreCard.tsx
    TrendGraph.tsx
    CrashAlertBanner.tsx
    FocusModeCard.tsx
    Navbar.tsx
    AuroraOrbs.tsx
    AuthSessionProvider.tsx
    GlassCard.tsx
    ShinyText.tsx
    Tooltip.tsx
  hooks/
    useBurnoutForm.ts
    useTrends.ts
  lib/
    authOptions.ts          # NextAuth configuration
    burnoutEngine.ts        # Deterministic score computation
    groqClient.ts           # Groq API wrapper (server-only)
    mongodb.ts              # Mongoose connection with caching
    rateLimit.ts            # In-memory per-key rate limiter
    validations.ts          # Zod schemas
  models/
    BurnoutLog.ts           # Mongoose model — per-user time-series logs
    User.ts
  types/
    index.ts                # Shared TypeScript interfaces
  proxy.ts                  # NextAuth middleware — route protection + auth redirects
public/
  favicon.png
```

---

## Environment Variables

Create a `.env.local` file in the project root (or configure these in Doppler / Vercel):

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# Groq
GROQ_API_KEY=<from console.groq.com>

# Optional: Upstash Redis (production-grade distributed rate limiting)
UPSTASH_REDIS_REST_URL=<from upstash console>
UPSTASH_REDIS_REST_TOKEN=<from upstash console>
```

**Never commit `.env.local` to version control.**

To generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Bun >= 1.0
- A running MongoDB instance or Atlas cluster

### Option A — Doppler (recommended for team use)

Doppler syncs secrets automatically. Install the CLI and authenticate:

```bash
# Install Doppler CLI (macOS/Linux)
brew install dopplerhq/cli/doppler

# Windows (PowerShell)
winget install Doppler.doppler

# Authenticate
doppler login

# Link the project
doppler setup
```

Run the development server with secrets injected:

```bash
bun run dev
```

### Option B — Without Doppler

Manually create `.env.local` with the variables listed above, then run:

```bash
bun run dev:local
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script                | Description                                      |
| --------------------- | ------------------------------------------------ |
| `bun run dev`         | Start dev server with Doppler secrets injected   |
| `bun run dev:local`   | Start dev server using `.env.local`              |
| `bun run build`       | Production build                                 |
| `bun run build:local` | Production build using `.env.local`              |
| `bun run start`       | Start production server (requires a prior build) |
| `bun run lint`        | Run Biome linter                                 |
| `bun run format`      | Auto-format all files with Biome                 |

---

## API Reference

All routes require an authenticated session except `POST /api/auth/*`.

### `POST /api/analyze`

Computes burnout score and fetches an AI recovery plan.

**Request body:**

```json
{
  "sleepHours": 5,
  "studyHours": 10,
  "stressLevel": 8,
  "tasksPending": 12,
  "deadlinesSoon": 2
}
```

**Rate limit:** 8 requests per minute per user.

**Response:**

```json
{
  "result": {
    "score": 78,
    "risk": "High Risk",
    "flags": ["sleep-deficit", "deadline-cluster"],
    "crashProbability": 82,
    "focusMode": 25
  },
  "ai": {
    "shortDiagnosis": "...",
    "recoveryPlan": ["...", "..."],
    "studyRestructuring": "...",
    "oneMotivationalLine": "...",
    "recommendedPomodoroMinutes": 25,
    "tags": ["low-sleep", "deadline-cluster"]
  }
}
```

### `POST /api/chat`

Regenerates the AI response for an existing burnout result without re-computing or persisting.

**Rate limit:** 15 requests per minute per user.

### `GET /api/history?page=1&limit=20`

Returns paginated burnout logs newest-first. Maximum `limit` is 50.

### `GET /api/trends?days=7`

Returns deduplicated daily burnout data for charting. Maximum `days` is 30.

---

## Burnout Engine

Located in `src/lib/burnoutEngine.ts`. The engine is deterministic, has no external dependencies, and runs synchronously.

**Sub-scores (each 0–100):**

| Factor               | Weight | Notes                                       |
| -------------------- | ------ | ------------------------------------------- |
| Study hours          | 28%    | Steep increase above 8 h/day                |
| Sleep deficit        | 27%    | Progressive penalty per hour under 8 h      |
| Stress level         | 20%    | Non-linear — upper range (8–10) hits harder |
| Deadlines within 48h | 15%    | Exponential — 1 = 40, 2 = 80, 3+ = 100      |
| Pending tasks        | 10%    | Logarithmic scale                           |

**Trend multiplier:** If the average burnout score across the last 3 days exceeds 60, today's score is amplified by up to 15% to reflect sustained load.

**Risk tiers:**

| Score  | Risk      |
| ------ | --------- |
| 0–30   | Safe      |
| 31–60  | At Risk   |
| 61–100 | High Risk |

---

## Authentication

Google OAuth via NextAuth.js. JWT session strategy — no database sessions required.

- `session.user.id` is populated from `token.sub` (Google subject ID)
- All API routes verify the session server-side via `getServerSession(authOptions)` — the `userId` is never accepted from request bodies
- Unauthenticated requests to protected pages are redirected to `/signup` by the NextAuth middleware in `src/proxy.ts`
- The root route (`/`) is public; the app dashboard lives at `/dashboard`
- Authenticated users visiting `/signup` are redirected to the dashboard

---

## Database

MongoDB with Mongoose. Connection is cached on the module level to avoid creating multiple connections in serverless environments.

**BurnoutLog schema fields:**

`userId`, `sleepHours`, `studyHours`, `stressLevel`, `tasksPending`, `deadlinesSoon`, `burnoutScore`, `risk`, `flags`, `crashProbability`, `focusMode`, `createdAt`

**Indexes:** `userId` (single), `createdAt` (single), `{ userId, createdAt: -1 }` (compound for per-user time-series queries).

All API routes degrade gracefully when the database is unavailable — score computation and AI generation continue, but logs are not persisted.

---

## Data Lifecycle

- Collection: Crashko collects daily check-in fields (`sleepHours`, `studyHours`, `stressLevel`, `tasksPending`, `deadlinesSoon`) and Google profile fields (`email`, `name`, `image`) during sign-in.
- Validation: API routes validate all user input using Zod before processing.
- Processing: The burnout engine computes score, risk, flags, crash probability, and recommended focus mode.
- AI usage: Check-in context is sent to Groq only when the user gives explicit consent during submission.
- Storage: Burnout logs are stored in MongoDB and scoped by authenticated `userId`.
- Retention: Burnout logs include a TTL expiry (`expiresAt`) set to 365 days by default.
- User controls: Users can delete all burnout logs or delete their entire account from Settings.

---

## Security

- Security headers set globally in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, and a strict `Content-Security-Policy`
- Input validated with Zod on every API route before any processing
- `userId` is always sourced from the server-side session, never from the request body
- In-memory rate limiting on all mutating routes per user
- Google OAuth credentials and all secrets stored exclusively in environment variables — never in source code

---

## Observability

Vercel Web Analytics and Speed Insights are instrumented in the root layout (`src/app/layout.tsx`).

To activate them:

1. Go to your Vercel project dashboard.
2. Enable **Web Analytics** under the Analytics tab.
3. Enable **Speed Insights** under the Speed Insights tab.
4. Deploy — data starts flowing immediately after the first visit.

Both features are available on all Vercel plans.

---

## Deployment

The project is deployed on Vercel.

### Deploy via Git (recommended)

1. Push the repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add all environment variables from the [Environment Variables](#environment-variables) section in the Vercel project settings.
4. Every push to `main` triggers an automatic production deployment.

### Deploy via CLI

```bash
bun add -g vercel
vercel login
vercel --prod
```

### Google OAuth redirect URI

In [Google Cloud Console](https://console.cloud.google.com/), add the following to your OAuth client's authorised redirect URIs:

```
https://<your-vercel-domain>/api/auth/callback/google
```

Replace `<your-vercel-domain>` with your actual Vercel deployment URL.
