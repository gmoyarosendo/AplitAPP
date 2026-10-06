const CACHE_NAME = 'aplitapp-cache-v10';
const urlsToCache = [
  '/AplitAPP/',
  '/AplitAPP/index.html',
  '/AplitAPP/manifest.json',
  // Añade aquí las rutas exactas de tus archivos principales (ejemplos):
  '/AplitAPP/style.css',
  '/AplitAPP/app.js',
  '/AplitAPP/favicon.ico'
  // Agrega también cualquier otro archivo o icono que use tu app
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Usamos allSettled o un bucle para evitar que si un archivo falla, falle todo el Service Worker
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        return caches.match('/AplitAPP/index.html');
      });
    })
  );
});
