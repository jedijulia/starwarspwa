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
