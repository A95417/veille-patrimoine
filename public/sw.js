// version 1.0 — service des notifications (brief prêt à 7 h et 18 h).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

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
