// FAQ Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Auth logic for Sign In/Out button
    handleAuthUI();
    // Initialize FAQ functionality
    initializeFAQ();

    // Initialize search functionality
    initializeSearch();

    // Initialize contact buttons
    initializeContactButtons();
});

function handleAuthUI() {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const token = getStoredData('authToken');
    const userData = getStoredData('userData');
    if (token && userData) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.classList.remove('hidden');
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutLink) logoutLink.classList.add('hidden');
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

// FAQ Toggle Functionality
function toggleFAQ(button) {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const icon = button.querySelector('i');

    // Toggle active state
    button.classList.toggle('active');

    // Toggle answer visibility
    if (answer.classList.contains('hidden')) {
        answer.classList.remove('hidden');
        answer.classList.add('show');

        // Animate the answer
        setTimeout(() => {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }, 10);
    } else {
        answer.style.maxHeight = '0px';
        setTimeout(() => {
            answer.classList.add('hidden');
            answer.classList.remove('show');
        }, 300);
    }
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('faq-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question span').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                item.style.opacity = '1';
            } else {
                item.style.opacity = '0.3';
                // Hide completely if search term is long enough
                if (searchTerm.length > 2) {
                    item.style.display = 'none';
                }
            }
        });

        // Show/hide categories based on visible items
        updateCategoryVisibility();
    });
}

// Update category visibility based on search results
function updateCategoryVisibility() {
    const categories = document.querySelectorAll('.faq-category');

    categories.forEach(category => {
        const visibleItems = category.querySelectorAll('.faq-item[style*="display: block"], .faq-item:not([style*="display: none"])');
        const hasVisibleItems = Array.from(visibleItems).some(item =>
            item.style.opacity !== '0.3' && item.style.display !== 'none'
        );

        if (hasVisibleItems) {
            category.style.display = 'block';
        } else {
            category.style.display = 'none';
        }
    });
}

// Contact Button Functionality
function initializeContactButtons() {
    // Live Chat Button
    const liveChatBtn = document.querySelector('button:contains("Start Chat")');
    if (liveChatBtn) {
        liveChatBtn.addEventListener('click', function () {
            showNotification('Live chat feature coming soon!', 'info');
        });
    }

    // Email Support Button
    const emailBtn = document.querySelector('a[href^="mailto:"]');
    if (emailBtn) {
        emailBtn.addEventListener('click', function (e) {
            // Track email clicks
            trackEvent('faq_email_support_click');
        });
    }

    // Phone Support Button
    const phoneBtn = document.querySelector('a[href^="tel:"]');
    if (phoneBtn) {
        phoneBtn.addEventListener('click', function (e) {
            // Track phone clicks
            trackEvent('faq_phone_support_click');
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;

    // Set background color based on type
    switch (type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            break;
        case 'warning':
            notification.className += ' bg-yellow-500 text-white';
            break;
        default:
            notification.className += ' bg-blue-500 text-white';
    }

    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Track events for analytics
function trackEvent(eventName, data = {}) {
    // In a real application, this would send data to analytics service
    console.log('Event tracked:', eventName, data);

    // Example: Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, data);
    }

    // Example: Custom analytics
    if (window.analytics) {
        window.analytics.track(eventName, data);
    }
}

// Initialize FAQ with keyboard navigation
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item, index) => {
        const button = item.querySelector('.faq-question');

        // Add keyboard navigation
        button.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(this);
            }
        });

        // Add ARIA attributes for accessibility
        const answer = item.querySelector('.faq-answer');
        const questionId = `faq-question-${index}`;
        const answerId = `faq-answer-${index}`;

        button.id = questionId;
        answer.id = answerId;

        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', answerId);
        answer.setAttribute('aria-labelledby', questionId);
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Export functions for global access
window.FAQ = {
    toggleFAQ,
    scrollToSection,
    showNotification,
    trackEvent
};

// Add keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('faq-search');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('faq-search');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    }
});

// Performance optimization: Debounce search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to search
const debouncedSearch = debounce(function (searchTerm) {
    // Search logic here
    console.log('Searching for:', searchTerm);
}, 300);

// Add search input event listener with debouncing
const searchInput = document.getElementById('faq-search');
if (searchInput) {
    searchInput.addEventListener('input', function () {
        debouncedSearch(this.value);
    });
} 