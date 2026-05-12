# True Foods POS

A Progressive Web App (PWA) Point of Sale system for **True Foods** — a Ghanaian yoghurt business.

> Works on desktop and mobile. Installable on Android/iOS like a native app.

---

## Features (by phase)

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Scaffold, PWA setup, staff login | ✅ Complete |
| 2 | Product catalogue (add/edit/delete yoghurt products) | 🔜 Next |
| 3 | POS order screen — cart, checkout | ⏳ Planned |
| 4 | Invoice generation + SMS via mNotify (Ghana) | ⏳ Planned |
| 5 | Order history + sales reports | ⏳ Planned |
| 6 | Playwright test suite + video report | ⏳ Planned |
| 7 | Offline mode, PWA polish, mobile UX | ⏳ Planned |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Database & Auth | Supabase (PostgreSQL) |
| Invoice SMS | mNotify (Ghana) |
| PDF Invoice | @react-pdf/renderer |
| Testing | Playwright (video recording) |
| PWA | next-pwa (service worker) |

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and mNotify API key
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Run tests
```bash
npx playwright test
# Video report opens at playwright-report/index.html
```

---

## Project Structure

```
src/
  app/
    login/              # Auth pages + server actions
    (dashboard)/        # Protected routes (all require login)
      page.tsx          # Dashboard home
      products/         # Product catalogue
      orders/           # Order history
      orders/new/       # POS order screen
      reports/          # Sales reports
      settings/         # App settings
  components/
    auth/               # Login form
    layout/             # Sidebar + mobile header
    ui/                 # shadcn/ui components
  lib/
    supabase/           # Supabase client (browser + server)
  middleware.ts         # Auth guard

docs/
  session-log.md        # Full change history by phase
HANDOFF.md              # Current state + what is next
TODO.md                 # Manual steps required from you
```

---

## Manual Setup Required

See [TODO.md](./TODO.md) for steps you need to complete (GitHub repo, Supabase project, staff user creation).

---

## Comment Conventions (for Claude Code and Cursor switching)

- `// TODO(phase-N):` — planned for phase N
- `// NOTE:` — non-obvious decision
- `// FIXME:` — known issue
- `// CURSOR:` — added during a Cursor session
- `// CLAUDE:` — added during a Claude Code session

---

_Built with Claude Code · True Foods 2026_
