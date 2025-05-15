// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 20 + 10;
        particle.style.animationDuration = `${duration}s`;
        
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    const header = document.getElementById('mainHeader');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    let lastScroll = 0;
    
    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
    
    // Hide header on scroll down, show on scroll up
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('hide', 'scrolled');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('hide')) {
            header.classList.add('hide');
        } else if (currentScroll < lastScroll && header.classList.contains('hide')) {
            header.classList.remove('hide');
        }
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Loader functionality
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        loader.classList.add('hide');
        
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    });
    
    // Page click loader for navigation
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href.startsWith("#") && !href.startsWith("mailto:")) {
                document.getElementById("loader").style.display = "flex";
                document.getElementById("loader").classList.remove("hide");
            }
        });
    });
});