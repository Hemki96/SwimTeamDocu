
const CACHE = 'swimdox-v1';
const ASSETS = [
  '/', '/index.html',
  '/css/base.css',
  '/js/router.js', '/js/api.js',
  '/js/ui/sessions.js', '/js/ui/import.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return; // let network handle POST/PATCH
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    // Network first for API
    e.respondWith(fetch(request).then(r => {
      return r;
    }).catch(() => caches.match(request)));
  } else {
    // Cache first for static
    e.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
