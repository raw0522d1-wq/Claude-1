#!/usr/bin/env node
/*
 * Decide which apps a push should build. An app is a folder in apps/ that contains app.json.
 * Changes only inside apps/<name>/store/ (listing text and screenshots) don't trigger a build.
 * Outputs (to $GITHUB_OUTPUT): apps (JSON array), android, ios.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const out = (k, v) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); console.log(`${k}=${v}`); };
const summary = (s) => { if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, s + "\n"); };

const all = fs.existsSync("apps") ? fs.readdirSync("apps", { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
let candidates;
const input = (process.env.INPUT_APP || "").trim();
if (input) candidates = [input.replace(/^apps\//, "").replace(/\/$/, "")];
else {
  const before = process.env.BEFORE || "";
  let files = [];
  if (!before || /^0+$/.test(before)) files = all.map((a) => `apps/${a}/app.json`);
  else {
    try { files = execFileSync("git", ["diff", "--name-only", before, process.env.GITHUB_SHA || "HEAD", "--", "apps"], { encoding: "utf8" }).split("\n").filter(Boolean); }
    catch { files = all.map((a) => `apps/${a}/app.json`); }
  }
  candidates = [...new Set(files.filter((f) => !/^apps\/[^/]+\/store\//.test(f)).map((f) => f.split("/")[1]).filter(Boolean))];
}

const ready = [], skipped = [];
for (const a of candidates) {
  const dir = path.join("apps", a);
  if (!fs.existsSync(dir)) { skipped.push([a, "This folder isn't in apps/ (it may have been deleted)."]); continue; }
  const cfg = path.join(dir, "app.json");
  if (!fs.existsSync(cfg)) { skipped.push([a, "No **app.json** yet. Copy `launchpad/app.example.json` into this folder as `app.json`, fill in the name and ID, and commit."]); continue; }
  try { JSON.parse(fs.readFileSync(cfg, "utf8")); } catch (e) { skipped.push([a, `app.json has a typo: ${e.message}`]); continue; }
  if (!fs.existsSync(path.join(dir, "icon.png"))) { skipped.push([a, "No **icon.png** (square, at least 1024×1024) in the app folder."]); continue; }
  ready.push(a);
}

const stores = (process.env.INPUT_STORES || "both").trim();
out("apps", JSON.stringify(ready));
out("android", String(stores === "both" || stores === "google-play"));
out("ios", String(stores === "both" || stores === "app-store"));

summary("## Launchpad");
if (ready.length) summary(`Building: ${ready.map((a) => `**${a}**`).join(", ")}`);
else summary("Nothing to build in this change.");
for (const [a, why] of skipped) summary(`- Skipped **${a}**: ${why}`);
if (skipped.length && !ready.length) process.exitCode = 1;
