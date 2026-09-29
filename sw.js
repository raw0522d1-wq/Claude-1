/* The Gardener service worker: offline shell, background nudges, notification taps. */
const VERSION = "gardener-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "badge-96.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("gardener-v") && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put("index.html", copy));
      return res;
    }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});

/* The page mirrors a small summary of today's tasks into Cache Storage ("./__state").
   When the browser wakes this worker (periodic background sync), it nudges if today isn't tended. */
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

async function nudgeIfDue() {
  const c = await caches.open("gardener-state");
  const res = await c.match("./__state"); if (!res) return;
  const s = await res.json(); if (!s.notify) return;
  const now = new Date(), h = now.getHours() + now.getMinutes() / 60;
  if (h < s.start || h > s.end + 0.75) return;
  const done = s.date === ymd(now) ? s.done : [];
  if (done.length >= 3) return;
  const last = await c.match("./__last");
  if (last && Date.now() - Number(await last.text()) < 100 * 60 * 1000) return;
  const tasks = (s.week && s.week[now.getDay()]) || [];
  const left = tasks.map((t, i) => ({ ...t, i })).filter(t => !done.includes(t.i));
  if (!left.length) return;
  const pick = left[now.getHours() % left.length];
  const title = left.length === 1 ? "One left to tend today" : `${left.length} left to tend today`;
  await self.registration.showNotification(title, {
    body: `${pick.t} Try: ${pick.idea}`, icon: "icon-192.png", badge: "badge-96.png",
    tag: "gardener-nudge", renotify: true, data: { url: "./" },
  });
  await c.put("./__last", new Response(String(Date.now())));
}
self.addEventListener("periodicsync", e => { if (e.tag === "gardener-nudge") e.waitUntil(nudgeIfDue()); });

/* Ready for a push server later: a push with {title, body} shows as a nudge. */
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "The Gardener", {
    body: d.body || "Your garden needs tending.", icon: "icon-192.png", badge: "badge-96.png", tag: "gardener-nudge", data: { url: "./" },
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const client of list) if ("focus" in client) return client.focus();
    return self.clients.openWindow("./");
  }));
});
