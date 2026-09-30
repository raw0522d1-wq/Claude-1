#!/usr/bin/env node
/*
 * Launchpad: turn a folder of web files into a native Android or iOS project.
 *
 *   node launchpad/prepare.mjs --app apps/the-gardener --platform android --out build/the-gardener --build 101
 *
 * Reads apps/<name>/app.json, finds the web files (www/, the folder itself, or a .zip),
 * creates a Capacitor 8 project, adds the platform, generates icons and splash screens,
 * and applies version, signing and store settings. Prints a JSON summary on the last line.
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { makeArt } from "./art.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, a) => (v.startsWith("--") ? [...acc, [v.slice(2), a[i + 1]]] : acc), []));
const appDir = path.resolve(args.app || "");
const platform = args.platform;
const outDir = path.resolve(args.out || path.join("build", path.basename(appDir), platform || ""));
const buildNumber = parseInt(args.build || "1", 10);

const fail = (msg) => { console.error(`\n✖ ${msg}\n`); process.exit(1); };
const log = (msg) => console.log(`• ${msg}`);
const run = (cmd, argv, cwd) => execFileSync(cmd, argv, { cwd, stdio: "inherit", env: { ...process.env, CI: "1" } });

if (!["android", "ios"].includes(platform)) fail("--platform must be android or ios");
if (!fs.existsSync(appDir)) fail(`App folder not found: ${appDir}`);

/* ---------- 1. app settings */
const cfgPath = path.join(appDir, "app.json");
if (!fs.existsSync(cfgPath)) fail(`Missing ${path.relative(process.cwd(), cfgPath)}. Copy launchpad/app.example.json into the app folder, rename it app.json, and fill it in.`);
let cfg;
try { cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8")); } catch (e) { fail(`app.json is not valid JSON: ${e.message}`); }
const problems = [];
if (!cfg.name || typeof cfg.name !== "string") problems.push('"name" is required (the store name, e.g. "The Gardener").');
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(cfg.id || "")) problems.push('"id" must look like com.yourcompany.appname (lowercase letters, numbers, underscores; at least three parts). It is permanent once published.');
if (!/^\d+\.\d+\.\d+$/.test(cfg.version || "")) problems.push('"version" must look like 1.0.0. Raise it for each store release.');
if (problems.length) fail(`app.json needs fixing:\n  - ${problems.join("\n  - ")}`);
const name = cfg.name.trim();
const homeName = (cfg.homeScreenName || name).trim();
const bg = cfg.backgroundColor || "#FFFFFF";
const bgDark = cfg.backgroundColorDark || bg;
const accent = cfg.accentColor || "#2A6743";
const plugins = Array.isArray(cfg.plugins) ? cfg.plugins : [];
const usesNotifications = plugins.some((p) => p.startsWith("@capacitor/local-notifications"));
const portrait = (cfg.orientation || "any") === "portrait";
const iPad = !!(cfg.appStore && cfg.appStore.iPad);
const exactAlarms = !!(cfg.googlePlay && cfg.googlePlay.exactAlarms);
const versionCode = buildNumber + (parseInt(cfg.buildNumberOffset || 0, 10) || 0);

/* ---------- 2. web files */
function findWebRoot(dir) {
  const skip = new Set(["store", "node_modules", "__MACOSX", ".git"]);
  const queue = [[dir, 0]];
  const preferred = path.join(dir, "www");
  if (fs.existsSync(path.join(preferred, "index.html"))) return preferred;
  while (queue.length) {
    const [d, depth] = queue.shift();
    if (fs.existsSync(path.join(d, "index.html"))) return d;
    if (depth >= 3) continue;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory() && !skip.has(e.name) && !e.name.startsWith(".")) queue.push([path.join(d, e.name), depth + 1]);
  }
  return null;
}
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
let webRoot = findWebRoot(appDir);
if (!webRoot) {
  const zips = [appDir, path.join(appDir, "www")].filter(fs.existsSync).flatMap((d) => fs.readdirSync(d).filter((f) => f.toLowerCase().endsWith(".zip")).map((f) => path.join(d, f)));
  if (zips.length) {
    const tmp = path.join(outDir, "_unzipped");
    fs.mkdirSync(tmp, { recursive: true });
    log(`Unzipping ${path.basename(zips[0])}`);
    run("unzip", ["-q", "-o", zips[0], "-d", tmp]);
    webRoot = findWebRoot(tmp);
  }
}
if (!webRoot) fail("No index.html found. Drop your web files (with index.html) into the app's www folder, or drop a .zip of them.");
const www = path.join(outDir, "www");
fs.cpSync(webRoot, www, { recursive: true, filter: (src) => !/(^|\/)(\.DS_Store|__MACOSX|\.git)(\/|$)/.test(src) });
fs.rmSync(path.join(outDir, "_unzipped"), { recursive: true, force: true });
log(`Web files: ${path.relative(process.cwd(), webRoot)} (${fs.readdirSync(www).length} items)`);

/* ---------- 3. Capacitor project */
const capVersion = "^8.5.0";
const pluginDeps = Object.fromEntries(plugins.map((p) => {
  const at = p.lastIndexOf("@");
  return at > 0 ? [p.slice(0, at), p.slice(at + 1)] : [p, p.startsWith("@capacitor/") ? "^8.0.0" : "latest"];
}));
fs.writeFileSync(path.join(outDir, "package.json"), JSON.stringify({
  name: "launchpad-" + path.basename(appDir).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
  private: true,
  version: cfg.version,
  dependencies: { "@capacitor/core": capVersion, [`@capacitor/${platform}`]: capVersion, ...pluginDeps },
  devDependencies: { "@capacitor/cli": capVersion, sharp: "^0.34.0" },
}, null, 2));

const capConfig = {
  appId: cfg.id,
  appName: name,
  webDir: "www",
  backgroundColor: bg,
  ios: { contentInset: "never", backgroundColor: bg },
  android: { backgroundColor: bg },
  plugins: {},
};
const hasNotifIcon = fs.existsSync(path.join(appDir, "notification-icon.png"));
if (usesNotifications) capConfig.plugins.LocalNotifications = { iconColor: accent, ...(hasNotifIcon ? { smallIcon: "ic_stat_launchpad" } : {}) };
fs.writeFileSync(path.join(outDir, "capacitor.config.json"), JSON.stringify(capConfig, null, 2));

log("Installing Capacitor");
run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], outDir);
log(`Adding ${platform}`);
run("npx", ["cap", "add", platform, ...(platform === "ios" ? ["--packagemanager", "SPM"] : [])], outDir);

/* ---------- 4. icons + splash */
const require = createRequire(path.join(outDir, "package.json"));
const sharp = require("sharp");
await makeArt({ sharp, appDir, outDir, platform, bg, bgDark, log, fail });

/* ---------- 5. platform settings */
const edit = (file, fn) => { const p = path.join(outDir, file); fs.writeFileSync(p, fn(fs.readFileSync(p, "utf8"))); };
const xmlEsc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "\\'").replace(/"/g, '\\"');

if (platform === "android") {
  edit("android/app/build.gradle", (g) => {
    g = g.replace(/versionCode \d+/, `versionCode ${versionCode}`).replace(/versionName "[^"]*"/, `versionName "${cfg.version}"`);
    const signing = `
    signingConfigs {
        release {
            if (System.getenv("LAUNCHPAD_KEYSTORE")) {
                storeFile file(System.getenv("LAUNCHPAD_KEYSTORE"))
                storePassword System.getenv("LAUNCHPAD_KEYSTORE_PASSWORD")
                keyAlias System.getenv("LAUNCHPAD_KEY_ALIAS") ?: "upload"
                keyPassword System.getenv("LAUNCHPAD_KEY_PASSWORD") ?: System.getenv("LAUNCHPAD_KEYSTORE_PASSWORD")
            }
        }
    }
    buildTypes {`;
    g = g.replace(/\n    buildTypes \{/, signing);
    g = g.replace(/(release \{\n\s+minifyEnabled false)/, `$1\n            if (System.getenv("LAUNCHPAD_KEYSTORE")) { signingConfig signingConfigs.release }`);
    return g;
  });
  edit("android/app/src/main/res/values/strings.xml", (s) => s
    .replace(/<string name="app_name">[^<]*<\/string>/, `<string name="app_name">${xmlEsc(homeName)}</string>`)
    .replace(/<string name="title_activity_main">[^<]*<\/string>/, `<string name="title_activity_main">${xmlEsc(homeName)}</string>`));
  edit("android/app/src/main/AndroidManifest.xml", (m) => {
    if (!m.includes("xmlns:tools")) m = m.replace("<manifest ", '<manifest xmlns:tools="http://schemas.android.com/tools" ');
    if (usesNotifications && !exactAlarms) m = m.replace("</manifest>", '    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" tools:node="remove" />\n</manifest>');
    if (portrait) m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"');
    return m;
  });
  fs.mkdirSync(path.join(outDir, "android/app/src/main/res/values-night"), { recursive: true });
  fs.writeFileSync(path.join(outDir, "android/app/src/main/res/values/launchpad_colors.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="launchpad_splash">${bg}</color>\n</resources>\n`);
  fs.writeFileSync(path.join(outDir, "android/app/src/main/res/values-night/launchpad_colors.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="launchpad_splash">${bgDark}</color>\n</resources>\n`);
  edit("android/app/src/main/res/values/styles.xml", (s) => s.replace(
    /(<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">)/,
    `$1\n        <item name="windowSplashScreenBackground">@color/launchpad_splash</item>`));
}

if (platform === "ios") {
  edit("ios/App/App.xcodeproj/project.pbxproj", (p) => p
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${cfg.version};`)
    .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${versionCode};`)
    .replace(/TARGETED_DEVICE_FAMILY = "[^"]*";/g, `TARGETED_DEVICE_FAMILY = "${iPad ? "1,2" : "1"}";`)
    .replace(/IPHONEOS_DEPLOYMENT_TARGET = [^;]+;/g, "IPHONEOS_DEPLOYMENT_TARGET = 15.0;"));
  edit("ios/App/App/Info.plist", (p) => {
    p = p.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/, `$1${homeName.replace(/&/g, "&amp;").replace(/</g, "&lt;")}$2`);
    if (!p.includes("ITSAppUsesNonExemptEncryption")) p = p.replace(/<dict>/, "<dict>\n\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>");
    if (portrait) p = p.replace(/(<key>UISupportedInterfaceOrientations<\/key>\s*<array>)[\s\S]*?(<\/array>)/, "$1\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t$2");
    return p;
  });
}

log("Syncing web files and plugins");
run("npx", ["cap", "sync", platform], outDir);

const summary = { app: path.basename(appDir), name, id: cfg.id, version: cfg.version, build: versionCode, platform, project: path.join(outDir, platform), googlePlayTrack: (cfg.googlePlay && cfg.googlePlay.track) || "internal" };
fs.writeFileSync(path.join(outDir, "launchpad.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary));
