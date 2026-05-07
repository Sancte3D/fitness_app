const CACHE_NAME = "daily-core-v61";
const PERSONA_QS = "?v=61";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./sync-config.js",
  "./manifest.webmanifest",
  `./assets/personas/persona-david.png${PERSONA_QS}`,
  `./assets/personas/persona-michalis.png${PERSONA_QS}`,
  `./assets/personas/persona-nico.png${PERSONA_QS}`,
  "./assets/personas/persona-david.svg",
  "./assets/personas/persona-michalis.svg",
  "./assets/personas/persona-nico.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./icon-192.svg",
  "./icon-512.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k.startsWith("daily-core-") && k !== CACHE_NAME).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

function networkFirstWithCacheFallback(req) {
  return fetch(req)
    .then((r) => {
      if (r.ok) {
        const copy = r.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
      }
      return r;
    })
    .catch(() =>
      caches.match(req).then((hit) => {
        if (hit) return hit;
        if (req.mode === "navigate" || req.destination === "document") return caches.match("./index.html");
        return Promise.reject(new Error("offline"));
      }),
    );
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const req = e.request;
  const url = new URL(req.url);
  const path = url.pathname;
  const useNetworkFirst =
    req.mode === "navigate" ||
    req.destination === "document" ||
    path.endsWith("/app.js") ||
    path.endsWith("/service-worker.js") ||
    path.endsWith("/index.html");

  if (useNetworkFirst) {
    e.respondWith(networkFirstWithCacheFallback(req));
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return r;
      }).catch(() => caches.match("./index.html"));
    }),
  );
});
