const CACHE_NAME = "toolchest-offline-v1";

const SAFE_PATH_MATCHERS = [
  /^\/_next\/static\//,
  /^\/fonts\//,
  /^\/icons?\//,
  /^\/images?\//,
  /^\/messages?\//,
  /^\/manifest\.json$/,
  /^\/favicon\.ico$/,
];

function isCacheable(request) {
  if (request.method !== "GET") return false;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return false;

  // Never cache API calls or POST/PUT etc.
  if (url.pathname.startsWith("/api/")) return false;

  return SAFE_PATH_MATCHERS.some((matcher) => matcher.test(url.pathname));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key === CACHE_NAME ? undefined : caches.delete(key)))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (!isCacheable(event.request)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) {
        // Update in the background when possible.
        event.waitUntil(
          fetch(event.request)
            .then((response) => {
              if (response && response.ok) {
                cache.put(event.request, response.clone());
              }
            })
            .catch(() => undefined),
        );
        return cached;
      }

      try {
        const response = await fetch(event.request);
        if (response && response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        return cached || Response.error();
      }
    }),
  );
});


