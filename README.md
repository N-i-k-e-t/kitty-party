# Saheli

**Saheli** is a mobile-first “social gathering operating system” for kitty parties and women’s circles: onboarding, a planner with rich cards (themes, venues, budget, games, invitations, timelines), **OpenRouter-backed AI** (with heuristic fallback), discover with OpenStreetMap, IndexedDB persistence, and a premium ivory / champagne / rose / lavender UI.

## Commands

```powershell
cd d:\kitty-party
npm install
npm run dev
```

Then open `http://localhost:3000`. First visit redirects to `/onboarding` until preferences exist.

```powershell
npm run lint
npm run build
```

## Architecture (short)

- **Next.js 16** App Router under `src/app/`, main routes in the `(main)` group wrapped by `AppFrame` (app bar + bottom nav / side rail).
- **State**: Zustand stores in `src/store/`; **persistence** via `idb-keyval` in `src/lib/memory.ts` (preferences, plans, saved venues/themes/members).
- **Engines** in `src/lib/engines/` (venues, budget, themes, games, invitation, recommend) plus **AI** in `src/lib/ai/` (OpenRouter via `src/app/api/ai/*`, modular adapters, orchestrator, prompts, ranker, memory tiers).
- **Design system** in `src/components/ui/`, tokens in `src/styles/tokens.css` and `src/app/globals.css` (Tailwind v4 `@theme`).
- **PWA**: `public/manifest.webmanifest`, `public/sw.js`, registration in `RegisterServiceWorker`.

## Deploy on Vercel (no auth required for the app)

1. Push this repo to GitHub (see remote below).
2. In [Vercel](https://vercel.com): **Add New Project** → import `N-i-k-e-t/kitty-party` → Framework Preset **Next.js** → Deploy.
3. In **Project → Settings → Environment Variables**, add at least (use **Production** and **Preview** as needed):
   - `OPENROUTER_API_KEY` — paste from [OpenRouter → Keys](https://openrouter.ai/keys) (server-only; never `NEXT_PUBLIC_*` or commit to Git).
   - `NEXT_PUBLIC_SITE_URL` — `https://kitty-party0.vercel.app` (your live URL).
   - `OPENROUTER_REFERRER` — `https://kitty-party0.vercel.app` (matches OpenRouter’s optional referrer header).
   - Optional: `OPENWEATHERMAP_API_KEY`, Supabase vars from `.env.example`.
4. Redeploy after saving env vars.

Local secrets: copy `.env.example` to `.env.local` (git-ignored) for development.
