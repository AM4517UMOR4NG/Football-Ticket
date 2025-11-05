// API Configuration
const apiConfig = {
    baseUrl: 'http://localhost:8080/api',
};

// DOM Elements
const registerForm = document.getElementById('registerForm');
const registerBtn = document.getElementById('registerBtn');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const passwordStrength = document.getElementById('passwordStrength');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const strengthLevel = document.getElementById('strengthLevel');
const agreeTerms = document.getElementById('agreeTerms');
const termsModal = document.getElementById('termsModal');
const closeModal = document.getElementById('closeModal');
const acceptTerms = document.getElementById('acceptTerms');
const declineTerms = document.getElementById('declineTerms');
const modalBackdrop = document.getElementById('modalBackdrop');
const termsLink = document.querySelector('.terms-link');
const alertDiv = document.getElementById('alert');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializePasswordToggle();
    initializePasswordStrength();
    initializeTermsModal();
    initializeForm();
    initializeEnterKeyNotification();
});

// Toggle Password Visibility
function initializePasswordToggle() {
    if (togglePasswordBtn && passwordInput && eyeIcon) {
        togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                // Add opacity or stroke-dasharray to indicate hidden
                eyeIcon.style.opacity = '0.7';
                togglePasswordBtn.setAttribute('aria-label', 'Hide password');
            } else {
                passwordInput.type = 'password';
                eyeIcon.style.opacity = '1';
                togglePasswordBtn.setAttribute('aria-label', 'Show password');
            }
        });
    }
}

// Password Strength Indicator
function initializePasswordStrength() {
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            if (password.length > 0) {
                passwordStrength.classList.remove('hidden');
                updatePasswordStrength(password);
            } else {
                passwordStrength.classList.add('hidden');
            }
        });
    }
}

function updatePasswordStrength(password) {
    let strength = 0;
    let level = 'Weak';
    let levelClass = 'weak';

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Determine strength level
    if (strength >= 5) {
        level = 'Strong';
        levelClass = 'strong';
    } else if (strength >= 3) {
        level = 'Medium';
        levelClass = 'medium';
    }

    // Update UI
    strengthBar.className = `strength-bar-fill ${levelClass}`;
    strengthLevel.textContent = level;
    strengthLevel.className = levelClass;
}

// Terms Modal
function initializeTermsModal() {
    // Open modal when clicking terms link
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            openTermsModal();
        });
    }

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', closeTermsModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeTermsModal);
    }

    // Accept terms
    if (acceptTerms) {
        acceptTerms.addEventListener('click', () => {
            agreeTerms.checked = true;
            closeTermsModal();
            showAlert('Terms & Conditions accepted', 'success');
        });
    }

    // Decline terms
    if (declineTerms) {
        declineTerms.addEventListener('click', () => {
            agreeTerms.checked = false;
            closeTermsModal();
        });
    }

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !termsModal.classList.contains('hidden')) {
            closeTermsModal();
        }
    });
}

function openTermsModal() {
    if (termsModal) {
        termsModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeTermsModal() {
    if (termsModal) {
        termsModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Form Submission
function initializeForm() {
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate terms
            if (!agreeTerms.checked) {
                showAlert('Please agree to the Terms & Conditions', 'error');
                return;
            }

            // Get form values
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const fullName = document.getElementById('fullName').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const password = passwordInput.value;

            // Validate inputs
            if (!username || !email || !fullName || !password) {
                showAlert('Please fill in all required fields', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }

            // Password validation
            if (password.length < 8) {
                showAlert('Password must be at least 8 characters long', 'error');
                return;
            }

            // Disable button and show loading
            registerBtn.disabled = true;
            showLoading(true);

            try {
                const response = await axios.post(`${apiConfig.baseUrl}/auth/register`, {
                    username,
                    email,
                    fullName,
                    phoneNumber: phoneNumber || null,
                    password
                });

                showAlert('Registration successful! Redirecting to login...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);

            } catch (error) {
                const errorMessage = error?.response?.data?.message || 
                                   error?.message || 
                                   'Registration failed. Please try again.';
                showAlert(errorMessage, 'error');
            } finally {
                registerBtn.disabled = false;
                showLoading(false);
            }
        });
    }
}

// Enter-key notification and optional auto-submit on password field
function initializeEnterKeyNotification() {
    if (!registerForm) return;

    const inputs = registerForm.querySelectorAll('input');
    inputs.forEach((input) => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                showFancyInfo('Checking your details...');

                // If user presses Enter on password and fields look filled, submit
                const onPassword = input.id === 'password';
                const username = document.getElementById('username')?.value?.trim();
                const email = document.getElementById('email')?.value?.trim();
                const fullName = document.getElementById('fullName')?.value?.trim();
                const pwd = passwordInput?.value || '';
                const ok = username && email && fullName && pwd.length >= 1;
                if (onPassword && ok) {
                    // slight delay for UX
                    setTimeout(() => registerForm.dispatchEvent(new Event('submit')), 300);
                }
            }
        });
    });
}

// Alert System
function showAlert(message, type = 'error') {
    if (!alertDiv) return;

    alertDiv.textContent = message;
    alertDiv.className = `alert ${type}`;
    alertDiv.classList.remove('hidden');

    // Auto hide after 5 seconds
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    if (alertDiv) {
        alertDiv.classList.add('hidden');
    }
}

// Loading Overlay
function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
}

// Fancy info toast used on Enter key
function showFancyInfo(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        color: #fff;
        padding: 14px 18px;
        border-radius: 12px;
        box-shadow: 0 10px 24px rgba(0,0,0,.15);
        z-index: 10000;
        font-weight: 600;
        letter-spacing: .2px;
        animation: fadeSlideIn .25s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeSlideOut .25s ease-in';
        setTimeout(() => toast.remove(), 220);
    }, 1600);

    // keyframes once
    if (!document.querySelector('style[data-register-animations]')) {
        const style = document.createElement('style');
        style.setAttribute('data-register-animations', 'true');
        style.textContent = `
            @keyframes fadeSlideIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
            @keyframes fadeSlideOut { from { opacity:1; transform: translateY(0); } to { opacity:0; transform: translateY(-6px); } }
        `;
        document.head.appendChild(style);
    }
}
