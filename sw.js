// Offline support for the My Money app shell. Account data (Supabase) is never cached here.
const CACHE = "my-money-v4";
const SHELL = ["./", "index.html", "app.html", "app.js", "config.js", "supabase.js", "manifest.webmanifest",
  "bricolage.woff2", "figtree-400.woff2", "figtree-500.woff2", "figtree-600.woff2", "figtree-700.woff2", "icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // let API calls pass straight through
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || (e.request.mode === "navigate" ? caches.match("app.html") : undefined)))
  );
});
