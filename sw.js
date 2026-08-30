/* generat de tools/build.py — nu edita direct */
const CACHE = "aer-e4974fccf5";
const FISIERE = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FISIERE)).catch(() => {}));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k =>
    Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;          // fonturile și măsurarea merg direct în rețea
  // rețeaua întâi, cache-ul ca plasă de siguranță: jucătorul primește mereu ultima versiune,
  // dar jocul pornește și fără semnal
  e.respondWith(
    fetch(e.request).then(r => {
      const copie = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copie)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./")))
  );
});
