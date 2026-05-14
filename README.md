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
3. In **Project → Settings → Environment Variables**, add at least:
   - `OPENROUTER_API_KEY` — your server-side key (never use `NEXT_PUBLIC_` for this).
   - `NEXT_PUBLIC_SITE_URL` — your production URL (e.g. `https://kitty-party.vercel.app`).
   - Optional: `OPENROUTER_REFERRER` (same as site URL), `OPENWEATHERMAP_API_KEY`, Supabase vars from `.env.example`.
4. Redeploy after saving env vars.

Local secrets: copy `.env.example` to `.env.local` (git-ignored) for development.
