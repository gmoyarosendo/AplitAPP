const CACHE_NAME = 'aplitapp-auto-v1';

// 1. Al instalarse, guarda la base de la app
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/AplitAPP/',
        '/AplitAPP/index.html',
        '/AplitAPP/manifest.json'
      ]))
      .then(() => self.skipWaiting())
  );
});

// 2. Limpia versiones antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

// 3. ¡Lo importante!: Guarda automáticamente cualquier archivo que abras
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Si ya está guardado en la caché, te lo devuelve offline
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si no está guardado, lo va a buscar a internet Y LO GUARDA automáticamente para la próxima vez
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Si no hay internet y el archivo nunca se abrió antes, muestra el inicio
        return caches.match('/AplitAPP/index.html');
      });
    })
  );
});
