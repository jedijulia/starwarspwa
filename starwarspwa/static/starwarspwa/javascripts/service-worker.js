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
        }).catch(function(error) {
            console.error('Failed to cache resources.', error);
        })
    );
})

// var CACHE_NAME = 'cache-one';
//
// var urls = [
//     '/',
//     '/transmissions/',
//     '/offline/',
//     '/static/starwarspwa/images/wifi-offline.png',
//     '/static/starwarspwa/stylesheets/base.css',
//     '/static/starwarspwa/stylesheets/home.css',
//     '/static/starwarspwa/stylesheets/transmissions.css',
//     '/static/starwarspwa/javascripts/utils.js',
//     '/static/starwarspwa/javascripts/main.js'
// ];
//
//
// self.addEventListener('install', function(e) {
//     e.waitUntil(
//         caches.open(CACHE_NAME)
//             .then(function(cache) {
//                 return cache.addAll(urls);
//             })
//             .then(function() {
//                 console.info('Caching for "' + CACHE_NAME + '" completed.');
//             })
//     );
// });
//
//
// self.addEventListener('activate', function(e) {
//     e.waitUntil(
//         caches.keys().then(function(cacheNames) {
//             return Promise.all(cacheNames.map(function(cacheName) {
//                 if (cacheName !== CACHE_NAME) {
//                     console.info('Deleting old cache:', cacheName);
//                     return caches.delete(cacheName);
//                 }
//             }));
//         })
//     );
// });
//
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
