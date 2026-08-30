/* generat de tools/build.py — nu edita direct */
const CACHE = "aer-808e151dd3";
const FISIERE = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

// Fișier cu fișier, nu addAll: dacă unul singur pică, addAll abandonează tot
// și cache-ul rămâne gol — exact ce s-a întâmplat la prima punere online.
// skipWaiting vine LA FINAL, ca activarea să nu întrerupă salvarea.
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const f of FISIERE) {
      try {
        const r = await fetch(f, { cache: "reload" });
        if (r.ok) await c.put(f, r);
      } catch (err) { /* un fișier lipsă nu trebuie să oprească restul */ }
    }
    await self.skipWaiting();
  })());
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
