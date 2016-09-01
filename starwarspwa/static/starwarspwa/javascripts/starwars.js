/**
 *  Get jedi's name from localStorage or form.
 *
 *  First, check the localStorage if the name is already stored there. If not,
 *  we ask the user for his/her jedi name, store the given name inside
 *  localStorage, then show the form for transmitting messages.
 *
 *  If the name is already in the localStorage, that name will be used and just
 *  show the form for transmitting messages.
 **/

if (localStorage.getItem('name') === null) {
    $('.jedi-form').on('submit', function(e) {
        e.preventDefault();

        var name = $('.jedi-form input').val().trim();
        if (name.length > 0) {
            localStorage.setItem('name', name);
            showMessageTransmissionForm(name);
        }
    });
} else {
    showMessageTransmissionForm(localStorage.getItem('name'));
}


function showMessageTransmissionForm(name) {
    $('.jedi-form').addClass('hidden');
    $('.transmit-form').removeClass('hidden');

    $('.transmit-form .jedi-name').text(name);
    $('.transmit-form .form__input').focus();
}





/**
 *  Handle message transmissions.
 *
 *  Whenever the message transmission form gets submitted, we intercept it and
 *  do the sending of the message ourselves. We send the message, together with
 *  the name of the jedi who submitted it, to our server.
 *
 *  We disable the transmission form while still sending data to our server in
 *  order to avoid having another message while a transmission is still in
 *  progress. We re-enable and reset the transmission form every time a
 *  transmission finishes, and handle any error that occurs during the process.
 **/

$('.transmit-form').on('submit', function(e) {
    e.preventDefault();

    var name = localStorage.getItem('name');
    var message = $('.transmit-form input').val().trim();

    if (name.length > 0 && message.length > 0) {
        disableTransmissionForm();

        var transmission = { jedi: name, message: message };
        sendTransmissionToServer(transmission)
            .then(enableTransmissionForm)
            .then(resetTransmissionForm)
            .catch(handleTransmissionFailure);
    }
});


function sendTransmissionToServer(transmission) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/transmit',
            type: 'GET',
            data: transmission,
            success: resolve,
            error: reject
        });
    });
}


function handleTransmissionFailure(error) {
    console.error('Transmission Failed.');
}


function disableTransmissionForm() {
    $('.transmit-form input').prop('disabled', true);
    $('.transmit-form button').prop('disabled', true);
}


function enableTransmissionForm() {
    $('.transmit-form input').prop('disabled', false);
    $('.transmit-form button').prop('disabled', false);
}


function resetTransmissionForm() {
    $('.transmit-form input').val('').focus();
}





/**
 *  Update subscribe button state.
 *
 *  Check push notification subscription status. If user is not yet subscribed
 *  to push notifications, we don't do anything with the subscribe button.
 *
 *  If the user is already subscribed to push notifications, we change the
 *  subscribe button to an unsubscribe button.
 **/

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(function(registration) {
        if (registration !== undefined) {
            registration.pushManager.getSubscription().then(function(subscription) {
                if (subscription !== undefined) {
                    changeSubscribeToUnsubscribe();
                }
            });
        }
    }).catch(function(error) {
        console.error('Failed to get service worker registration.', error);
    });
}


function changeSubscribeToUnsubscribe() {
    $('.subscription-button').text('Unsubscribe');
    $('.subscription-button').data('action', 'unsubscribe');
}


function changeUnsubscribeToSubscribe() {
    $('.subscription-button').text('Subscribe');
    $('.subscription-button').data('action', 'subscribe');
}


function storeSubscriptionInServerStorage(subscription) {
    return updateSubscriptionInServerStorage('subscribe', subscription);
}


function deleteSubscriptionFromServerStorage(subscription) {
    return updateSubscriptionInServerStorage('unsubscribe', subscription);
}


function updateSubscriptionInServerStorage(action, subscription) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/subscription/' + action,
            type: 'GET',
            data: JSON.parse(JSON.stringify(subscription)),
            success: resolve,
            error: reject
        });
    });
}
