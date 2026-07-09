# FORGE — Build The Body You Chose

A premium, monetization-ready fitness PWA with a sleek, modern, masculine feel.

## What it does

- **Pick your aesthetic** — Greek God, Shredded, Mass Monster, Hybrid Athlete, or
  Warrior. Your choice drives training and nutrition.
- **Proven, viral programs** — Push/Pull/Legs, 5×5 linear progression, the
  Arnold-style Golden Era split, a 75-Hard-style Gauntlet challenge, a HIIT
  Shred Protocol, and the Hybrid Engine lift+run method.
- **Nutrition engine** — Mifflin-St Jeor BMR → TDEE → goal-adjusted calories
  and macros (1 g protein/lb, 25% fat), with full day-of-eating meal plans per
  goal (cut / recomp / bulk).
- **Photo check-in / check-out** — every workout starts with a check-in photo
  and can only be completed with a check-out photo. Photos build a
  transformation timeline.
- **Milestones & rewards** — XP, rank levels (RECRUIT → LEGEND), streak
  tracking, and claimable milestone rewards (cheat-meal tokens, rest-day
  passes, badges, titles).
- **Weekly streaks + mulligan** — a week-streak counter tied to your program's
  scheduled sessions, a full-screen celebration when the weekly target is hit,
  and one automatic "mulligan" per week: a single missed workout is forgiven
  before the chain breaks.
- **Weekly protocol tips** — a rotating weekly tip for each of diet,
  stretching, aerobic, anaerobic, and resistance training.
- **Unlimited UGC video clips** — upload short workout example videos (form
  demos, session highlights). Stored on-device in IndexedDB with no app-imposed
  limits.
- **Metric & imperial intake** — the onboarding baseline takes ft/in + lbs or
  cm + kg; macros are computed identically either way.
- **Animated form demos** — every exercise row can surface a 5-second stylized
  animation (bold-ink comic-book look). Clips live in `public/demos/`, the
  registry is `src/data/demos.ts`, and `scripts/demo-prompts.json` holds the
  per-exercise Higgsfield generation prompts (47 movements) so the library can
  be generated or regenerated consistently.
- **Installable PWA shell** — mobile-first, works great added to a home screen.

## Monetization

Freemium out of the box:

| Free | Premium ($9.99/mo · $59.99/yr) |
| --- | --- |
| 2 starter programs (PPL, Iron 5×5) | All 6 programs incl. PRO |
| Macro targets + 2 meals/day preview | Full meal plans for every goal |
| Last 6 progress photos | Unlimited transformation timeline |

**To start charging:** create two [Stripe Payment Links](https://stripe.com/payments/payment-links)
and paste them into `src/config.ts` (`stripeMonthlyLink`, `stripeYearlyLink`).
The paywall opens them directly — no backend needed to launch. An unlock code
(`founderCode` in the same file, default `FORGED`) lets you comp promo users.

## Native apps (App Store & Google Play)

The repo ships with ready-to-build native projects via Capacitor — `android/`
(Android Studio → Google Play) and `ios/` (Xcode → App Store) — including app
icons, splash screens, camera/photo permission declarations, dark status bars,
and safe-area handling. The paywall is platform-aware: web uses Stripe links,
native builds route through the In-App Purchase stub in `src/lib/billing.ts`
(store policy requires IAP for subscriptions).

```bash
npm run sync      # rebuild web app and copy into both native shells
npm run android   # open in Android Studio
npm run ios       # open in Xcode (macOS)
```

See **STORE_SUBMISSION.md** for the full step-by-step path to both stores,
and **PRIVACY.md** for a ready-to-host privacy policy.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, GitHub
Pages). All data is stored on-device (localStorage + IndexedDB) — no server
required.

## Stack

React 18 · TypeScript · Vite · zero runtime dependencies beyond React.
