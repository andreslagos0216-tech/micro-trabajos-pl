// Service worker mínimo. Sirve para que el navegador permita instalar la app.
// No guarda en caché páginas ni datos de usuarios, para no mostrar información antigua.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(
          "<!doctype html><meta charset='utf-8'><title>SC opcje</title><body style='font-family:sans-serif;padding:24px'><h1>Sin conexión</h1><p>Brak połączenia z internetem. Spróbuj ponownie.</p></body>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        )
    )
  );
});
