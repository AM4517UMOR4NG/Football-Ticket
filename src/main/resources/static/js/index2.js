// Mobile menu functionality
function initMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-toggle');

    if (mobileMenu && mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        });
    }
}

// Carousel functionality
function initCarousel() {
    const carousel = document.querySelector('.carousel-inner');
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    s
    // Check if all required elements exist
    if (!carousel || items.length === 0) {
        console.warn('Carousel elements not found');
        return;
    }

    let currentIndex = 0;
    const totalItems = items.length;
    let autoplayInterval;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update indicators if they exist
        if (indicators.length > 0) {
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
                indicator.setAttribute('aria-selected', index === currentIndex);
            });
        }
    }

    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        }, 5000);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    // Navigation button event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            updateCarousel();
            startAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
            startAutoplay();
        });
    }

    // Indicator event listeners
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoplay();
            currentIndex = index;
            updateCarousel();
            startAutoplay();
        });
    });

    // Pause autoplay on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Initialize carousel
    updateCarousel();
    startAutoplay();
}

// Login/Logout functionality
function initAuthSystem() {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const logoutMobileLink = document.getElementById('logout-mobile-link');

    // Elements to show/hide on login/logout
    const authElements = {
        toShowOnLogin: [
            'logout-link',
            'profile-link',
            'admin-link',
            'admin-profile-link',
            'logout-mobile-link',
            'profile-mobile-link',
            'admin-mobile-link',
            'admin-profile-mobile-link'
        ],
        toHideOnLogin: ['login-link']
    };

    function handleLogin() {
        authElements.toShowOnLogin.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('hidden');
            }
        });

        authElements.toHideOnLogin.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    function handleLogout() {
        authElements.toShowOnLogin.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            }
        });

        authElements.toHideOnLogin.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('hidden');
            }
        });
    }

    // Add event listeners
    if (loginLink) {
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Add logout event listeners to both desktop and mobile logout links
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });
    }

    if (logoutMobileLink) {
        logoutMobileLink.addEventListener('click', function (e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initCarousel();
    initAuthSystem();
});