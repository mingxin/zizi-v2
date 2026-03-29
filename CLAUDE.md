# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zizi 2.0 — a PWA literacy app for children aged 3-6. Core features: photo-based word recognition and picture book storytelling, both powered by Aliyun Qwen AI models. Chinese-language UI.

## Architecture

Monorepo with two main apps:

- **`zizi_app/`** — Frontend (Vue 3 + Vite + TypeScript + TailwindCSS + PWA)
- **`zizi_server/backend/`** — Backend (NestJS + Prisma + PostgreSQL)
- **`zizi_server/admin/`** — Admin dashboard (Vue 3 + Vite, separate build)
- **`ui_reference/`** — Raw Tailwind UI mockups from Stitch; used as visual blueprints, not production code

### Frontend Structure (Feature-Sliced Design)

Source is in `zizi_app/src/`. Follows FSD — absolutely no dumping all logic into global `views` or `components`:

- `core/` — Router, Axios HTTP client (token injection, 401 handling), Pinia stores
- `shared/components/` — Reusable UI (AppHeader, BottomTab, PrimaryButton, GlobalLoading)
- `features/auth/` — Login, register, forgot password
- `features/photo-word/` — Camera capture → Qwen-vl-max recognition → TTS playback
- `features/picture-book/` — Multi-page book capture → AI story generation → audio playback
- `features/settings/` — API key configuration (dual-track: user key or system default)

Each feature has: `pages/` (route components), `api.ts`, `store.ts`.

### Backend Structure

Source is in `zizi_server/backend/src/`. NestJS modular architecture:

- `auth/` — Phone-based registration/login, JWT via Passport, bcrypt passwords
- `photo-word/` — Dashscope Qwen-vl-max image analysis, Qwen3-tts-flash TTS
- `picture-book/` — Multi-page book creation, per-page story + audio generation
- `oss/` — Aliyun STS token generation for frontend direct upload
- `admin/` — Admin management endpoints
- `prisma/` — PrismaClient wrapper (singleton via `onModuleInit`)

Global prefix: `api/`. All routes are under `/api/...`.

### Database (Prisma + PostgreSQL)

Schema at `zizi_server/backend/prisma/schema.prisma`. Key models:
- **User** — phone + hashed password, roles (USER/ADMIN), ban support
- **Book / BookPage** — picture books with cascading page deletion
- **PhotoWord** — recognition results with vocab level (1-4, ages 2-6)
- **AppConfig** — key-value system config

## Commands

### Frontend (`zizi_app/`)
```bash
npm run dev          # Vite dev server
npm run build        # vue-tsc type-check + vite build
npm run preview      # Preview production build
```

### Backend (`zizi_server/backend/`)
```bash
npm run start:dev    # NestJS with --watch
npm run build        # nest build (compiles to dist/)
npm run start:prod   # node dist/src/main
npm run lint         # ESLint with --fix
npm run test         # Jest unit tests
npm run test:e2e     # Jest e2e tests
npx prisma db push   # Push schema changes (used on deploy)
npx prisma generate  # Regenerate Prisma client
```

### Database
After schema changes in `prisma/schema.prisma`:
```bash
cd zizi_server/backend
npx prisma db push      # Apply schema to DB
npx prisma generate     # Regenerate client
```

## Design Tokens

Conflict rule: tokens below override any `ui_reference/` files.

- **Radius:** `rounded-3xl` (24px) for cards, `rounded-full` for buttons
- **Shadow:** `shadow-lg` with soft spread (e.g., `shadow-orange-200/50`)
- **Titles:** `text-2xl font-bold text-warm-gray-800`
- **Body:** `text-base text-warm-gray-600`
- **Transitions:** All interactive elements: `transition-all duration-300 active:scale-95`
- **Brand color:** `#eecd2b` (primary), `#f59e0b` (primary-orange)
- **Font:** Be Vietnam Pro + Noto Sans SC
- **Custom shadows:** `shadow-bubbly`, `shadow-bubbly-sm`, `shadow-float`

## Key Patterns

### API Dual-Track System
Users can provide their own Dashscope API key in Settings. Frontend reads from localStorage and sends via custom headers (`X-LLM-Api-Key`, `X-TTS-Api-Key`). If absent, backend falls back to its environment variable keys.

### Image Upload Flow
Frontend → `GET /api/oss/sts-token` → get temporary Aliyun credentials → direct upload to OSS → pass OSS URL to backend APIs.

### Auth Flow
Phone + password → JWT token stored in localStorage → injected as Bearer token by Axios interceptor. 401 responses trigger auto-logout and redirect to `/login`.

### Render Cold Start Mitigation
All backend API calls must show loading states, as Render free tier has cold starts.

## Deployment

- **Frontend:** Vercel (auto-deploy on push to `main` via GitHub Actions)
- **Backend:** Render (auto-deploy on push to `main`, runs `prisma db push` on every start)
- **CI:** GitHub Actions at `.github/workflows/` — path-filtered (`zizi_app/**` triggers frontend, `zizi_server/backend/**` triggers backend)
- **Env vars:** `DATABASE_URL`, `JWT_SECRET`, `DASHSCOPE_API_KEY`, Aliyun OSS credentials, `PORT=3000`
- **Config file:** `render.yaml` at repo root

## Vibe Coding Discipline

- Only implement what the current prompt asks for — no speculative features
- Each change should be scoped to a single feature directory unless explicitly told otherwise
- Do not modify `core/` unless explicitly requested
