#!/usr/bin/env node
/* Writes a plain-language result for one app and platform to the run's summary page. */
import fs from "node:fs";

const e = process.env;
const info = (() => { try { return JSON.parse(e.APP_INFO || "{}"); } catch { return {}; } })();
const lines = [];
const say = (s = "") => lines.push(s);
const ok = (v) => v === "success";
const title = `${info.name || e.APP} ${info.version || ""}${info.build ? ` (build ${info.build})` : ""}`.trim();

if (e.PLATFORM === "android") {
  say(`### Google Play · ${title}`);
  if (!ok(e.BUILD)) {
    say("✖ **The Android build failed.** Open the failed step above to see the first error.");
  } else {
    say(`✔ Built. Downloads are under **Artifacts** at the bottom of this page (\`${e.APP}-android\`):`);
    say(e.HAS_KEYSTORE === "true" ? "- `.aab`: the file Google Play uses\n- `.apk`: install it directly on an Android phone to try the app" : "- `.apk`: a test build you can install directly on an Android phone");
    if (e.HAS_KEYSTORE !== "true") {
      say("\n**Next:** add the `ANDROID_KEYSTORE_BASE64` and `ANDROID_KEYSTORE_PASSWORD` secrets so builds are signed for Google Play.");
    } else if (e.HAS_PLAY !== "true") {
      say("\n**Next:** first release? Upload the `.aab` by hand once: Play Console → your app → Test and release → Internal testing → Create new release.");
      say("Then add the `PLAY_SERVICE_ACCOUNT_JSON` secret, and every drop after that uploads itself.");
    } else if (ok(e.PLAY)) {
      say(`\n✔ **Uploaded to Google Play** on the **${info.googlePlayTrack}** track.`);
    } else if (ok(e.PLAY_DRAFT)) {
      say(`\n✔ **Uploaded to Google Play as a draft** on the **${info.googlePlayTrack}** track. Open Play Console → Test and release → ${info.googlePlayTrack} → review the release and roll it out.`);
    } else {
      say("\n✖ **Google Play didn't accept the upload.** The most common reasons:");
      say("- The app hasn't been created in Play Console yet, or its first `.aab` wasn't uploaded by hand.");
      say("- The service account isn't invited in Play Console (Users and permissions) with release access.");
      say("- This version code was already used. Dropping the files again creates a new one.");
      say("\nThe signed `.aab` is still in the Artifacts, so you can upload it by hand.");
    }
  }
}

if (e.PLATFORM === "ios") {
  say(`### App Store · ${title}`);
  if (!ok(e.BUILD)) {
    say("✖ **The iPhone build failed.** Open the failed step above to see the first error.");
  } else if (e.HAS_ASC !== "true") {
    say("✔ Built for iPhone.");
    say("\n**Next:** add the `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID` and `ASC_PRIVATE_KEY` secrets. Builds will then be signed and sent to TestFlight automatically.");
  } else if (e.ASC_STATUS === "needs-app-record") {
    say("✔ Built for iPhone, and the bundle ID is registered with Apple.");
    say(`\n**Next:** create the app once in App Store Connect → Apps → **+** → New App, and choose bundle ID \`${info.id}\`. Then use **Re-run jobs** on this page.`);
  } else if (!ok(e.ASC_CHECK)) {
    say(`✖ **App Store Connect check failed:** ${e.ASC_ERROR || "open the step above for details."}`);
  } else if (ok(e.UPLOAD)) {
    say("✔ **Signed and uploaded to App Store Connect.** It shows up in TestFlight once Apple finishes processing, usually within 5–30 minutes.");
  } else {
    say("✖ **Signing or upload failed.** Common reasons:");
    say("- The App Store Connect key isn't an **Admin** key (needed for cloud signing).");
    say("- `APPLE_TEAM_ID` doesn't match the team that owns the app.");
    say("- The agreements in App Store Connect → Business need accepting.");
  }
}

say("");
if (e.GITHUB_STEP_SUMMARY) fs.appendFileSync(e.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
console.log(lines.join("\n"));
