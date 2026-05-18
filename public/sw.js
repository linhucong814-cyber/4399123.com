const CACHE_NAME = "4399123-root-offline-v5";
const OFFLINE_URL = "/404notfound/";

const ASSETS = [
  "/404notfound/",
  "/404notfound/index.html",
  "/404notfound/404.html",
  "/404notfound/offline.html",
  "/404notfound/styles.css",
  "/404notfound/game.js",
  "/404notfound/assets/ui/knife-cursor.png",
  "/404notfound/assets/ui/slash.png",
  "/404notfound/assets/fishman_transparent/set_d/aligned/set_d_01.png",
  "/404notfound/assets/fishman_transparent/set_d/aligned/set_d_02.png",
  "/404notfound/assets/fishman_transparent/set_d/aligned/set_d_03.png",
  "/404notfound/assets/fishman_transparent/set_d/aligned/set_d_04.png",
  "/404notfound/assets/fishman_transparent/set_d/aligned/set_d_05.png",
  "/404notfound/assets/fishman_transparent/set_d/aligned/set_d_06.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_02.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_03.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_07.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_08.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_13.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_14.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_20.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_24.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_29.png",
  "/404notfound/assets/fishman_transparent/set_a/aligned/set_a_30.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key.startsWith("4399123-root-"))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const url = new URL(request.url);
        if (!url.pathname.startsWith("/404notfound")) {
          return Response.redirect(OFFLINE_URL, 302);
        }

        const cachedOffline = await caches.match(OFFLINE_URL);
        return cachedOffline || caches.match("/404notfound/index.html");
      })
    );
    return;
  }

  if (!ASSETS.includes(url.pathname)) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
