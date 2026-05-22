const CACHE = 'eatright-v4';

const CACHE_URLS = [
  '/NourishDay/index.html',
  '/NourishDay/manifest.json',
  '/NourishDay/icon-192.svg',
  '/NourishDay/icon-512.svg',
  '/NourishDay/apple-touch-icon.svg',
  '/NourishDay/favicon-32.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(CACHE_URLS.map(url => c.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('/NourishDay/index.html');
        }
      });
    })
  );
});
