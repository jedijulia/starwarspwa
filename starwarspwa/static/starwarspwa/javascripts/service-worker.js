var cacheName = 'cache-one';
var urlsToCache = [
    '/',
    '/offline/',
    '/static/starwarspwa/stylesheets/starwars.css',
    '/static/starwarspwa/javascripts/starwars.js',
    '/static/starwarspwa/javascripts/jquery.js',
    '/static/starwarspwa/javascripts/sw-register.js',
    '/static/starwarspwa/fonts/quicksand/regular.woff2',
    '/static/starwarspwa/fonts/quicksand/bold.woff2',
    '/static/starwarspwa/images/wifi-offline.png'
];


self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(urlsToCache);
        }).then(function() {
            console.info('Caching for "' + cacheName + '" completed."');
            return self.skipWaiting();
        }).catch(function(error) {
            console.error('Failed to cache resources.', error);
        })
    );
});


self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(cacheKeys) {
            var cachesToDelete = cacheKeys.filter(function(cacheKey) {
                return cacheKey !== cacheName;
            });
            return Promise.all(cachesToDelete.map(function(cacheKey) {
                return caches.delete(cacheKey);
            }));
        }).then(function() {
            return self.clients.claim();
        })
    );
});


self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/transmissions/')) {
        e.respondWith(
            fetch(e.request).catch(function() {
                return caches.match('/offline/');
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(e.request);
            })
        );
    }
});

//
// self.addEventListener('push', function(e) {
//     e.waitUntil(
//         self.registration.showNotification('Jedi Transceiver', {
//             body: 'New transmission received',
//             icon: '/static/starwarspwa/images/jedi-icon.png'
//         })
//     );
// });
//
//
// self.addEventListener('notificationclick', function(e) {
//     e.notification.close();
//     e.waitUntil(self.clients.openWindow('/transmissions/'));
// });
