function setupPhoneNumberForm(phoneNumberInputElement, formElement) {
    phoneNumberInputElement.addEventListener('input', function (e) {
        let input = e.target.value.replace(/\D/g, '');
        let formattedPhone = '';

        if (input.startsWith('38')) {
            input = '+' + input;
        }

        if (input.length > 0) {
            formattedPhone = input.substring(0, 4);
        }
        if (input.length > 4) {
            formattedPhone += ' ' + input.substring(4, 6);
        }
        if (input.length > 6) {
            formattedPhone += ' ' + input.substring(6, 9);
        }
        if (input.length > 9) {
            formattedPhone += ' ' + input.substring(9, 13);
        }

        e.target.value = formattedPhone;
    });

    formElement.addEventListener('submit', function (e) {
        e.preventDefault();
        phoneNumberInputElement.value = phoneNumberInputElement.value.replace(/\s+/g, '').replace(/[^\d+]/g, '');
        this.submit();
    });
}

