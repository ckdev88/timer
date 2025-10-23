const CACHE_NAME = 'timer-app-v1.0.1'
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './img/favicon-48.png',
    './img/favicon-192.png',
    './manifest.json',
    './audio/demo/alert.wav',
    './audio/demo/brownnoise/1.opus',
    './audio/demo/brownnoise/2.opus',
    './audio/demo/lofi/1.opus',
    './audio/demo/lofi/2.opus',
    './audio/demo/lofi/3.opus',
    './audio/demo/lofi/4.opus',
    './audio/demo/rain/1.opus',
    './audio/demo/rain/2.opus',
    './audio/demo/rain/3.opus',
    './audio/demo/rain/4.opus'
]

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
    self.skipWaiting()
})

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
    self.clients.claim()
})

// Fetch - CRITICAL: This must be present
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    )
})
