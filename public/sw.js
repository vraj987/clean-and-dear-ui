/*
 * Kimaat Lock offline shell.
 * App navigation uses the network first; the last successful app shell and
 * same-origin static assets are kept for offline reloads. API calls are never
 * cached by this worker.
 */
const CACHE_NAME = "kimaat-lock-shell-__APP_BUILD_ID__";
const PRECACHE_ASSETS = __PRECACHE_ASSETS__;
const APP_SCOPE = self.registration.scope;
const APP_INDEX = new URL("index.html", APP_SCOPE).href;
const OFFLINE_PAGE = new URL("offline.html", APP_SCOPE).href;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const assets = PRECACHE_ASSETS.map((file) => new URL(file, APP_SCOPE).href);
    await cache.addAll([APP_INDEX, OFFLINE_PAGE, ...assets]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("kimaat-lock-shell-") && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const scopeUrl = new URL(APP_SCOPE);
  if (requestUrl.origin !== scopeUrl.origin || !requestUrl.pathname.startsWith(scopeUrl.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
          await cache.put(APP_INDEX, response.clone());
        }
        return response;
      } catch {
        return (await cache.match(request))
          || (await cache.match(APP_INDEX))
          || (await cache.match(OFFLINE_PAGE))
          || Response.error();
      }
    })());
    return;
  }

  // Only keep static app files. PHP endpoints and other data requests remain
  // network-only so stale API responses are never served from this cache.
  const isStaticAsset = ["script", "style", "image", "font", "worker"].includes(request.destination)
    || /\.(?:js|mjs|css|svg|png|jpe?g|webp|gif|woff2?|ttf|ico)$/i.test(requestUrl.pathname);
  if (!isStaticAsset || requestUrl.pathname.endsWith("/sw.js")) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
