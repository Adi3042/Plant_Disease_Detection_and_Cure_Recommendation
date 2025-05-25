// Camera Capture Functionality
const captureBtn = document.getElementById('capture-btn');
const cameraContainer = document.getElementById('camera-container');
const liveVideo = document.getElementById('live-video');
const captureSnapshotBtn = document.getElementById('capture-snapshot');
const cancelCaptureBtn = document.getElementById('cancel-capture');
const fileInput = document.getElementById('file');
const captureCanvas = document.createElement('canvas');
const fileLabel = document.getElementById('file-label');
const uploadContainer = document.getElementById('upload-container');
const uploadForm = document.getElementById('upload-form');
const loader = document.getElementById('loader-container');
const spinnerLoader = document.getElementById('spinner-loader');
let mediaStream = null;
let capturedImageData = null;

if (captureBtn) {
    captureBtn.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                mediaStream = stream; // Store the stream for later cleanup
                liveVideo.srcObject = stream;
                cameraContainer.style.display = 'flex';
            })
            .catch(err => {
                console.error('Error accessing camera:', err);
                alert('Unable to access camera. Please check permissions.');
            });
    });

    // Implement capture snapshot button functionality
    if (captureSnapshotBtn) {
        captureSnapshotBtn.addEventListener('click', () => {
            if (!mediaStream) return;
            
            // Show spinner immediately
            if (spinnerLoader) spinnerLoader.style.display = 'block';
            
            const context = captureCanvas.getContext('2d');
            captureCanvas.width = liveVideo.videoWidth;
            captureCanvas.height = liveVideo.videoHeight;
            context.drawImage(liveVideo, 0, 0);
            capturedImageData = captureCanvas.toDataURL('image/png');
            
            // Create file object
            const blob = dataURLtoBlob(capturedImageData);
            const file = new File([blob], 'captured-image.png', {type: 'image/png'});
            
            // Update file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            fileLabel.textContent = 'File selected: captured-image.png';
            
            stopCamera();
            
            // Show both spinner and loader
            if (loader) loader.style.display = 'flex';
            uploadForm.submit();
        });
    }

    // Implement cancel button functionality
    if (cancelCaptureBtn) {
        cancelCaptureBtn.addEventListener('click', () => {
            stopCamera();
        });
    }
}

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Function to stop camera and clean up
function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (liveVideo.srcObject) {
        liveVideo.srcObject = null;
    }
    if (cameraContainer) {
        cameraContainer.style.display = 'none';
    }
}

// Session Management
function checkSession() {
    fetch('/check-session')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.logged_in) {
                // User is logged in, hide overlay
                document.getElementById('intro-overlay').style.display = 'none';
                // Enable all functionality
                document.body.classList.remove('overlay-active');
            } else {
                // User not logged in, show overlay and disable main page interactions
                document.getElementById('intro-overlay').style.display = 'flex';
                document.body.classList.add('overlay-active');
            }
        })
        .catch(err => {
            console.error('Error checking session:', err);
            // Default to showing overlay if there's an error
            document.getElementById('intro-overlay').style.display = 'flex';
            document.body.classList.add('overlay-active');
        });
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    if (spinnerLoader) spinnerLoader.style.display = 'none';
    
    // Setup login/register buttons
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/login';
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/login?action=register';
        });
    }
    
    // Initialize particles.js if overlay exists
    if (document.getElementById('intro-overlay')) {
        particlesJS('particles-left', {
            particles: {
                number: { value: 40, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
            }
        });
    }
});

// Hover effect for upload title
const uploadTitle = document.querySelector('.upload-title');
if (uploadTitle) {
    uploadTitle.addEventListener('mouseover', () => {
        uploadTitle.style.transform = 'scale(1.1)';
        uploadTitle.style.color = '#ff7f50';
    });

    uploadTitle.addEventListener('mouseout', () => {
        uploadTitle.style.transform = 'scale(1)';
        uploadTitle.style.color = '#333';
    });
}

// Google Sign-In Initialization
function initGoogleSignIn() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: "915336185518-53u79enr56mul76cr28e59udahmg04rs.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });

        google.accounts.id.renderButton(
            document.getElementById("g_id_signin"), {
                theme: "filled_black",
                size: "large",
                shape: "rectangular",
                text: "continue_with"
            }
        );
    }
}

window.onload = function() {
    initGoogleSignIn();
};

function handleCredentialResponse(response) {
    const token = response.credential;
    fetch('/google-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.reload();
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login error occurred');
    });
}

function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

if (fileInput && fileLabel && uploadContainer && uploadForm) {
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileLabel.textContent = 'File selected: ' + this.files[0].name;
        } else {
            fileLabel.textContent = 'Choose a file';
        }
    });

    // Drag events
    uploadContainer.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadContainer.style.background = 'rgba(0, 128, 0, 0.1)';
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.style.background = '';
    });

    uploadContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadContainer.style.background = '';
        if (event.dataTransfer.files.length > 0) {
            fileInput.files = event.dataTransfer.files;
            fileLabel.textContent = 'File selected: ' + event.dataTransfer.files[0].name;
        }
    });

    // Form submission with loader
    uploadForm.addEventListener('submit', function(e) {
        if (fileInput.files.length > 0) {
            // Show both spinner and loader
            if (spinnerLoader) spinnerLoader.style.display = 'block';
            if (loader) loader.style.display = 'flex';
        } else {
            e.preventDefault();
            alert('Please select an image first');
        }
    });
}

// Disable main page interactions when overlay is active
document.addEventListener('click', function(e) {
    if (document.body.classList.contains('overlay-active')) {
        // Allow clicks only on the overlay elements
        if (!e.target.closest('#intro-overlay')) {
            e.preventDefault();
            e.stopPropagation();
            alert('Please login or register to continue');
        }
    }
}, true);