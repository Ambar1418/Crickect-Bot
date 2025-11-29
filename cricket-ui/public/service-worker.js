self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");

  event.waitUntil(
    caches.open("vk-cache").then(() => console.log("Cache ready"))
  );

  self.skipWaiting();
});
