/* ══════════════════════════════════════════
   YTGT — Service Worker
   Caches site for fast loads & offline use
══════════════════════════════════════════ */

const CACHE = 'ytgt-v1';

// Files to cache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/ytreaklogo.png',
  '/aboutsectionimg1.webp',
  '/aboutsectionimg2.webp',
  '/howslider1image.webp',
  '/howslider2image.webp',
  '/howslider3image.webp'
];

// Install — cache all core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache first, fall back to network
self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache new responses for next time
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});