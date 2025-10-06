// Enhanced contactus.js for FootballTix - Contact Page with Visual Improvements
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const contactForm = document.getElementById('contact-form');
    const authStatus = document.getElementById('auth-status');
    const signInLink = document.getElementById('sign-in-link');
    const logoutBtn = document.getElementById('logout-btn');
    const navSignInBtn = document.querySelector('.nav-sign-in'); // Added for navbar sign-in button

    // Initialize the page with enhanced animations
    initializeContactPage();

    function initializeContactPage() {
        checkAuthStatus();
        setupEventListeners();
        enhanceFormInteractions();
        addAdvancedAnimations();
        setupFormValidation();
        initializeVisualEffects();
        addLoadingTransitions();
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
        // Show auth status with smooth animation
        if (authStatus) {
            authStatus.classList.remove('hidden');
            authStatus.style.opacity = '0';
            authStatus.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                authStatus.style.transition = 'all 0.5s ease';
                authStatus.style.opacity = '1';
                authStatus.style.transform = 'translateY(0)';
            }, 100);
        }

        // Hide sign-in links with fade out animation
        hideSignInElements();

        const userData = JSON.parse(getStoredData('userData'));
        if (userData && userData.role === 'ADMIN') {
            addAdminFeatures();
            console.log('Admin user logged in');
        }

        // Add welcome animation
        showWelcomeMessage(userData);
    }

    function handleLoggedOutState() {
        // Hide auth status with smooth animation
        if (authStatus) {
            authStatus.style.transition = 'all 0.5s ease';
            authStatus.style.opacity = '0';
            authStatus.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                authStatus.classList.add('hidden');
            }, 500);
        }

        // Show sign-in links with fade in animation
        showSignInElements();
    }

    function hideSignInElements() {
        const elementsToHide = [signInLink, navSignInBtn];
        elementsToHide.forEach(element => {
            if (element) {
                element.style.transition = 'all 0.4s ease';
                element.style.opacity = '0';
                element.style.transform = 'scale(0.9)';
                element.classList.add('hidden');
                setTimeout(() => {
                    element.classList.add('hidden');
                }, 400);
            }
        });
    }

    function showSignInElements() {
        const elementsToShow = [signInLink, navSignInBtn];
        elementsToShow.forEach((element, index) => {
            if (element) {
                element.classList.remove('hidden');
                element.style.opacity = '0';
                element.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    element.style.transition = 'all 0.4s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                }, index * 100);
            }
        });
    }

    function showWelcomeMessage(userData) {
        if (userData && userData.name) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            welcomeDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-user-circle mr-2"></i>
                    <span>Welcome back, ${userData.name}!</span>
                </div>
            `;

            document.body.appendChild(welcomeDiv);

            // Animate in
            welcomeDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                welcomeDiv.style.transition = 'transform 0.5s ease';
                welcomeDiv.style.transform = 'translateX(0)';
            }, 100);

            // Auto remove after 4 seconds
            setTimeout(() => {
                welcomeDiv.style.transform = 'translateX(100%)';
                setTimeout(() => welcomeDiv.remove(), 500);
            }, 4000);
        }
    }

    function addAdminFeatures() {
        // Add admin badge to contact form
        const adminBadge = document.createElement('div');
        adminBadge.className = 'admin-badge bg-purple-100 border border-purple-300 rounded-lg p-3 mb-6';
        adminBadge.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-crown text-purple-600 mr-2"></i>
                <span class="text-purple-800 font-medium">Admin Access - Priority Support</span>
            </div>
        `;

        if (contactForm) {
            contactForm.insertBefore(adminBadge, contactForm.firstChild);

            // Add entrance animation
            adminBadge.style.opacity = '0';
            adminBadge.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                adminBadge.style.transition = 'all 0.6s ease';
                adminBadge.style.opacity = '1';
                adminBadge.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    function setupEventListeners() {
        // Form submission with enhanced UX
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmission);
        }

        // Logout button with confirmation
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogoutWithConfirmation);
        }

        // Enhanced form field interactions
        setupAdvancedFormFieldInteractions();

        // Social media links with hover effects
        setupEnhancedSocialMediaLinks();

        // Quick help links with animations
        setupAnimatedQuickHelpLinks();

        // Add scroll-based effects
        setupScrollEffects();
    }

    function handleFormSubmission(event) {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        // Enhanced loading state with progress animation
        submitButton.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="loading-spinner mr-2"></div>
                <span>Sending Message...</span>
            </div>
        `;
        submitButton.disabled = true;
        submitButton.classList.add('loading');

        // Add form loading overlay
        showFormLoadingOverlay();

        // Simulate form submission with progress updates
        simulateFormSubmission(formData, submitButton, originalText);
    }

    function simulateFormSubmission(formData, submitButton, originalText) {
        const steps = [
            { message: 'Validating data...', delay: 500 },
            { message: 'Connecting to server...', delay: 800 },
            { message: 'Sending message...', delay: 1000 },
            { message: 'Processing...', delay: 500 }
        ];

        let currentStep = 0;

        function nextStep() {
            if (currentStep < steps.length) {
                updateLoadingMessage(steps[currentStep].message);
                setTimeout(() => {
                    currentStep++;
                    nextStep();
                }, steps[currentStep - 1]?.delay || 500);
            } else {
                // Complete submission
                completeFormSubmission(formData, submitButton, originalText);
            }
        }

        nextStep();
    }

    function completeFormSubmission(formData, submitButton, originalText) {
        // Hide loading overlay
        hideFormLoadingOverlay();

        // Success animation
        showEnhancedMessage('🎉 Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
        contactForm.reset();

        // Reset button with success animation
        submitButton.innerHTML = '<i class="fas fa-check mr-2"></i>Sent Successfully!';
        submitButton.classList.remove('loading');
        submitButton.classList.add('success');

        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.classList.remove('success');
        }, 2000);

        // Add confetti effect
        createConfettiEffect();

        // Track form submission
        trackEvent('contact_form_submitted', {
            subject: formData.get('subject'),
            hasNewsletter: formData.get('newsletter') ? 'yes' : 'no'
        });
    }

    function handleLogoutWithConfirmation() {
        // Create custom confirmation modal
        const modal = document.createElement('div');
        modal.className = 'logout-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 mx-4 max-w-md w-full transform scale-0 transition-transform duration-300">
                <div class="text-center">
                    <i class="fas fa-sign-out-alt text-4xl text-red-500 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2">Confirm Logout</h3>
                    <p class="text-gray-600 mb-6">Are you sure you want to sign out?</p>
                    <div class="flex space-x-4">
                        <button class="cancel-btn flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button class="confirm-btn flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate modal in
        setTimeout(() => {
            modal.querySelector('.bg-white').style.transform = 'scale(1)';
        }, 100);

        // Handle modal buttons
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });

        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            modal.remove();
            handleLogout();
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    function handleLogout() {
        // Clear stored data
        removeStoredData('authToken');
        removeStoredData('userData');
        removeStoredData('userProfile');

        // Show logout animation
        const logoutMessage = document.createElement('div');
        logoutMessage.className = 'logout-animation fixed inset-0 bg-blue-600 flex items-center justify-center z-50';
        logoutMessage.innerHTML = `
            <div class="text-center text-white">
                <i class="fas fa-wave-square text-6xl mb-4 animate-bounce"></i>
                <h2 class="text-2xl font-bold mb-2">See you soon!</h2>
                <p class="text-blue-200">Redirecting to home page...</p>
            </div>
        `;

        document.body.appendChild(logoutMessage);

        // Update UI state
        setTimeout(() => {
            handleLoggedOutState();

            // Redirect after animation
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }, 1500);
    }

    function setupAdvancedFormFieldInteractions() {
        const formFields = contactForm?.querySelectorAll('input, select, textarea');

        formFields?.forEach(field => {
            // Add floating label effect
            field.addEventListener('focus', function () {
                this.parentElement.classList.add('focused', 'field-focus-glow');
                addFieldParticles(this);
            });

            field.addEventListener('blur', function () {
                this.parentElement.classList.remove('focused', 'field-focus-glow');
                validateField(this);
            });

            // Add typing animation
            field.addEventListener('input', function () {
                validateField(this);
                addTypingEffect(this);
            });
        });
    }

    function addFieldParticles(field) {
        // Create subtle particle effect on focus
        const particles = document.createElement('div');
        particles.className = 'field-particles absolute inset-0 pointer-events-none';
        particles.innerHTML = Array.from({ length: 5 }, () => '<div class="particle"></div>').join('');

        field.parentElement.style.position = 'relative';
        field.parentElement.appendChild(particles);

        setTimeout(() => particles.remove(), 1000);
    }

    function addTypingEffect(field) {
        field.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
        clearTimeout(field.typingTimeout);
        field.typingTimeout = setTimeout(() => {
            field.style.boxShadow = '';
        }, 500);
    }

    // ... (continuing with enhanced validation, animations, and effects)

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling with animation
        field.classList.remove('error');
        removeFieldError(field);

        // Enhanced validation rules
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = '✋ Name must be at least 2 characters long';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = '📧 Please enter a valid email address';
                }
                break;

            case 'phone':
                if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = '📱 Please enter a valid phone number';
                }
                break;

            case 'subject':
                if (!value) {
                    isValid = false;
                    errorMessage = '📝 Please select a subject';
                }
                break;

            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = '✍️ Message must be at least 10 characters long';
                }
                break;
        }

        // Apply validation result with enhanced animations
        if (!isValid) {
            field.classList.add('error', 'shake-animation');
            showEnhancedFieldError(field, errorMessage);
            setTimeout(() => field.classList.remove('shake-animation'), 500);
        } else if (value) {
            field.classList.add('valid', 'success-glow');
            setTimeout(() => field.classList.remove('success-glow'), 1000);
        }

        return isValid;
    }

    function showEnhancedFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-600 text-sm mt-1 flex items-center animate-slide-in';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;
        errorDiv.id = `${field.id}-error`;

        field.parentElement.appendChild(errorDiv);
    }

    function removeFieldError(field) {
        const existingError = document.getElementById(`${field.id}-error`);
        if (existingError) {
            existingError.classList.add('animate-fade-out');
            setTimeout(() => existingError.remove(), 300);
        }
    }

    function showEnhancedMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.enhanced-message');
        existingMessages.forEach(msg => msg.remove());

        // Create enhanced message with icon and animation
        const messageDiv = document.createElement('div');
        messageDiv.className = `enhanced-message fixed top-20 right-4 max-w-md z-50 transform translate-x-full transition-transform duration-500`;

        const bgColor = {
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'warning': 'bg-yellow-500',
            'info': 'bg-blue-500'
        }[type];

        messageDiv.innerHTML = `
            <div class="${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl">
                <div class="flex items-center">
                    <i class="fas fa-${getMessageIcon(type)} mr-3 text-lg"></i>
                    <span class="font-medium">${message}</span>
                </div>
            </div>
        `;

        document.body.appendChild(messageDiv);

        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remove with animation
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => messageDiv.remove(), 500);
        }, 5000);
    }

    function createConfettiEffect() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container fixed inset-0 pointer-events-none z-40';

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece absolute w-2 h-2';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animation = 'confetti-fall 3s linear forwards';
            confettiContainer.appendChild(confetti);
        }

        document.body.appendChild(confettiContainer);

        setTimeout(() => confettiContainer.remove(), 3000);
    }

    function initializeVisualEffects() {
        // Add enhanced CSS animations
        const advancedStyles = document.createElement('style');
        advancedStyles.textContent = `
            .loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
            }
            
            .field-focus-glow {
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
                transform: scale(1.02);
                transition: all 0.3s ease;
            }
            
            .shake-animation {
                animation: shake 0.5s ease-in-out;
            }
            
            .success-glow {
                box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
                border-color: #22c55e !important;
            }
            
            .animate-slide-in {
                animation: slideInFromLeft 0.4s ease;
            }
            
            .animate-fade-out {
                animation: fadeOut 0.3s ease;
            }
            
            .confetti-piece {
                animation: confetti-fall 3s linear forwards;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes slideInFromLeft {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes confetti-fall {
                0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
            
            .particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: #3b82f6;
                border-radius: 50%;
                animation: particle-float 1s ease-out forwards;
                opacity: 0;
            }
            
            @keyframes particle-float {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-20px) scale(0);
                }
            }
        `;
        document.head.appendChild(advancedStyles);
    }

    function showFormLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'form-loading-overlay absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-2xl';
        overlay.id = 'form-loading-overlay';

        overlay.innerHTML = `
            <div class="text-center">
                <div class="loading-spinner mx-auto mb-4 w-8 h-8 border-4 border-blue-200 border-t-blue-600"></div>
                <p class="loading-message text-gray-600 font-medium">Preparing your message...</p>
            </div>
        `;

        contactForm.parentElement.style.position = 'relative';
        contactForm.parentElement.appendChild(overlay);
    }

    function updateLoadingMessage(message) {
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.style.opacity = '0';
            setTimeout(() => {
                loadingMessage.textContent = message;
                loadingMessage.style.opacity = '1';
            }, 200);
        }
    }

    function hideFormLoadingOverlay() {
        const overlay = document.getElementById('form-loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // ... (include all other existing functions with enhancements)

    function getMessageIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    function trackEvent(eventName, eventData = {}) {
        console.log('Event tracked:', eventName, eventData);
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
    }

    // Utility functions (keeping existing localStorage functions)
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

    // Enhanced Easter Eggs
    function addEasterEggs() {
        let clickCount = 0;
        const logo = document.querySelector('.flex-shrink-0 svg, .logo');

        if (logo) {
            logo.addEventListener('click', function () {
                clickCount++;

                // Add click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);

                if (clickCount === 5) {
                    // Enhanced easter egg with animation
                    showEnhancedMessage('⚽ GOOOOOAL! You discovered the secret FootballTix easter egg! ⚽', 'success');
                    clickCount = 0;

                    // Epic celebration animation
                    this.style.transition = 'transform 1s ease';
                    this.style.transform = 'rotate(720deg) scale(1.2)';

                    // Add celebration particles
                    createConfettiEffect();

                    setTimeout(() => {
                        this.style.transform = 'rotate(0deg) scale(1)';
                    }, 1000);
                }
            });
        }
    }

    // Initialize all enhancements
    addEasterEggs();
});