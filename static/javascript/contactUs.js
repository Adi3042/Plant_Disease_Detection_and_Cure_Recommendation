document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const successDiv = document.getElementById('form-success');
    const contactBox = document.querySelector('.contact-box');

    // Ensure error elements exist
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    // Handle form submission with AJAX
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        resetErrors();

        const isNameValid = validateName();
        const isPhoneValid = validatePhone();
        const isEmailValid = validateEmail();
        const isMessageValid = validateMessage();

        if (isNameValid && isPhoneValid && isEmailValid && isMessageValid) {
            submitForm();
        }
    });

    function submitForm() {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Submit form via AJAX
        const formData = new FormData(form);
        
        fetch('/submit-contact', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest' // Add this header
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                showSuccessMessage();
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            flashError(error.message || 'Failed to send message. Please try again.');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'SEND MESSAGE';
        });
    }

    function showSuccessMessage() {
        form.style.display = 'none';
        successDiv.style.display = 'block';
        
        // Reset form after 3 seconds
        setTimeout(() => {
            form.reset();
            form.style.display = 'block';
            successDiv.style.display = 'none';
        }, 3000);
    }

    // Real-time validation
    nameInput.addEventListener('input', validateName);
    phoneInput.addEventListener('input', validatePhone);
    emailInput.addEventListener('input', validateEmail);
    messageInput.addEventListener('input', validateMessage);

    function flashError(message) {
        const errorFlash = document.createElement('div');
        errorFlash.className = 'error-flash';
        errorFlash.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        `;
        contactBox.prepend(errorFlash);
        
        setTimeout(() => {
            errorFlash.classList.add('fade-out');
            setTimeout(() => errorFlash.remove(), 500);
        }, 3000);
    }

    function validateName() {
        const name = nameInput.value.trim();
        const nameError = document.getElementById('name-error');
        
        if (name === '') {
            setError(nameInput, nameError, 'Name is required');
            return false;
        } else if (name.length < 3) {
            setError(nameInput, nameError, 'Name must be at least 3 characters');
            return false;
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            setError(nameInput, nameError, 'Name can only contain letters and spaces');
            return false;
        }
        
        clearError(nameInput, nameError);
        return true;
    }

    function validatePhone() {
        const phone = phoneInput.value.trim();
        const phoneError = document.getElementById('phone-error');
        const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
        
        if (phone === '') {
            setError(phoneInput, phoneError, 'Phone number is required');
            return false;
        } else if (!phoneRegex.test(phone)) {
            setError(phoneInput, phoneError, 'Please enter a valid Indian phone number');
            return false;
        }
        
        clearError(phoneInput, phoneError);
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            setError(emailInput, emailError, 'Email is required');
            return false;
        } else if (!emailRegex.test(email)) {
            setError(emailInput, emailError, 'Please enter a valid email address');
            return false;
        }
        
        clearError(emailInput, emailError);
        return true;
    }

    function validateMessage() {
        const message = messageInput.value.trim();
        const messageError = document.getElementById('message-error');
        
        if (message === '') {
            setError(messageInput, messageError, 'Message is required');
            return false;
        } else if (message.length < 10) {
            setError(messageInput, messageError, 'Message must be at least 10 characters');
            return false;
        }
        
        clearError(messageInput, messageError);
        return true;
    }

    function setError(input, errorElement, message) {
        input.parentElement.classList.add('error');
        errorElement.textContent = message;
    }

    function clearError(input, errorElement) {
        input.parentElement.classList.remove('error');
        errorElement.textContent = '';
    }

    function resetErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        const inputGroups = document.querySelectorAll('.input-group');
        
        errorMessages.forEach(msg => msg.textContent = '');
        inputGroups.forEach(group => group.classList.remove('error'));
    }
});