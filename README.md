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
- **Weekly protocol tips** — a rotating weekly tip for each of diet,
  stretching, aerobic, anaerobic, and resistance training.
- **Unlimited UGC video clips** — upload short workout example videos (form
  demos, session highlights). Stored on-device in IndexedDB with no app-imposed
  limits.
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
