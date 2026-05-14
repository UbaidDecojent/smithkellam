document.addEventListener('DOMContentLoaded', () => {
    // Set current year dynamically
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // ==========================================
    // Premium Smooth Scroll Reveal Script
    // ==========================================
    
    // Injecting CSS dynamically so the script is fully self-contained and reusable
    const style = document.createElement('style');
    style.textContent = `
        /* Base Reveal State - Hidden */
        .reveal, .hero-reveal {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), 
                        transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
        }

        /* Revealed State - Visible */
        .reveal.is-revealed, .hero-reveal.is-revealed {
            opacity: 1 !important;
            transform: translate(0, 0) scale(1) !important;
        }
    `;
    document.head.appendChild(style);

    // Configuration for the Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -15% 0px', // Triggers when element is 15% into the viewport
        threshold: 0
    };

    // Create the observer
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Allow custom stagger/delays using data-delay="100" attribute
                const delay = element.getAttribute('data-delay');
                if (delay) {
                    element.style.transitionDelay = `${delay}ms`;
                }

                // Add the class that triggers the CSS transition
                element.classList.add('is-revealed');
                
                // Stop observing once revealed to only animate once
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Find all elements with the 'reveal' class and observe them
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================
    // Hero Reveal on Page Load
    // ==========================================
    const heroRevealElements = document.querySelectorAll('.hero-reveal');
    if (heroRevealElements.length > 0) {
        // Use a short timeout to ensure the initial hidden state is rendered before revealing
        setTimeout(() => {
            heroRevealElements.forEach(el => {
                // Allow custom stagger/delays using data-delay="100" attribute
                const delay = el.getAttribute('data-delay');
                if (delay) {
                    el.style.transitionDelay = `${delay}ms`;
                }
                el.classList.add('is-revealed');
            });
        }, 100);
    }

    // ==========================================
    // Full-Page Slide Scroll Transitions
    // ==========================================
    const slides = Array.from(document.querySelectorAll('.site-header, .goodhavenbooks, .nandua, .urbanbuzz, .site-footer')).filter(el => el !== null);
    let currentSlideIndex = 0;
    let isScrolling = false;
    let scrollTimeout;
    let lastWheelTime = 0;

    // Set initial slide index based on current scroll position (useful if user refreshes page while scrolled)
    window.addEventListener('load', () => {
        let minDiff = Infinity;
        slides.forEach((slide, index) => {
            const diff = Math.abs(window.scrollY - slide.offsetTop);
            if (diff < minDiff) {
                minDiff = diff;
                currentSlideIndex = index;
            }
        });
    });

    function goToSlide(direction) {
        if (direction === 0) return;
        if (isScrolling) return;

        let nextIdx = currentSlideIndex + direction;
        
        // Clamp next index
        if (nextIdx >= 0 && nextIdx < slides.length) {
            isScrolling = true;
            currentSlideIndex = nextIdx;
            
            window.scrollTo({
                top: slides[nextIdx].offsetTop,
                behavior: 'smooth'
            });

            clearTimeout(scrollTimeout);
            // 700ms is snappy and prevents rapid fire, without feeling sluggish
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 700); 
        }
    }

    // Mouse wheel support
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY !== 0) {
            const direction = e.deltaY > 0 ? 1 : -1;
            goToSlide(direction);
        }
    }, { passive: false });

    // Touch swipe support for mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent native scrolling
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > 50) { // Threshold for swipe
            goToSlide(diff > 0 ? 1 : -1);
        }
    }, { passive: false });

    // Keyboard support (Arrow keys, Space, PageUp/PageDown)
    window.addEventListener('keydown', (e) => {
        const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '];
        if (keys.includes(e.key)) {
            e.preventDefault();
            const direction = (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') ? 1 : -1;
            goToSlide(direction, true); // Keyboard is discrete
        }
    }, { passive: false });

    // Back to Top button support
    const backToTopBtns = document.querySelectorAll('.back-to-top-btn');
    backToTopBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (slides.length > 0) {
                isScrolling = true;
                currentSlideIndex = 0;
                window.scrollTo({
                    top: slides[0].offsetTop,
                    behavior: 'smooth'
                });
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        });
    });

    // Handle internal navigation links to ensure coordinate with scroll logic
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault(); // Prevent native instant jump
                
                // Find index of target
                const targetIndex = slides.indexOf(targetEl);
                if (targetIndex !== -1) {
                    currentSlideIndex = targetIndex;
                }

                isScrolling = true;
                window.scrollTo({
                    top: targetEl.offsetTop,
                    behavior: 'smooth'
                });
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isScrolling = false;
                }, 1000);
                
                // Update URL manually
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
});
