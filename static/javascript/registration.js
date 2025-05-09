// Initialize intl-tel-input for the mobile number field
const phoneInput = document.querySelector("#mobileno");
const iti = intlTelInput(phoneInput, {
    initialCountry: "in", // Set default country
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js", // Load utility script
});

// Handle form submission
// Handle form submission
document.querySelector("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Get the full phone number with country code
    data.mobileno = iti.getNumber();

    // Client-side validation
    const { firstname, email, password, confirmpassword, mobileno } = data;

    if (firstname.trim().length === 0) {
        showAlert("First name is required.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAlert("Invalid email address.");
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

    if (!iti.isValidNumber()) {
        showAlert("Invalid mobile number.");
        return;
    }

    // Send data to the server using Fetch API
    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Set Content-Type to application/json
            body: JSON.stringify(data), // Convert form data to JSON
        });

        const result = await response.json();

        if (response.ok) {
            showAlert(result.message, "success");
            form.reset();
            iti.setNumber(""); // Clear the intl-tel-input field
        } else {
            showAlert(result.message, "error");
        }
    } catch (error) {
        console.error("Registration failed:", error);
        showAlert("A server error occurred. Please try again.");
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