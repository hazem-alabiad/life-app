# Life App

A calm, local-first companion for movement, focus, and nourishment. Mobile-first, installable
as a PWA, dark-first with a fully designed light mode.

**Live: [hazem-alabiad.github.io/life-app](https://hazem-alabiad.github.io/life-app/)**

Data stays in your browser by default — no analytics, no tracking. Optional cloud sync via
GitHub sign-in mirrors your data to Supabase; see [Cloud sync](#cloud-sync) below.

## Running it

```bash
npm install
npm run dev        # http://localhost:8000 (pinned in vite.config.ts so the Supabase OAuth callback lands back on the running app)
npm run build      # type-checks, then builds to dist/
npm run preview    # serve the production build
npm run typecheck
```

The build uses a relative base (`base: './'`), so `dist/` works from a GitHub Pages project
subpath, a custom domain, or the local preview server without changes.

## What is real and what is seeded

Being explicit about this matters more than looking finished.

| Area | Now | Swappable for |
| --- | --- | --- |
| Exercise catalogue | 41 hand-written movements in `src/data/exercises.ts` | ExerciseDB — map its shape onto `Exercise` |
| Movement art | Locally drawn SVG tiles (`ExerciseArt`) | ExerciseDB animated GIFs |
| Meal analysis | Parked — no nourish module ships in this build | A vision model behind an `estimateMeal` signature, if it returns |
| Daily insights | Curated written set in `src/data/insights.ts`, rotated by day | A feed, if you ever want one |
| Workout suggestions | Deterministic "least recently trained" ranking | A model, behind `suggestWorkout` |
| Storage | `localStorage`, versioned and migrated on read | already here: see [Cloud sync](#cloud-sync) |

Sample history is seeded on first launch so the screens have something to draw. The Insights
view says so, and Settings has a button to clear it. Nothing seeded pretends to be your data.

## Structure

```
src/
  App.tsx              tab routing, overlays, sheet host
  types.ts             the domain model
  state/store.tsx      one reducer, persistence, theme, timestamp-driven timer
  lib/                 date, formatting, selectors, wake lock, meal estimator
  data/                seeded exercise, food, insight, recipe and demo data
  components/          card, button, chip, ring, bar, trend line, sheet, controls
  screens/             home, move/, focus/, nourish/, sheets/
```

State lives in one `useReducer` store. Derived reads go through `src/lib/selectors.ts` so two
cards can never disagree about the same week.

The timer stores an absolute end timestamp rather than a decrementing counter, so it stays
correct while the tab is backgrounded or the screen is locked, and resumes after a reload.

## Accessibility

- Type is sized in `rem`, so it follows the OS or browser font-size setting.
- Every interactive target is at least 44px.
- Colour is never the only signal — module accents always travel with an icon or a label.
- One visible focus ring, a real dialog role on every sheet, Escape to dismiss, and
  `prefers-reduced-motion` respected throughout.

## Cloud sync

Optional. Without it the app is fully local — clearing site data clears the app.

Sign in once with GitHub (Settings → Cloud sync) and the app's state is mirrored to a
Supabase Postgres table as a per-user snapshot. The local copy stays the source of truth:
the supervisor uploads after each change, and on a new device the fresher snapshot wins
(last-writer-wins via timestamps).

- **Privacy** is enforced by Postgres Row Level Security — each user can only read/write
  their own row (`auth.uid() = user_id`), never by client code. The Supabase publishable
  key and project URL are public identifiers; they are designed to be embedded.
- **GitHub-only** sign-in via PKCE OAuth. No passwords ever touch the app.
- The Supabase SDK ships in a lazily-loaded chunk, so signed-out visitors never download it
  and the main bundle stays at ~224 KiB. Deployments without the env vars look and behave
  exactly like a local-only build.

Setup (one-time, each step is manual by design):

1. Create the `user_state` table: paste [`supabase/schema.sql`](supabase/schema.sql) into
   the Supabase SQL editor.
2. Enable the GitHub provider in Supabase Auth, wired to a GitHub OAuth App whose callback
   is `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Allowlist the app origin in Supabase → Auth → URL Configuration → Redirect URLs:
   `http://localhost:8000`, `http://localhost:5173`, and your production origin
   (e.g. `https://hazem-alabiad.github.io/life-app/`). If the dev origin is
   missing, Supabase falls back to the Site URL and the browser lands on a dead
   `http://localhost:8000/?code=…` page (`ERR_CONNECTION_REFUSED`).

## Known limits

- The camera cannot keep recording while the screen is locked, and photo analysis runs on-device
  rather than against a model. Both are properties of the current build, not of the design.
- The Home mini-card reflects a running Pomodoro, not a running stretch flow.
- PWA icons are SVG. iOS home-screen installs prefer PNG `apple-touch-icon` files.
