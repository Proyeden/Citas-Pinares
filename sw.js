// Service Worker — Especialidades Médicas Pinares (San Cristóbal)
// La versión del caché fuerza la actualización en todos los dispositivos.
// Cada vez que subas una versión nueva del index.html, incrementá este número.
const CACHE_VERSION = 'pinares-v5';
const CACHE_NAME = `pinares-cache-${CACHE_VERSION}`;

// Instalar: activar de inmediato sin esperar
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activar: borrar cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: red primero, caché como respaldo (network-first).
// Esto asegura que siempre se use la versión más reciente cuando hay conexión,
// y solo se recurra al caché cuando no hay internet.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Solo manejar peticiones GET del mismo origen
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Guardar copia en caché para uso offline
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, resClone).catch(() => {});
        });
        return res;
      })
      .catch(() => caches.match(req)) // sin red → usar caché
  );
});
