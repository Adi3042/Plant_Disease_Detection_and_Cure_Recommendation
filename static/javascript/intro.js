// intro.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    initParticles();
    
    // Reset overlay content visibility on every page load
    resetOverlayContent();
    
    // Check if user has seen intro before (using sessionStorage)
    if (!sessionStorage.getItem('introShown') && !isUserLoggedIn()) {
        showIntroOverlay();
    } else {
        // Ensure overlay is completely hidden if not needed
        const overlay = document.getElementById('intro-overlay');
        overlay.style.display = 'none';
        overlay.classList.remove('overlay-active', 'overlay-closing');
    }
    
    // Initialize button event listeners
    initIntroButtons();
});

function initParticles() {
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
}

function initIntroButtons() {
    // Button event listeners
    document.getElementById('login-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        closeIntroOverlay();
        window.location.href = '/login';
    });
    
    document.getElementById('register-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        closeIntroOverlay();
        window.location.href = '/login#register';
    });
}

function resetOverlayContent() {
    const panelContent = document.querySelectorAll('.panel-content');
    panelContent.forEach(content => {
        // Reset to visible state
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
        content.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
        content.style.visibility = 'visible';
    });
}

function isUserLoggedIn() {
    // Check for logged-in state in multiple ways
    return document.body.classList.contains('logged-in') || 
           document.cookie.includes('sessionid') || 
           localStorage.getItem('isLoggedIn') === 'true';
}

function showIntroOverlay() {
    const overlay = document.getElementById('intro-overlay');
    overlay.style.display = 'flex';
    
    // First hide content to prepare for animation
    const panelContent = document.querySelectorAll('.panel-content');
    panelContent.forEach(content => {
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
    });
    
    setTimeout(() => {
        overlay.classList.add('overlay-active');
        
        // Animate the panel content in
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
        // Reset content for next time
        resetOverlayContent();
    }, 1000);
}