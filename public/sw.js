/**
 * Service Worker: Antigravity Chess PWA (Zero-G Mobile Engine)
 * Offline asset caching, background resilience & standalone client control.
 */

const CACHE_NAME = 'antigravity-chess-v1.0.0'

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
]

// 1. Install Event: Pre-cache core shell & offline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// 2. Activate Event: Clean up stale legacy caches & take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// 3. Fetch Event: Cache-First strategy with Network Fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached shell asset immediately
        return cachedResponse
      }

      // Fallback to network with dynamic runtime caching
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse
          }

          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return networkResponse
        })
        .catch(() => {
          // If offline and request is an HTML page, serve root index.html
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html')
          }
        })
    })
  )
})
