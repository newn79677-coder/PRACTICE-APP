// ✅ Service Worker for Practice App
const CACHE_NAME = "PRACTICE-APP-v1";
const urlsToCache = [
  "/",              // root
  "/index.html",    // main page
  "/manifest.json"  // PWA manifest
];

// ✅ Install event - cache app files
self.addEventListener("install", event => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("[SW] Caching app files");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// ✅ Activate event - clean old caches
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ✅ Fetch event - cache first, fallback to network
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return; // only handle GET requests

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // return from cache
      }

      // fetch from network and cache it
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // optional: offline fallback page
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});