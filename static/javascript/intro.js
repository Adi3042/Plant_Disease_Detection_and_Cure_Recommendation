// intro.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has seen intro before (using sessionStorage)
    if (!sessionStorage.getItem('introShown') && !isUserLoggedIn()) {
        showIntroOverlay();
    }
    
    // Initialize particles.js
    if (document.getElementById('particles-left')) {
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
        
        particlesJS('particles-right', {
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
    
    // Button event listeners
    document.getElementById('login-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        closeIntroOverlay();
        window.location.href = '/login';
    });
    
    document.getElementById('register-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        closeIntroOverlay();
        window.location.href = '/login#register'; // Using hash to indicate signup
    });

    // Add animation to the overlay content
    const panelContent = document.querySelectorAll('.panel-content');
    panelContent.forEach(content => {
        content.style.transform = 'translateY(20px)';
        content.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
    });
});

function isUserLoggedIn() {
    // This should be updated to check actual login status
    return document.body.classList.contains('logged-in') || false;
}

function showIntroOverlay() {
    const overlay = document.getElementById('intro-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('overlay-active');
        
        // Animate the panel content
        const panelContent = document.querySelectorAll('.panel-content');
        panelContent.forEach(content => {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        });
    }, 50);
    sessionStorage.setItem('introShown', 'true');
}

function closeIntroOverlay() {
    const overlay = document.getElementById('intro-overlay');
    overlay.classList.add('overlay-closing');
    
    // Animate out the panel content first
    const panelContent = document.querySelectorAll('.panel-content');
    panelContent.forEach(content => {
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
    });
    
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('overlay-active', 'overlay-closing');
    }, 1000);
}