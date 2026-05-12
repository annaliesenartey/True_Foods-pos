# Handoff — True Foods POS

> This file is rewritten at the end of every phase. It tells the next session exactly where we left off and what to do next.

---

## Last Completed Phase
**Phase 1 — Scaffold & Setup** (2026-05-12)

## State of the Codebase
- Next.js 15 App Router PWA, fully scaffolded in `D:\true-foods-pos`
- shadcn/ui + Tailwind v4 installed and themed (True Foods green + amber)
- Supabase SSR auth wired up (middleware, server/client helpers, login form, sign-out)
- Playwright installed with video recording; Phase 1 tests in `tests/phase1-login.spec.ts`
- GitHub repo **not yet created** — see `TODO.md` item #1
- Supabase project **not yet configured** — see `TODO.md` items #2–4
- All dashboard routes `/products`, `/orders`, `/orders/new`, `/reports`, `/settings` are placeholder pages

## Blockers Before Phase 2 Can Start
1. User must complete all items in `TODO.md` (GitHub repo, Supabase project, env vars)
2. `npm run dev` should be confirmed working (`http://localhost:3000` shows login page)

## What Phase 2 Will Build
- Supabase `products` table (migration SQL in `/supabase/migrations/`)
- Products list page — table with add/edit/delete
- Product form — name, description, price (GHS), category, stock quantity, image upload
- Category management (e.g. Plain Yoghurt, Fruit Yoghurt, Smoothies)
- Playwright tests for all product CRUD operations

## Key Files to Know
| File | Purpose |
|------|---------|
| `src/middleware.ts` | Auth guard — protects all routes except /login |
| `src/lib/supabase/server.ts` | Server component Supabase client |
| `src/lib/supabase/client.ts` | Browser component Supabase client |
| `src/app/login/actions.ts` | `signIn` / `signOut` server actions |
| `src/components/layout/sidebar.tsx` | Main nav — add new routes here |
| `TODO.md` | Manual steps still needed |
| `docs/session-log.md` | Full change history |

## Comment Convention (for Cursor/Claude Code switching)
- `// TODO(phase-N):` — work planned for phase N
- `// NOTE:` — non-obvious decisions
- `// FIXME:` — known issues to address
- `// CURSOR:` — left by Cursor sessions
- `// CLAUDE:` — left by Claude Code sessions

All important decisions also recorded in `docs/session-log.md`.
