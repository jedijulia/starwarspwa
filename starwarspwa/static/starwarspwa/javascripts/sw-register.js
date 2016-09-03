/**
 *  Register our Service Worker.
 *
 *  To start using our service worker, we first need to register it. Make sure
 *  that the service worker file is at the root url of your project, e.g.
 *  `/service-worker.js`, so that it can control all the pages in your app.
 *
 *  But before we do all of this, we first check whether or not the browser
 *  supports service workers or not. Make sure that the app is still usable
 *  even on browsers that do not support service workers, and just enhance the
 *  experience for those who do. This is called "Progressive Enhancement".
 **/

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.info('Service worker successfully registered.');
    }).catch(function(error) {
        console.error('Failed to register service worker', error);
    });
}
