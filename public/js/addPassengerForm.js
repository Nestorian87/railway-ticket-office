function toggleBenefitField(benefitSelectId, benefitFieldId, benefitLabelId, benefitInputId) {
    const benefitElement = document.getElementById(benefitSelectId);
    const selectedOption = benefitElement.options[benefitElement.selectedIndex];
    const documentName = selectedOption.getAttribute('data-document');

    const benefitDocumentField = document.getElementById(benefitFieldId);
    const benefitDocumentLabel = document.getElementById(benefitLabelId);
    const benefitDocumentInput = document.getElementById(benefitInputId);

    if (documentName) {
        benefitDocumentField.style.display = 'block';
        benefitDocumentLabel.textContent = documentName;
        benefitDocumentInput.setAttribute('required', 'required');
    } else {
        benefitDocumentField.style.display = 'none';
        benefitDocumentInput.removeAttribute('required');
        benefitDocumentInput.value = '';
    }
}