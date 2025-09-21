document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const authStatus = document.getElementById('auth-status');
    const authStatusMobile = document.getElementById('auth-status-mobile');
    const signInLinks = document.querySelectorAll('#sign-in-link');
    const profileLink = document.getElementById('profile-link');
    const profileMobileLink = document.getElementById('profile-mobile-link');
    const adminLink = document.getElementById('admin-link');
    const adminMobileLink = document.getElementById('admin-mobile-link');
    const adminProfileLink = document.getElementById('admin-profile-link');
    const adminProfileMobileLink = document.getElementById('admin-profile-mobile-link');

    // Initialize the page
    initializeRefundPolicyPage();

    function initializeRefundPolicyPage() {
        checkAuthStatus();
        setupEventListeners();
        setupFAQAccordion();
        addScrollAnimations();
        setupProgressIndicator();
        enhanceAccessibility();
        addInteractiveFeatures();
    }

    function checkAuthStatus() {
        const token = getStoredData('authToken');
        const userData = getStoredData('userData');
        if (token && userData) {
            handleLoggedInState();
        } else {
            handleLoggedOutState();
        }
    }

    function handleLoggedInState() {
        signInLinks.forEach(link => {
            link.style.display = 'none';
        });
        const user = getStoredData('userData') ? JSON.parse(getStoredData('userData')) : {};
        const isAdmin = user.role === 'ADMIN';

        // Show profile links for all logged-in users
        if (profileLink) profileLink.classList.remove('hidden');
        if (profileMobileLink) profileMobileLink.classList.remove('hidden');

        // Show admin links only for admin users
        if (isAdmin) {
            if (adminLink) adminLink.classList.remove('hidden');
            if (adminMobileLink) adminMobileLink.classList.remove('hidden');
            if (adminProfileLink) adminProfileLink.classList.remove('hidden');
            if (adminProfileMobileLink) adminProfileMobileLink.classList.remove('hidden');
        }

        const authHTML = `
            <div class="flex items-center space-x-4 bg-blue-600/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-blue-400/30">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white/50">
                        <span class="text-white text-sm font-bold">${(user.name || 'U').charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <div class="text-white font-medium">Welcome back, ${user.name || 'User'}!</div>
                        <div class="text-blue-200 text-sm">Ready for the next match?</div>
                    </div>
                </div>
                <button id="logout-btn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                    Sign Out
                </button>
            </div>
        `;
        if (authStatus) authStatus.innerHTML = authHTML;
        if (authStatusMobile) authStatusMobile.innerHTML = authHTML;

        const logoutButtons = document.querySelectorAll('#logout-btn');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', handleLogout);
        });
    }

    function handleLoggedOutState() {
        signInLinks.forEach(link => {
            link.style.display = 'block';
        });
        if (profileLink) profileLink.classList.add('hidden');
        if (profileMobileLink) profileMobileLink.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
        if (adminMobileLink) adminMobileLink.classList.add('hidden');
        if (adminProfileLink) adminProfileLink.classList.add('hidden');
        if (adminProfileMobileLink) adminProfileMobileLink.classList.add('hidden');

        const authHTML = `
        `;
        if (authStatus) authStatus.innerHTML = authHTML;
        if (authStatusMobile) authStatusMobile.innerHTML = authHTML;
    }

    function setupEventListeners() {
        // Contact buttons
        setupContactButtons();
        // Policy section interactions
        setupPolicyInteractions();
    }

    function handleLogout() {
        removeStoredData('authToken');
        removeStoredData('userData');
        removeStoredData('userProfile');
        handleLoggedOutState();
        window.location.href = 'index.html';
    }

    function setupFAQAccordion() {
        const detailsElements = document.querySelectorAll('details');
        detailsElements.forEach(details => {
            details.addEventListener('toggle', function () {
                if (this.open) {
                    detailsElements.forEach(otherDetails => {
                        if (otherDetails !== this) {
                            otherDetails.open = false;
                        }
                    });
                }
            });
        });
    }

    function setupContactButtons() {
        const contactButtons = document.querySelectorAll('.bg-white.text-blue-600, .bg-blue-700.text-white');
        contactButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                const buttonText = this.textContent.trim();
                trackEvent('contact_button_clicked', { button: buttonText });
            });
        });
    }

    function setupPolicyInteractions() {
        const policySections = document.querySelectorAll('.border-l-4');
        policySections.forEach(section => {
            section.addEventListener('mouseenter', function () {
                this.style.transform = 'translateX(5px)';
            });
            section.addEventListener('mouseleave', function () {
                this.style.transform = 'translateX(0)';
            });
            section.addEventListener('click', function () {
                const sectionType = this.querySelector('h3').textContent;
                trackEvent('policy_section_clicked', { section: sectionType });
            });
        });
    }

    function addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    const children = entry.target.querySelectorAll('.bg-green-50, .bg-yellow-50, .bg-red-50, .bg-blue-50, .bg-purple-50');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);
        const animateElements = document.querySelectorAll('.bg-white.rounded-2xl');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    }

    function setupProgressIndicator() {
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        document.body.appendChild(progressIndicator);
        window.addEventListener('scroll', function () {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.offsetHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressIndicator.style.width = scrollPercent + '%';
        });
    }

    function enhanceAccessibility() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    function addInteractiveFeatures() {
        addTooltips();
        addCopyFunctionality();
        addFAQSearch();
        addPrintFunctionality();
    }

    function addTooltips() {
        const tooltipElements = document.querySelectorAll('.bg-green-50, .bg-yellow-50, .bg-red-50');
        tooltipElements.forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip absolute bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 pointer-events-none transition-opacity duration-300 z-50';
            tooltip.textContent = 'Click for more details';
            element.style.position = 'relative';
            element.appendChild(tooltip);
            element.addEventListener('mouseenter', function () {
                tooltip.style.opacity = '1';
            });
            element.addEventListener('mouseleave', function () {
                tooltip.style.opacity = '0';
            });
        });
    }

    function addCopyFunctionality() {
        const contactInfo = document.querySelectorAll('.text-gray-600');
        contactInfo.forEach(info => {
            if (info.textContent.includes('@') || info.textContent.includes('+')) {
                info.style.cursor = 'pointer';
                info.title = 'Click to copy';
                info.addEventListener('click', function () {
                    const text = this.textContent.trim();
                    navigator.clipboard.writeText(text).then(() => {
                        showToast('Copied to clipboard!', 'success');
                    }).catch(() => {
                        showToast('Failed to copy', 'error');
                    });
                });
            }
        });
    }

    function addFAQSearch() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'mb-6';
        searchContainer.innerHTML = `
            <div class="relative">
                <input type="text" id="faq-search" placeholder="Search FAQ..."
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <i class="fas fa-search absolute right-3 top-3 text-gray-400"></i>
            </div>
        `;
        const faqSection = document.querySelector('.bg-white.rounded-2xl:last-of-type');
        const faqHeader = faqSection ? faqSection.querySelector('h2') : null;
        if (faqHeader) {
            faqHeader.after(searchContainer);
        }
        const searchInput = document.getElementById('faq-search');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                const searchTerm = this.value.toLowerCase();
                const faqItems = document.querySelectorAll('.border.border-gray-200.rounded-lg');
                faqItems.forEach(item => {
                    const question = item.querySelector('.faq-question span').textContent.toLowerCase();
                    const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
                    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                        item.style.display = 'block';
                        item.style.opacity = '1';
                    } else {
                        item.style.opacity = '0.5';
                    }
                });
            });
        }
    }

    function addPrintFunctionality() {
        const printButton = document.createElement('button');
        printButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 z-50';
        printButton.innerHTML = '<i class="fas fa-print"></i>';
        printButton.title = 'Print this page';
        printButton.addEventListener('click', function () {
            window.print();
        });
        document.body.appendChild(printButton);
    }

    function showToast(message, type = 'info') {
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        const toast = document.createElement('div');
        toast.className = `toast fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transform translate-x-full transition-transform duration-300`;
        const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
        toast.className += ` ${bgColor}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(full)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function trackEvent(eventName, eventData = {}) {
        console.log('Event tracked:', eventName, eventData);
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
    }

    function getStoredData(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            return null;
        }
    }

    function setStoredData(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error setting localStorage:', error);
        }
    }

    function removeStoredData(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    function optimizePerformance() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }

    function handleErrors() {
        window.addEventListener('error', function (e) {
            console.error('JavaScript error:', e.error);
            trackEvent('javascript_error', {
                message: e.error.message,
                filename: e.filename,
                lineno: e.lineno
            });
        });
        window.addEventListener('unhandledrejection', function (e) {
            console.error('Unhandled promise rejection:', e.reason);
            trackEvent('unhandled_promise_rejection', {
                reason: e.reason
            });
        });
    }

    function addEasterEggs() {
        let konamiCode = [];
        const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
        document.addEventListener('keydown', function (e) {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }
            if (konamiCode.join(',') === konamiSequence.join(',')) {
                showToast('🎉 You found the secret! Refund policy unlocked! 🎉', 'success');
                konamiCode = [];
                document.body.style.animation = 'rainbow 2s ease';
                setTimeout(() => {
                    document.body.style.animation = '';
                }, 2000);
            }
        });
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('faq-search');
            if (searchInput) {
                searchInput.focus();
            }
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('details').forEach(details => {
                details.open = false;
            });
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    optimizePerformance();
    handleErrors();
    addEasterEggs();
});