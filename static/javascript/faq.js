// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size between 5px and 15px
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation duration between 10s and 30s
        const duration = Math.random() * 20 + 10;
        particle.style.animationDuration = `${duration}s`;
        
        // Random delay
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    const faqQuestions = document.querySelectorAll('.faq-question');
    const header = document.getElementById('mainHeader');
    let lastScroll = 0;
    
    // FAQ Toggle Functionality
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isOpen = question.classList.contains('active');
            
            // Toggle current FAQ
            question.classList.toggle('active');
            answer.classList.toggle('show');
            
            // Smooth scroll to the question
            question.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        
        // Keyboard accessibility
        question.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                question.click();
            }
        });
    });

    // Search Functionality
    const faqSearch = document.getElementById('faqSearch');
    if (faqSearch) {
        faqSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            document.querySelectorAll('.faq-item').forEach(item => {
                const question = item.querySelector('.faq-question').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                const matches = question.includes(searchTerm) || answer.includes(searchTerm);
                
                item.style.display = matches ? '' : 'none';
                
                // Show/hide category headers based on visible items
                const category = item.closest('.faq-category');
                if (category) {
                    const visibleItems = category.querySelectorAll('.faq-item:not([style*="none"])').length;
                    category.style.display = visibleItems > 0 ? '' : 'none';
                }
            });
        });
    }

    // Hide header on scroll down, show on scroll up
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('hide', 'scrolled');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('hide')) {
            // Scrolling down
            header.classList.add('hide');
        } else if (currentScroll < lastScroll && header.classList.contains('hide')) {
            // Scrolling up
            header.classList.remove('hide');
        }
        
        // Add smaller header style when scrolled
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