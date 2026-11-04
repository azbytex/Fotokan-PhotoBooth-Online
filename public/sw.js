// Membuat situs bisa dibuka lagi tanpa internet setelah pernah dikunjungi.
// API room tidak pernah disimpan, karena berisi foto dan harus selalu terbaru.
const CACHE = 'fotokan-v4';
const ROOM_OFFLINE_PAGE = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fotokan</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;text-align:center"><h1>Kamu sedang offline</h1><p>Room butuh koneksi internet. Sambungkan lagi, lalu muat ulang halaman ini.</p></body></html>`;
const PAGES = ['/', '/studio', '/themes', '/editor', '/gallery', '/result'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PAGES))
      .catch(() => {})
      .finally(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const putInCache = async (request, response) => {
  if (response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/room/')) {
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(() => new Response(ROOM_OFFLINE_PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
      );
    }
    return;
  }

  // Halaman: ambil yang terbaru, pakai simpanan kalau sedang offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => putInCache(request, response))
        .catch(async () => (await caches.match(request, { ignoreSearch: true })) || (await caches.match('/')) || Response.error())
    );
    return;
  }

  // Berkas Next.js, font, foto contoh, ikon, dan model wajah tidak berubah isinya: pakai simpanan dulu.
  const isStatic =
    isFont ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/samples/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/mediapipe/') ||
    url.pathname.startsWith('/face-stickers/');
  if (isStatic) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((response) => putInCache(request, response))));
    return;
  }

  event.respondWith(fetch(request).then((response) => putInCache(request, response)).catch(() => caches.match(request).then((hit) => hit || Response.error())));
});
