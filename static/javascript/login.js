document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector(".container");
    const signUpBtn = document.getElementById("sign-up-btn");
    const signInBtn = document.getElementById("sign-in-btn");

    if (signUpBtn && signInBtn && container) {
        signUpBtn.addEventListener("click", function(e) {
            e.preventDefault();
            container.classList.add("sign-up-mode");
        });

        signInBtn.addEventListener("click", function(e) {
            e.preventDefault();
            container.classList.remove("sign-up-mode");
        });
    }
});

// Initialize intl-tel-input for the phone input field
const phoneInputField = document.querySelector("#phone");
const iti = window.intlTelInput(phoneInputField, {
    initialCountry: "in", // Default to India
    separateDialCode: true,
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
});

// Registration form submission
document.querySelector(".registration-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Client-side validation
    const { username, password, confirmpassword } = data;
    const countrycode = "+" + iti.getSelectedCountryData().dialCode;
    const mobileno = phoneInputField.value.trim().replace(/\D/g, "");

    if (username.length < 4) {
        showAlert("Username must be at least 4 characters long.");
        return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password) || !/[^\w\s]/.test(password)) {
        showAlert("Password must be at least 8 characters long and contain 1 letter, 1 digit, and 1 symbol.");
        return;
    }

    if (password !== confirmpassword) {
        showAlert("Passwords do not match.");
        return;
    }

    if (!mobileno || !countrycode) {
        showAlert("Mobile number and country code are required.");
        return;
    }

    // Validate mobile number length
    const validMobileLengths = { "+91": 10, "+1": 10, "+44": 11 };
    if (mobileno.length !== validMobileLengths[countrycode]) {
        showAlert(`Mobile number for ${countrycode} must be ${validMobileLengths[countrycode]} digits.`);
        return;
    }

    // Send data to the server using Fetch API
    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            showAlert(result.message, "success");
            form.reset();
        } else {
            showAlert(result.message, "error");
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Registration failed:", error);
        showAlert("A server error occurred. Please try again.");
    }
});

// Login form submission with validation and server interaction
document.querySelector("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    console.log("Form Data:", data); // Debug: Log the form data

    // Send data to the server using Fetch API
    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Set Content-Type to application/json
            body: JSON.stringify(data), // Convert form data to JSON
        });

        const result = await response.json();

        console.log("Server Response:", result); // Debug: Log the server response

        if (response.ok) {
            alert(result.message); // Show success message
            window.location.href = "/"; // Redirect to the home page or dashboard
        } else {
            alert(result.message); // Show error message
        }
    } catch (error) {
        console.error("Login failed:", error);
        alert("A server error occurred. Please try again.");
    }
});

function showLoading() {
    const loading = document.createElement("div");
    loading.className = "loading-spinner";
    document.body.appendChild(loading);
}

function hideLoading() {
    const spinner = document.querySelector(".loading-spinner");
    if (spinner) spinner.remove();
}

// Handle Google Sign-In response
function handleGoogleSignIn(response) {
    showLoading();
    const token = response.credential;
    
    fetch('/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.status === 'success') {
            showAlert(data.message, 'success');
            setTimeout(() => window.location.href = '/', 2000);
        } else {
            showAlert(data.message, 'error');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Error:', error);
        showAlert('Login failed. Please try again.', 'error');
    });
}

// Enhanced showAlert function
function showAlert(message, type = "error") {
    const alertBox = document.createElement("div");
    alertBox.className = `alert alert-${type} show`;
    alertBox.innerText = message;
    document.body.appendChild(alertBox);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        alertBox.classList.remove('show');
        alertBox.classList.add('hide');
        setTimeout(() => alertBox.remove(), 500);
    }, 3000);
}

// Update the registration form submission
document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Convert FormData to JSON
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Client-side validation
    const errors = validateSignupForm(data);
    if (errors.length > 0) {
        errors.forEach(error => showAlert(error, "error"));
        return;
    }

    // AJAX submission
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(result.message, "success");
            form.reset();
            container.classList.remove("sign-up-mode");
        } else {
            showAlert(result.message, "error");
        }
    } catch (error) {
        console.error("Registration failed:", error);
        showAlert("A server error occurred. Please try again.", "error");
    }
});

// Enhanced validation function
function validateSignupForm(data) {
    const errors = [];
    
    // First name validation
    if (!data.firstname || data.firstname.trim().length < 2) {
        errors.push("First name must be at least 2 characters long");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push("Please enter a valid email address");
    }

    // Password validation
    if (!data.password || data.password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    } else if (!/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
        errors.push("Password must contain both letters and numbers");
    }

    // Confirm password
    if (data.password !== data.confirmpassword) {
        errors.push("Passwords do not match");
    }

    // Mobile number validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!data.mobileno || !phoneRegex.test(data.mobileno)) {
        errors.push("Please enter a valid mobile number (10-15 digits)");
    }

    return errors;
}

// Real-time form validation
document.querySelectorAll('#registerForm input').forEach(input => {
    input.addEventListener('blur', function() {
        const formData = new FormData(document.getElementById('registerForm'));
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        const errors = validateSignupForm(data);
        const fieldErrors = errors.filter(error => 
            error.toLowerCase().includes(input.name) || 
            (input.name === 'confirmpassword' && error.includes('Passwords'))
        );
        
        const parent = input.closest('.form-group') || input.closest('.input-field');
        if (parent) {
            // Remove existing error messages
            const existingError = parent.querySelector('.error-message');
            if (existingError) existingError.remove();
            
            // Add new error if exists
            if (fieldErrors.length > 0) {
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = fieldErrors[0];
                errorElement.style.color = '#dc3545';
                errorElement.style.fontSize = '0.8rem';
                errorElement.style.marginTop = '5px';
                parent.appendChild(errorElement);
                input.style.borderColor = '#dc3545';
            } else if (input.value) {
                input.style.borderColor = '#28a745';
            } else {
                input.style.borderColor = '';
            }
        }
    });
});