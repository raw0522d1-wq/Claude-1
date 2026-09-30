# Launchpad

Drop an app's web files here and get the Android and iPhone apps built and sent to
Google Play and App Store Connect (TestFlight).

## Drop a new version of an app

1. Open the app's `www` folder on GitHub (for The Gardener: `apps/the-gardener/www`).
2. Click **Add file → Upload files**, drag in your files (or one `.zip` of them), and click **Commit changes**.
3. Open the **Actions** tab. The "Launchpad" run takes about 10 minutes. Its summary page says what happened and what to do next.

To release a new store version, also raise `"version"` in `app.json` (for example `1.0.0` → `1.0.1`).
Build numbers go up automatically.

## Add another app

Create a folder in `apps/` (lowercase, dashes: `apps/my-app/`) containing:

| File | What it is |
| --- | --- |
| `app.json` | Name, permanent app ID, version. Start from `launchpad/app.example.json`. |
| `icon.png` | Square, at least 1024×1024, no transparency. Keep the logo in the middle two-thirds. |
| `www/` | Your web files with `index.html` at the top (or one `.zip` of them). |
| `notification-icon.png` | Optional. A simple silhouette for Android notifications. |
| `icon-foreground.png`, `icon-background.png` | Optional. Separate layers for Android's shaped icons. |
| `splash.png` | Optional. Square splash art, at least 2732×2732. Otherwise the logo is centered on `backgroundColor`. |

`app.json` settings:

| Setting | Meaning |
| --- | --- |
| `name` | Store name. |
| `homeScreenName` | Short label under the icon (about 12 characters max). |
| `id` | Permanent ID, like `com.hrwrightsolutions.myapp`. Can't change after the first upload. |
| `version` | `1.0.0` style. Raise it for each store release. |
| `plugins` | Native features the web app uses, e.g. `"@capacitor/local-notifications"`, `"@capacitor/app"`. |
| `googlePlay.track` | `internal` (default), `alpha` (closed testing), `beta` (open testing) or `production`. |
| `appStore.iPad` | `true` to make an iPad version too (the App Store then requires iPad screenshots). |

## One-time setup

### Accounts
- **Apple Developer Program:** $99/year, at developer.apple.com/programs. Enrolling as the LLC needs a free D-U-N-S number.
- **Google Play Console:** $25 once, at play.google.com/console. New *personal* accounts must run a closed test with 12 testers for 14 days before going public. *Organization* accounts skip this.

### Secrets (repository **Settings → Secrets and variables → Actions → New repository secret**)

| Secret | Where it comes from |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | The upload key file, as text (provided separately). |
| `ANDROID_KEYSTORE_PASSWORD` | The upload key password (provided separately). |
| `PLAY_SERVICE_ACCOUNT_JSON` | Google Cloud service account key (JSON), invited in Play Console → Users and permissions with release rights. |
| `APPLE_TEAM_ID` | developer.apple.com → Account → Membership details → Team ID. |
| `ASC_KEY_ID` | App Store Connect → Users and Access → Integrations → App Store Connect API → create a key with the **Admin** role. |
| `ASC_ISSUER_ID` | Same page, shown above the keys list. |
| `ASC_PRIVATE_KEY` | The whole text of the downloaded `.p8` file. |

Builds work with no secrets at all (you get a test `.apk`); each secret unlocks the next step.

### First release of each app
- **Google Play:** create the app in Play Console, then upload the first `.aab` (from a run's Artifacts) by hand under
  Test and release → Internal testing. Google requires the first upload to be manual. After that, drops upload themselves.
- **App Store:** the first run registers the bundle ID. Then create the app once in App Store Connect → Apps → **+** → New App
  with that bundle ID, and re-run the job. After that, drops go straight to TestFlight.
- Both stores also need the listing (description, screenshots, privacy policy URL, age rating, privacy answers)
  before the first review. The Gardener's listing kit is in `apps/the-gardener/store/`.

## How it works

`launchpad/prepare.mjs` wraps the web files in a Capacitor 8 project and generates the icons and splash screens.
`.github/workflows/launchpad.yml` builds Android on Linux and iPhone on macOS (Xcode 26).
The iPhone build is signed by Apple's cloud signing during upload, so no certificates are stored in this repo.
