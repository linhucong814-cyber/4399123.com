const CACHE_NAME = "fishman-offline-game-v6";

const FRAME_ASSETS = Array.from({ length: 30 }, (_, index) => (
  `./assets/fishman/frames/fishman_${String(index + 1).padStart(2, "0")}.png`
));

const transparentFrames = [
  ...Array.from({ length: 30 }, (_, index) => `./assets/fishman_transparent/set_a/aligned/set_a_${String(index + 1).padStart(2, "0")}.png`),
  ...Array.from({ length: 55 }, (_, index) => `./assets/fishman_transparent/set_b/aligned/set_b_${String(index + 1).padStart(2, "0")}.png`),
  ...Array.from({ length: 30 }, (_, index) => `./assets/fishman_transparent/set_c/aligned/set_c_${String(index + 1).padStart(2, "0")}.png`),
  ...Array.from({ length: 6 }, (_, index) => `./assets/fishman_transparent/set_d/aligned/set_d_${String(index + 1).padStart(2, "0")}.png`),
];

const ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./offline.html",
  "./styles.css",
  "./game.js",
  "./assets/fishman/sheet.png",
  "./assets/fishman_transparent/manifest.json",
  "./assets/ui/knife-cursor.png",
  "./assets/ui/slash.png",
  ...FRAME_ASSETS,
  ...transparentFrames,
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
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }

        if (event.request.mode === "navigate") {
          return caches.match("./offline.html");
        }

        return Response.error();
      })
  );
});
