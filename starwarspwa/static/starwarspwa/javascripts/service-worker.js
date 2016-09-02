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
        }).catch(function(error) {
            console.error('Failed to delete old caches.', error);
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
            }).catch(function(error) {
                console.error('Error when trying to match request in cache.', error);
            })
        );
    }
});


self.addEventListener('push', function(e) {
    if (e.data === null) {
        var notification = {
            title: 'Transmission Received',
            body: 'Tap/click to view all transmissions',
            icon: '/static/starwarspwa/images/jedi-icon.png'
        };
    } else {
        var notification = e.data.json();
    }
    e.waitUntil(self.registration.showNotification(notification.title, notification));
});


self.addEventListener('notificationclick', function(e) {
    e.notification.close();
    if (e.action === 'reply') {
        var redirectUrl = '/';
    } else {
        var redirectUrl = '/transmissions/';
    }

    e.waitUntil(self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
    }).then(function(clientWindows) {
        if (clientWindows.length > 0) {
            clientWindows[0].navigate(redirectUrl);
            clientWindows[0].focus();
        } else {
            self.clients.openWindow(redirectUrl);
        }
    }).catch(function(error) {
        console.error('Failed to get client windows.', error);
    }));
});
