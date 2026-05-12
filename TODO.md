# TODO — Manual Steps Required

> These require your action. Claude/Cursor cannot do them automatically.
> Check off each item as you complete it, then let me know so we can proceed.

---

## Phase 1 — Must complete before Phase 2 starts

### 1. Create GitHub Repository
- [ ] Go to https://github.com/new
- [ ] Repository name: `True_Foods-pos`
- [ ] Set to **Private** or **Public** (your choice)
- [ ] Do NOT initialise with README (we have our own)
- [ ] Click **Create repository**
- [ ] Run these commands in `D:\true-foods-pos`:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/True_Foods-pos.git
  git branch -M main
  git push -u origin main
  ```

### 2. Create Supabase Project
- [ ] Go to https://supabase.com and sign in
- [ ] Click **New project**
- [ ] Name: `true-foods-pos`
- [ ] Choose a strong database password (save it!)
- [ ] Region: Pick nearest to Ghana (e.g. **West Europe** or **US East**)
- [ ] Click **Create new project** and wait ~2 minutes

### 3. Copy Supabase Credentials
- [ ] In your Supabase project: go to **Settings > API**
- [ ] Copy **Project URL** and **anon public** key
- [ ] Create `D:\true-foods-pos\.env.local` (copy from `.env.local.example`):
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  ```

### 4. Create First Staff User in Supabase
- [ ] In Supabase: go to **Authentication > Users**
- [ ] Click **Add user > Create new user**
- [ ] Enter your staff email and a password
- [ ] This is the login you'll use to test the POS

### 5. Sign up for mNotify (Phase 4 — not urgent yet)
- [ ] Go to https://mnotify.com
- [ ] Sign up for a business account
- [ ] Get your API key from the dashboard
- [ ] Add to `.env.local`:
  ```
  MNOTIFY_API_KEY=your-key
  MNOTIFY_SENDER_ID=TrueFoods
  ```

---

## How to Test After Completing Steps 1–4
```bash
cd D:\true-foods-pos
npm run dev
```
Open http://localhost:3000 — you should be redirected to `/login`.  
Sign in with the staff user you created in step 4.  
You should see the dashboard.

---

_Last updated: Phase 1 (2026-05-12)_
