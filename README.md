# Life App

A calm, local-first companion for movement, focus, and nourishment. Four tabs — Home, Move,
Focus, Nourish — built as one visual language rather than three tools bolted together.

Mobile-first, installable as a PWA, dark-first with a fully designed light mode. Nothing leaves
the device: there is no account, no server, and no analytics.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
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
| Meal analysis | On-device heuristic in `src/lib/recognize.ts`: hashes the photo, picks a plausible entry from a seeded food table | A vision model behind the same `estimateMeal` signature |
| Daily insights | Curated written set in `src/data/insights.ts`, rotated by day | A feed, if you ever want one |
| Workout suggestions | Deterministic "least recently trained" ranking | A model, behind `suggestWorkout` |
| Storage | `localStorage`, versioned and migrated on read | A sync layer — the store is a single reducer |

Sample history is seeded on first launch so the screens have something to draw. The Insights view
says so, and Settings has a button to clear it. Nothing seeded pretends to be your data.

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

## Known limits

- The camera cannot keep recording while the screen is locked, and photo analysis runs on-device
  rather than against a model. Both are properties of the current build, not of the design.
- The Home mini-card reflects a running Pomodoro, not a running stretch flow.
- PWA icons are SVG. iOS home-screen installs prefer PNG `apple-touch-icon` files.
