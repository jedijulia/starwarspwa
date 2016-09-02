if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.info('Service worker successfully registered.');
    }).catch(function(error) {
        console.error('Failed to register service worker', error);
    });
}
