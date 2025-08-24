self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("ai-agent-v1").then(cache => {
      return cache.addAll([
        "index.html",
        "script.js",
        "style.css",
        "manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
