// Live Capture Functionality
const captureBtn = document.getElementById('capture-btn');
const liveVideo = document.getElementById('live-video');
const cameraContainer = document.getElementById('camera-container');

if (captureBtn) {
    captureBtn.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                liveVideo.srcObject = stream;
                cameraContainer.style.display = 'flex'; // Show the camera container
            })
            .catch(err => {
                console.error('Error accessing camera:', err);
                alert('Unable to access camera.');
            });
    });

    liveVideo.addEventListener('click', () => {
        const context = captureCanvas.getContext('2d');
        captureCanvas.width = liveVideo.videoWidth;
        captureCanvas.height = liveVideo.videoHeight;
        context.drawImage(liveVideo, 0, 0);
        const imageData = captureCanvas.toDataURL('image/png');
        console.log('Captured Image:', imageData);
        alert('Image captured successfully!');
    });
}

// Unlock drag-and-drop section after login
document.addEventListener('DOMContentLoaded', () => {
    const uploadContainer = document.getElementById('upload-container');
    const lockIcon = document.querySelector('.lock-icon');

    if (uploadContainer && !uploadContainer.classList.contains('locked')) {
        if (lockIcon) lockIcon.style.display = 'none';
        uploadContainer.style.background = 'linear-gradient(135deg, #a1c4fd, #c2e9fb)';
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
window.onload = function () {
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
};

function handleCredentialResponse(response) {
    const token = response.credential;
    const user = decodeJwtResponse(token);
    console.log("User Info:", user);
}

function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function requestGmailAccess() {
    const client = google.accounts.oauth2.initTokenClient({
        client_id: '915336185518-53u79enr56mul76cr28e59udahmg04rs.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        callback: (tokenResponse) => {
            console.log("Access Token:", tokenResponse.access_token);
            fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
                headers: {
                    'Authorization': `Bearer ${tokenResponse.access_token}`
                }
            })
            .then(res => res.json())
            .then(data => console.log("Gmail Messages:", data))
            .catch(err => console.error("Error accessing Gmail:", err));
        }
    });

    client.requestAccessToken();
}

// Drag and Drop + AJAX Upload
const fileInput = document.getElementById('file');
const fileLabel = document.getElementById('file-label');
const uploadContainer = document.getElementById('upload-container');
const uploadForm = document.getElementById('upload-form');
const resultContainerId = 'prediction-result';

fileInput.addEventListener('change', function () {
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
    uploadContainer.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)';
});

uploadContainer.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadContainer.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)';
    if (event.dataTransfer.files.length > 0) {
        fileInput.files = event.dataTransfer.files;
        fileLabel.textContent = 'File selected: ' + event.dataTransfer.files[0].name;
    }
});