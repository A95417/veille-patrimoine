// version 2.0 — notifications (brief prêt à 7 h et 18 h) + lecture hors ligne.
// Hors ligne : chaque page, script et lecture (brief, actualités, fiches) consultés est gardé sur l'appareil.
// Avec du réseau, on charge toujours la version à jour (et on met la copie à jour) ; sans réseau, on affiche la copie.
const CACHE = "veille-v2";
const API_LECTURE = /^\/api\/(moi|une|brief|calendrier|marches|selection|sujet|progression|quiz|actualites|themes|filtres|recherche)(\/|$)/;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") && (!API_LECTURE.test(url.pathname) || url.pathname === "/api/brief/audio")) return;
  if (url.pathname === "/connexion" || url.pathname === "/sw.js") return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const r = await fetch(req);
      // On ne garde que les vraies réponses (pas les redirections vers la connexion ni les erreurs).
      if (r.ok && !r.redirected && r.type === "basic") cache.put(req, r.clone());
      return r;
    } catch (err) {
      const copie = await cache.match(req, { ignoreVary: true });
      if (copie) return copie;
      if (req.mode === "navigate") {
        return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
          <title>Hors ligne</title><body style="font-family:system-ui;padding:40px 20px;max-width:520px;margin:auto;line-height:1.5">
          <h1>Pas de connexion</h1><p>Cette page n'a pas encore été ouverte sur cet appareil, elle n'est donc pas disponible hors ligne.</p>
          <p>Les pages déjà consultées (brief, Aujourd'hui, fiches Apprendre) restent lisibles : <a href="/brief">ouvrir le dernier brief</a>.</p></body>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
      throw err;
    }
  })());
});

self.addEventListener("push", (e) => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch {}
  e.waitUntil(self.registration.showNotification(m.titre || "Veille Patrimoine", {
    body: m.corps || "Le brief est prêt.",
    icon: "/icone-192.png",
    badge: "/icone-192.png",
    tag: "brief",
    data: { url: m.url || "/brief" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "/brief", self.location.origin).href;
  e.waitUntil((async () => {
    const fenetres = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const f of fenetres) if ("focus" in f) { await f.navigate(url).catch(() => {}); return f.focus(); }
    return self.clients.openWindow(url);
  })());
});
