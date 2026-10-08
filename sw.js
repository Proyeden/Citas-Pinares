// Service Worker — Especialidades Médicas Pinares (San Cristóbal)
// La versión del caché fuerza la actualización en todos los dispositivos.
// Cada vez que subas una versión nueva del index.html, incrementá este número.
const CACHE_VERSION = 'pinares-v6';
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
  // Solo peticiones GET del mismo origen. El comentario ya lo decía pero el
  // código no lo comprobaba: se guardaba en caché TODO —el SDK de Firebase,
  // los canales de Firestore— y eso infla el almacenamiento del teléfono sin
  // servir para nada, porque esas respuestas no se pueden reusar sin red.
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

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
