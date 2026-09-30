#!/usr/bin/env node
/*
 * App Store Connect helper for the Launchpad workflow.
 *
 *   node launchpad/asc.mjs write-key <path>                  writes ASC_PRIVATE_KEY (the .p8 text) to <path>
 *   node launchpad/asc.mjs check --bundle-id <id> --name <n> registers the bundle ID if needed, then checks
 *                                                            that the app exists in App Store Connect
 *
 * Env: ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY (or ASC_KEY_PATH).
 * Writes status=ready|needs-app-record to $GITHUB_OUTPUT. Exit code 0 on either status, 1 on errors.
 */
import crypto from "node:crypto";
import fs from "node:fs";

const [cmd, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const out = (k, v) => process.env.GITHUB_OUTPUT && fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
const die = (m) => { console.error(`\n✖ ${m}\n`); out("error", m.replace(/\n/g, " ")); process.exit(1); };

export function normalizeKey(text) {
  let t = String(text || "").trim().replace(/\\n/g, "\n").replace(/\r/g, "");
  if (!t) return "";
  if (!t.includes("BEGIN PRIVATE KEY")) {
    const body = t.replace(/\s+/g, "").match(/.{1,64}/g).join("\n");
    t = `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----`;
  }
  return t + "\n";
}

export function makeToken({ keyId, issuerId, privateKey, now = Math.floor(Date.now() / 1000) }) {
  const b64 = (b) => Buffer.from(b).toString("base64url");
  const head = b64(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" }));
  const body = b64(JSON.stringify({ iss: issuerId, iat: now, exp: now + 1100, aud: "appstoreconnect-v1" }));
  const sig = crypto.sign("sha256", Buffer.from(`${head}.${body}`), { key: crypto.createPrivateKey(privateKey), dsaEncoding: "ieee-p1363" });
  return `${head}.${body}.${b64(sig)}`;
}

async function api(token, method, path, body) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (res.status === 401) die("App Store Connect rejected the key. Check the ASC_KEY_ID, ASC_ISSUER_ID and ASC_PRIVATE_KEY secrets (the private key is the full text of the .p8 file).");
  if (res.status === 403) die("The App Store Connect key doesn't have enough access. Create the key with the Admin role (Users and Access → Integrations → App Store Connect API).");
  if (!res.ok) die(`App Store Connect ${method} ${path} failed (${res.status}): ${(json.errors || []).map((e) => e.detail || e.title).join("; ") || text.slice(0, 300)}`);
  return json;
}

async function check() {
  const bundleId = opt["bundle-id"];
  const name = (opt.name || bundleId).replace(/[^A-Za-z0-9 ]/g, "").trim() || "App";
  if (!bundleId) die("--bundle-id is required");
  const keyText = process.env.ASC_KEY_PATH ? fs.readFileSync(process.env.ASC_KEY_PATH, "utf8") : normalizeKey(process.env.ASC_PRIVATE_KEY);
  if (!keyText || !process.env.ASC_KEY_ID || !process.env.ASC_ISSUER_ID) die("ASC_KEY_ID, ASC_ISSUER_ID and ASC_PRIVATE_KEY are required.");
  let token;
  try { token = makeToken({ keyId: process.env.ASC_KEY_ID.trim(), issuerId: process.env.ASC_ISSUER_ID.trim(), privateKey: keyText }); }
  catch (e) { die(`ASC_PRIVATE_KEY isn't a valid .p8 key (${e.message}). Paste the whole file, including the BEGIN and END lines.`); }

  const ids = await api(token, "GET", `/v1/bundleIds?filter[identifier]=${encodeURIComponent(bundleId)}&limit=200`);
  const found = (ids.data || []).find((b) => b.attributes && b.attributes.identifier === bundleId);
  if (found) console.log(`• Bundle ID ${bundleId} is registered`);
  else {
    await api(token, "POST", "/v1/bundleIds", { data: { type: "bundleIds", attributes: { identifier: bundleId, name, platform: "IOS" } } });
    console.log(`• Registered bundle ID ${bundleId}`);
    out("registered", "true");
  }

  const apps = await api(token, "GET", `/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}&limit=1`);
  if (!apps.data || !apps.data.length) {
    console.log(`\n! No app in App Store Connect uses ${bundleId} yet.\n  Create it once: App Store Connect → Apps → + → New App → Bundle ID "${bundleId}". Then run this job again.\n`);
    out("status", "needs-app-record");
    return;
  }
  console.log(`• App Store Connect app: ${apps.data[0].attributes.name} (${apps.data[0].id})`);
  out("status", "ready");
  out("app_id", apps.data[0].id);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (cmd === "write-key") {
    const p = rest[0];
    const k = normalizeKey(process.env.ASC_PRIVATE_KEY);
    if (!p || !k) die("write-key needs a path and the ASC_PRIVATE_KEY secret.");
    fs.writeFileSync(p, k, { mode: 0o600 });
    try { crypto.createPrivateKey(k); } catch (e) { die(`ASC_PRIVATE_KEY isn't a valid .p8 key (${e.message}). Paste the whole file, including the BEGIN and END lines.`); }
    console.log(`• Key written to ${p}`);
  } else if (cmd === "check") {
    await check();
  } else {
    die("Usage: asc.mjs write-key <path> | check --bundle-id <id> --name <name>");
  }
}
