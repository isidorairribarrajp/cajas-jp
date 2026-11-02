// Cajas JP — guarda la página para abrirla sin señal (los datos siempre van a la función «cajas»).
const CACHE = "cajasjp-v11";
const ARCHIVOS = ["./", "index.html", "jsQR.js", "manifest.json", "icono-180.png", "icono-512.png"];
const FIJOS = /\/(jsQR\.js|icono-\d+\.png|manifest\.json)$/;   // no cambian entre versiones: se sirven del teléfono
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const guardada = () => caches.match(e.request, {ignoreSearch: true}).then((r) => r || caches.match("index.html"));
  if (FIJOS.test(u.pathname)) {
    e.respondWith(caches.match(e.request, {ignoreSearch: true}).then((r) => r || fetch(e.request)));
    return;
  }
  // La página: primero la red (para tomar la versión nueva); con señal mala, a los 4 s la guardada.
  e.respondWith(new Promise((listo) => {
    let hecho = false;
    const usar = (r) => { if (!hecho && r) { hecho = true; listo(r); } };
    const reloj = setTimeout(() => guardada().then((r) => r && usar(r)), 4000);
    fetch(e.request).then((r) => {
      clearTimeout(reloj);
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
      usar(r);
    }).catch(() => { clearTimeout(reloj); guardada().then((r) => usar(r || Response.error())); });
  }));
});
