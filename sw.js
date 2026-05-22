const CACHE = 'eatright-v5';

const CACHE_URLS = [
  '/NourishDay/index.html',
  '/NourishDay/manifest.json'
];

self.addEventListener('install', e => {
  // Skip waiting immediately — don't hold back behind old SW
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(CACHE_URLS.map(url => c.add(url)))
    )
  );
});

self.addEventListener('activate', e => {
  // Take control of all clients immediately
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // For navigation requests (opening the app) — always go network first, fallback to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match('/NourishDay/index.html'))
    );
    return;
  }

  // For everything else — cache first, then network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
