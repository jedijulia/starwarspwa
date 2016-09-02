var cacheName = 'cache-one';
var urlsToCache = [
    '/',
    '/offline/',
    '/static/starwarspwa/stylesheets/starwars.css',
    '/static/starwarspwa/javascripts/starwars.js',
    '/static/starwarspwa/javascripts/jquery.js',
    '/static/starwarspwa/javascripts/sw-register.js',
    '/static/starwarspwa/fonts/quicksand/regular.woff2',
    '/static/starwarspwa/fonts/quicksand/bold.woff2'
];


self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(urlsToCache);
        }).then(function() {
            console.info('Caching for "' + cacheName + '" completed."');
            self.skipWaiting();
        }).catch(function(error) {
            console.error('Failed to cache resources.', error);
        })
    );
});


self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(cacheKeys) {
            return Promise.all(cacheKeys.filter(function(cacheKey) {
                return cacheKey !== cacheName;
            }).map(function(cacheKey) {
                return caches.delete(cacheKey);
            }));
        })
    );
});


self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            if (response) {
                return response;
            }
            return fetch(e.request);
        })
    );
});

//
// self.addEventListener('fetch', function(e) {
//     if (/\/transmissions\/$/.test(e.request.url)) {
//         e.respondWith(
//             fetch(e.request).catch(function(error) {
//                 return caches.open(CACHE_NAME).then(function(cache) {
//                     return cache.match('/offline/');
//                 });
//             })
//         );
//     } else {
//         e.respondWith(
//             caches.open(CACHE_NAME).then(function(cache) {
//                 return cache.match(e.request).then(function(response) {
//                     if (response) {
//                         return response;
//                     }
//                     return fetch(e.request);
//                 })
//             })
//         );
//     }
// });
//
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
