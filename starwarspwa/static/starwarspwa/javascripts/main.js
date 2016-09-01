var starwarspwa = (function(_) {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(function(registration) {
                console.info('Service worker successfully registered.');
                syncSubscribeButton();
            })
            .catch(function(error) {
                console.error('Service worker registration failed.', error);
            });
    }



    var jediForm = _.$('.jedi-form');
    var transmitForm = _.$('.transmit-form');
    var subscribeButton = _.$('.subscribe-button');

    var name = localStorage.getItem('name');
    var subscriptionId = null;

    if (name) {
        showTransmitForm(name);
    } else {
        jediForm.addEventListener('submit', function(e) {
            e.preventDefault();
            name = this.name.value.trim();
            if (name) {
                localStorage.setItem('name', name);
                showTransmitForm(name);
            }
        });
    }


    transmitForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var form = this;
        var message = form.message.value.trim();

        if (name && message) {
            submittingForm(transmitForm, true);

            Promise.resolve()
                .then(function() {
                    if (subscriptionId) {
                        return subscriptionId;
                    }
                    return getSubscription().then(function(subscription) {
                        if (subscription) {
                            return parseSubscriptionId(subscription.endpoint);
                        }
                        return null;
                    });
                })
                .then(function(subscription) {
                    subscriptionId = subscription;

                    transmitMessage(name, message, subscriptionId, function(success, response) {
                        submittingForm(transmitForm, false);
                        form.message.value = '';
                        form.message.focus();

                        if (!success) {
                            console.error('Failed. Background sync later.');
                        }
                    });
                });
        }
    });


    subscribeButton.addEventListener('click', function(e) {
        this.disabled = true;
        if (this.dataset.action === 'subscribe') {
            subscribeToPushNotifications().then(function(subscription) {
                var subscriptionId = parseSubscriptionId(subscription.endpoint);
                updateSubscription(subscriptionId, true);
                syncSubscribeButton().then(function() {
                    subscribeButton.disabled = false;
                });
            });
        } else {
            unsubscribeFromPushNotifications().then(function(subscription) {
                var subscriptionId = parseSubscriptionId(subscription.endpoint);
                updateSubscription(subscriptionId, false);
                syncSubscribeButton().then(function() {
                    subscribeButton.disabled = false;
                });
            });
        }
    });



    function subscribeToPushNotifications(callback) {
        return navigator.serviceWorker.getRegistration().then(function(registration) {
            return registration.pushManager.subscribe({ userVisibleOnly: true });
        });
    }


    function unsubscribeFromPushNotifications(callback) {
        return navigator.serviceWorker.getRegistration().then(function(registration) {
            return registration.pushManager.getSubscription().then(function(subscription) {
                if (subscription) {
                    return subscription.unsubscribe().then(function() {
                        return subscription;
                    });
                }
                return subscription;
            });
        });
    }


    function parseSubscriptionId(endpoint) {
        return endpoint.replace('https://android.googleapis.com/gcm/send/', '');
    }


    function syncSubscribeButton() {
        return getSubscription().then(function(subscription) {
            if (subscription) {
                subscribeButton.textContent = 'Unsubscribe';
                subscribeButton.dataset.action = 'unsubscribe';
            } else {
                subscribeButton.textContent = 'Subscribe';
                subscribeButton.dataset.action = 'subscribe';
            }
        });
    }


    function getSubscription() {
        return navigator.serviceWorker.getRegistration().then(function(registration) {
            return registration.pushManager.getSubscription();
        });
    }


    function submittingForm(form, submitting) {
        if (submitting) {
            form.classList.add('submitting');
            _.$('input', form).disabled = true;
            _.$('button', form).disabled = true;
        } else {
            form.classList.remove('submitting');
            _.$('input', form).disabled = false;
            _.$('button', form).disabled = false;
        }
    }


    function showTransmitForm(name) {
        jediForm.classList.add('hidden');

        _.$('.jedi-name', transmitForm).textContent = name;
        transmitForm.classList.remove('hidden');
        transmitForm.message.focus();
    }


    function transmitMessage(jedi, message, senderId, callback) {
        var querystring = 'jedi=' + jedi + '&message=' + message;
        if (senderId) {
            querystring += '&sender_id=' + senderId;
        }

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === request.DONE
            && typeof callback === 'function') {
                if (request.status === 200) {
                    callback(true, JSON.parse(request.responseText));
                } else {
                    callback(false);
                }
            }
        };
        request.open('GET', '/transmit/?' + querystring);
        request.send();
    }


    function updateSubscription(id, subscribe, callback) {
        var action = subscribe ? 'subscribe' : 'unsubscribe';
        var querystring = 'id=' + id;

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === request.DONE
            && typeof callback === 'function') {
                if (request.status === 200) {
                    callback(true, JSON.parse(request.responseText));
                } else {
                    callback(false);
                }
            }
        };
        request.open('GET', '/subscription/' + action + '/?' + querystring);
        request.send();
    }

})(utils);
