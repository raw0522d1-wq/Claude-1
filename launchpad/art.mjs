/*
 * Icons and splash screens for Android and iOS, generated from the files in the app folder:
 *   icon.png              required, square, at least 1024x1024 (full-bleed art; keep the logo in the middle two-thirds)
 *   icon-foreground.png   optional, Android adaptive icon foreground on a transparent 1024x1024 canvas
 *   icon-background.png   optional, Android adaptive icon background (1024x1024)
 *   splash.png            optional, square splash art (at least 2732x2732). Otherwise the logo is centered on backgroundColor.
 *   notification-icon.png optional, a simple silhouette for the Android status bar (any color; converted to white)
 */
import fs from "node:fs";
import path from "node:path";

const DENS = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const SPLASH_PORT = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] };

export async function makeArt({ sharp, appDir, outDir, platform, bg, bgDark, log, fail }) {
  const file = (n) => path.join(appDir, n);
  const has = (n) => fs.existsSync(file(n));
  if (!has("icon.png")) fail("Missing icon.png (a square PNG, at least 1024x1024) in the app folder.");
  const iconMeta = await sharp(file("icon.png")).metadata();
  if (iconMeta.width < 1024 || iconMeta.width !== iconMeta.height) fail(`icon.png must be square and at least 1024x1024 (it is ${iconMeta.width}x${iconMeta.height}).`);

  const flat = (buf, color) => sharp(buf).flatten({ background: color });
  const icon = await sharp(file("icon.png")).resize(1024, 1024).png().toBuffer();
  const maskRound = (s, r) => Buffer.from(`<svg width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);
  const masked = async (buf, s, r) => sharp(buf).resize(s, s).composite([{ input: maskRound(s, r), blend: "dest-in" }]).png().toBuffer();

  // Logo used on generated splash screens: the adaptive foreground trimmed to its content, else the rounded icon.
  let logo;
  if (has("icon-foreground.png")) logo = await sharp(file("icon-foreground.png")).trim().png().toBuffer();
  else logo = await masked(icon, 1024, 224);

  async function splash(w, h, color) {
    if (has("splash.png")) return sharp(file("splash.png")).resize(w, h, { fit: "cover", position: "centre" }).flatten({ background: color }).png().toBuffer();
    const size = Math.round(Math.min(w, h) * 0.3);
    const l = await sharp(logo).resize(size, size, { fit: "inside" }).png().toBuffer();
    return sharp({ create: { width: w, height: h, channels: 3, background: color } }).composite([{ input: l, gravity: "centre" }]).png().toBuffer();
  }

  if (platform === "android") {
    const res = path.join(outDir, "android/app/src/main/res");
    const fg = has("icon-foreground.png") ? await sharp(file("icon-foreground.png")).resize(1024, 1024).png().toBuffer()
      : await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
    const back = has("icon-background.png") ? await sharp(file("icon-background.png")).resize(1024, 1024).png().toBuffer() : icon;
    for (const [d, k] of Object.entries(DENS)) {
      const dir = path.join(res, `mipmap-${d}`);
      fs.mkdirSync(dir, { recursive: true });
      const s = Math.round(48 * k), a = Math.round(108 * k);
      await sharp(await masked(icon, s, Math.round(s * 0.18))).toFile(path.join(dir, "ic_launcher.png"));
      await sharp(await masked(icon, s, s / 2)).toFile(path.join(dir, "ic_launcher_round.png"));
      await sharp(fg).resize(a, a).png().toFile(path.join(dir, "ic_launcher_foreground.png"));
      await sharp(back).resize(a, a).png().toFile(path.join(dir, "ic_launcher_background.png"));
      const [pw, ph] = SPLASH_PORT[d];
      fs.mkdirSync(path.join(res, `drawable-port-${d}`), { recursive: true });
      fs.mkdirSync(path.join(res, `drawable-land-${d}`), { recursive: true });
      await sharp(await splash(pw, ph, bg)).toFile(path.join(res, `drawable-port-${d}`, "splash.png"));
      await sharp(await splash(ph, pw, bg)).toFile(path.join(res, `drawable-land-${d}`, "splash.png"));
      if (has("notification-icon.png")) {
        const n = Math.round(24 * k);
        const alpha = await sharp(file("notification-icon.png")).resize(n, n, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().extractChannel("alpha").toBuffer();
        fs.mkdirSync(path.join(res, `drawable-${d}`), { recursive: true });
        await sharp({ create: { width: n, height: n, channels: 3, background: "#ffffff" } }).joinChannel(alpha).png().toFile(path.join(res, `drawable-${d}`, "ic_stat_launchpad.png"));
      }
    }
    await sharp(await splash(480, 320, bg)).toFile(path.join(res, "drawable/splash.png"));
    const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
    fs.writeFileSync(path.join(res, "mipmap-anydpi-v26/ic_launcher.xml"), adaptive);
    fs.writeFileSync(path.join(res, "mipmap-anydpi-v26/ic_launcher_round.xml"), adaptive);
    log("Android icons and splash screens generated");
  }

  if (platform === "ios") {
    const assets = path.join(outDir, "ios/App/App/Assets.xcassets");
    // The App Store rejects icons with transparency, so flatten onto the background color.
    await flat(icon, bg).removeAlpha().png().toFile(path.join(assets, "AppIcon.appiconset/AppIcon-512@2x.png"));
    const s = await splash(2732, 2732, bg);
    for (const f of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) await sharp(s).toFile(path.join(assets, "Splash.imageset", f));
    log("iOS icon and splash screen generated");
  }
  void bgDark;
}
