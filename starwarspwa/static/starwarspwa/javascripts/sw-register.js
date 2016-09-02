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





/**
 *  Handle push notifications subscriptions.
 *
 *  When the subscription button is clicked, we first retrieve the user's
 *  subscription status (whether user is subscribed already or not yet) and
 *  then perform the appropriate action based on that.
 *
 *  We also update the label of the button after the user subscribes to or
 *  unsubscribes from push notifications.
 **/

$('.subscription-button').on('click', function() {
    if (!supportsPushNotifications()) {
        return false;
    }
    var subscriptionButton = $(this);

    navigator.serviceWorker.getRegistration().then(function(registration) {
        if (registration !== undefined) {
            subscriptionButton.prop('disabled', true);

            registration.pushManager.getSubscription().then(function(subscription) {
                if (subscription === null) {
                    return subscribeToPushNotifications(registration);
                }
                return unsubscribeFromPushNotifications(subscription);
            }).then(function() {
                subscriptionButton.prop('disabled', false);
            }).catch(function(error) {
                console.error('Failed to get push notification subscription.', error);
            });
        }
    }).catch(function(error) {
        console.error('Failed to get service worker registration.', error);
    });
});


function subscribeToPushNotifications(registration) {
    return registration.pushManager.subscribe({ userVisibleOnly: true }).then(function(subscription) {
        changeSubscribeToUnsubscribe();
        return storeSubscriptionInServerStorage(subscription);
    }).catch(function(error) {
        console.error('Failed to subscribe to push notifications.', error);
    });
}


function unsubscribeFromPushNotifications(subscription) {
    return subscription.unsubscribe().then(function() {
        changeUnsubscribeToSubscribe();
        return deleteSubscriptionFromServerStorage(subscription);
    }).catch(function(error) {
        console.error('Failed to unsubscribe from push notifications.', error);
    });
}





/**
 *  Handle message transmissions through background sync.
 *
 *  If the browser supports background sync, we disable the current
 *  transmission form behavior (send transmission to server through AJAX),
 *  modify it to save the message to IndexedDB, and then register for a
 *  background sync.
 *
 *  If background sync is not supported or when registering for background sync
 *  fails, fallback to the AJAX way of sending the transmission to the server.
 **/

if (supportsBackgroundSync()) {
    $('.transmit-form').off();

    $('.transmit-form').on('submit', function(e) {
        e.preventDefault();

        var name = localStorage.getItem('name');
        var message = $('.transmit-form input').val().trim();

        if (name.length > 0 && message.length > 0) {
            disableTransmissionForm();

            var transmission = { jedi: name, message: message };
            saveTransmissionToIndexedDB(transmission)
                .then(registerForBackgroundSync)
                .catch(function(error) {
                    return sendTransmissionToServer(transmission)
                        .catch(handleTransmissionFailure);
                })
                .then(enableTransmissionForm)
                .then(resetTransmissionForm);
        }
    });
}


function registerForBackgroundSync() {
    return navigator.serviceWorker.getRegistration().then(function(registration) {
        if (registration !== undefined) {
            return registration.sync.register('transmit-message');
        }
        throw new Error('No service worker registered yet.');
    });
}


function supportsBackgroundSync() {
    return ('serviceWorker' in navigator) && ('SyncManager' in window);
}
