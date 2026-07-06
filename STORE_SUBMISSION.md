# Shipping FORGE to the App Store & Google Play

The repo contains ready-to-build native projects (via Capacitor):

- `android/` — Android Studio project → Google Play
- `ios/` — Xcode project → Apple App Store

The web app in `src/` is the single source of truth. After any web change:

```bash
npm run sync          # builds the web app and copies it into both native shells
npm run android       # sync + open in Android Studio
npm run ios           # sync + open in Xcode (macOS only)
```

---

## 0. One-time setup

| | Google Play | Apple App Store |
| --- | --- | --- |
| Account | [Play Console](https://play.google.com/console) — $25 one-time | [Apple Developer Program](https://developer.apple.com/programs/) — $99/year |
| Tooling | Android Studio (any OS) | Xcode on macOS (required — no way around this for the final build) |
| App ID | `com.forgefit.app` — change in `capacitor.config.ts`, `android/app/build.gradle`, and Xcode **before first upload**; it's permanent once published | Same bundle ID registered in your Apple Developer account |

If you don't own a Mac, options for the iOS build: a cheap used Mac mini,
MacinCloud / MacStadium rental, or a CI service with macOS runners
(GitHub Actions `macos-latest`, Codemagic, Bitrise — Codemagic has
first-class Capacitor support).

## 1. Replace Stripe with In-App Purchase (required, not optional)

Both stores **reject** apps that sell digital subscriptions through external
payment links. The code is already platform-aware:

- On the web build, the paywall opens your Stripe Payment Links (`src/config.ts`).
- On native builds, it calls `purchaseNative()` / `restoreNative()` in
  `src/lib/billing.ts`, which is a stub waiting for a store billing SDK.

Fastest path — **RevenueCat** (free up to $2.5k MRR):

```bash
npm install @revenuecat/purchases-capacitor
npx cap sync
```

1. Create the subscriptions: App Store Connect → *Subscriptions* and Play
   Console → *Products → Subscriptions* (e.g. `forge_monthly` $9.99,
   `forge_yearly` $59.99).
2. Connect both stores in the RevenueCat dashboard, create a `premium`
   entitlement containing both products.
3. Fill in the commented integration in `src/lib/billing.ts` (the exact calls
   are already sketched there) and initialize the SDK on app start.
4. Also disable or remove the founder unlock code in `src/config.ts` for store
   builds — reviewers can flag side-channels around IAP.

"Restore Purchases" is already in the paywall UI on native — Apple requires it.

## 2. Android release build

```bash
npm run sync
cd android
./gradlew bundleRelease        # produces app/build/outputs/bundle/release/app-release.aab
```

- Create an upload keystore once (`keytool -genkey -v -keystore forge.keystore ...`),
  configure signing in `android/app/build.gradle`, and **never commit the
  keystore**. Losing it ≠ fatal (Play App Signing re-signs), but keep it safe.
- Play Console: create the app → upload the `.aab` to Internal testing first →
  fill the **Data safety** form (see §4) → Content rating questionnaire
  (fitness app, no gambling) → roll out to Production.

## 3. iOS release build

```bash
npm run sync
npx cap open ios
```

In Xcode: set your Team, bump version/build, *Product → Archive* → *Distribute
App → App Store Connect*. Then in App Store Connect fill the listing, attach
the build to a version, complete **App Privacy** (see §4), and submit for
review. Use TestFlight for beta testers first.

## 4. Privacy declarations (both stores ask the same questions)

FORGE's answers are unusually easy because **all data stays on the device**
(localStorage + IndexedDB) — nothing is transmitted to any server:

- Data collected: none transmitted. Photos/videos are stored locally only.
- Camera use: workout check-in/check-out photos and workout example videos
  (usage strings are already set in `Info.plist`; permissions declared in
  `AndroidManifest.xml`).
- Tracking: none. No third-party SDKs (until you add RevenueCat — then declare
  "Purchases" data linked to the user, as their docs describe).

You still need a **privacy policy URL** for both listings — `PRIVACY.md` in
this repo is a ready template: host it anywhere (GitHub Pages works) and link it.

## 5. Store listing assets

- App icon: already generated in both projects (dark F mark).
- Screenshots: run the app in the iOS Simulator (6.7" and 5.5" sizes for
  Apple) and an Android emulator; both stores accept portrait phone captures.
- Feature graphic (Play only): 1024×500.

## 6. Review-proofing checklist

- [ ] IAP wired and Stripe links unreachable from native builds (already gated by `isNativeApp`)
- [ ] Founder/unlock code disabled in store builds
- [ ] Privacy policy URL live and linked in both consoles
- [ ] Terms shown near the paywall price (Apple: auto-renew disclosure — App
      Store Connect adds the standard EULA if you don't provide one)
- [ ] Health disclaimer: the app gives general fitness guidance, not medical
      advice (a line in the listing description covers this)
- [ ] Test on a real device: camera check-in, video upload, purchase sandbox
