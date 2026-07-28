const CACHE = 'sifa-v1';

/**
 * Service worker SIFA — mewujudkan janji "offline-first".
 *
 * Strategi:
 * - Navigasi halaman: network-first, fallback ke cache (lalu ke /offline bila keduanya gagal).
 * - Aset statis (_next/static, gambar, font): cache-first, karena ber-hash & imutabel.
 * - Permintaan ke API pihak ketiga (Overpass/OSM) TIDAK di-cache oleh SW; halaman direktori
 *   punya cache sendiri di sessionStorage (`lib/osm.ts`).
 * - Ubin peta OpenStreetMap juga TIDAK di-cache (lintas-origin & kebijakan pemakaian ubin OSM);
 *   saat offline, komponen peta menampilkan pesan fallback dan daftar masjid tetap bisa dipakai.
 */
const PRECACHE = ['/', '/kiblat', '/waktu-salat', '/kalender', '/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // biarkan request lintas-origin apa adanya

  const isStaticAsset =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/images') ||
    url.pathname.startsWith('/fonts');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/offline'))
      )
  );
});

