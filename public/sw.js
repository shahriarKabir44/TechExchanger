var cacheName = 'helloWorld';

self.addEventListener('push', (e) => {
    var dat = JSON.parse(e.data.text())
    self.registration.showNotification(dat.title, {
        body: dat.body,
        icon: 'https://firebasestorage.googleapis.com/v0/b/pqrs-9e8eb.appspot.com/o/logo.png?alt=media&token=81d00c6b-f9a6-4648-9a67-28f05639cb96',
    })
    self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window',
    }).then((clients) => {
        if (clients && clients.length) {
            // Send a response - the clients
            // array is ordered by last focused
            clients[0].postMessage({
                type: 'REPLY_COUNT',
                count: "xnxx",
            });
        }
    });
})

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll([
                '/js/index.js',
                '/',
                'index.html'
            ]))
    );
});

self.onfetch = function (event) {
    event.respondWith(
        (async function () {
            try {
                var response = await fetch(event.request);
                await cache.put(event.request, response.clone());
                return response;
            } catch (error) {
                var cache = await caches.open(cacheName);
                var cachedFiles = await cache.match(event.request);
                if (cachedFiles) {
                    return cachedFiles;
                }
                else return null
            }
        }())
    )
}
