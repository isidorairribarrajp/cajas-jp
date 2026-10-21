// Cajas JP — guarda la página para abrirla sin señal (los datos siempre van a la función «cajas»).
const CACHE = "cajasjp-v1";
const ARCHIVOS = ["./", "index.html", "jsQR.js", "manifest.json", "icono-180.png", "icono-512.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // primero la red (para tomar la versión nueva), si no hay señal la guardada
  e.respondWith(fetch(e.request).then((r) => { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); return r; })
    .catch(() => caches.match(e.request, {ignoreSearch: true}).then((r) => r || caches.match("index.html"))));
});
