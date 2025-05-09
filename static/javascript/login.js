// Toggle between Sign In and Sign Up forms
const signInBtn = document.getElementById("sign-in-btn");
const signUpBtn = document.getElementById("sign-up-btn");
const container = document.querySelector(".container");

document.addEventListener("click", (event) => {
    if (event.target.id === "sign-up-btn") {
        container.classList.add("sign-up-mode");
    } else if (event.target.id === "sign-in-btn") {
        container.classList.remove("sign-up-mode");
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

// Display alert function
function showAlert(message, type = "error") {
    const alertBox = document.createElement("div");
    alertBox.className = `alert ${type}`;
    alertBox.innerText = message;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
}