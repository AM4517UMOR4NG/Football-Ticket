// Configuration
const apiConfig = {
    baseUrl: 'http://localhost:8080/api',
    fallbackUrl: 'http://localhost:8080/api'
};

const redirectOptions = {
    primary: 'index.html',
    fallback: 'index.html'
};

// DOM Elements
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const loginSpinner = document.getElementById('loginSpinner');
const loadingOverlay = document.getElementById('loadingOverlay');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Enhanced UI interactions
function initializeUI() {
    // Custom checkbox functionality
    rememberMeCheckbox.addEventListener('change', function() {
        const checkmark = this.parentElement.querySelector('.checkmark');
        if (this.checked) {
            checkmark.style.opacity = '1';
            this.parentElement.querySelector('.checkbox-custom').style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
        } else {
            checkmark.style.opacity = '0';
            this.parentElement.querySelector('.checkbox-custom').style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }
    });

    // Password toggle functionality
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            `;
        }
    });

    // Auto-focus and smooth transitions
    usernameInput.focus();
    
    // Enhanced keyboard navigation
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });
}

// Enhanced loading states
function showLoading() {
    loginBtn.disabled = true;
    loginBtnText.classList.add('hidden');
    loginSpinner.classList.remove('hidden');
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loginBtn.disabled = false;
    loginBtnText.classList.remove('hidden');
    loginSpinner.classList.add('hidden');
    loadingOverlay.classList.add('hidden');
}

// Enhanced error handling with beautiful notifications
function showError(message) {
    // Remove existing errors
    const existingError = document.querySelector('.error-notification');
    if (existingError) existingError.remove();

    // Create beautiful error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification fixed top-4 right-4 bg-red-500 bg-opacity-90 backdrop-blur-lg text-white p-4 rounded-xl shadow-2xl border border-red-400 border-opacity-30 z-50 transform translate-x-full transition-transform duration-300';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
                <p class="font-medium">Login Failed</p>
                <p class="text-sm opacity-90">${message}</p>
            </div>
            <button class="ml-4 opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Animate in
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(full)';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Success notification
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 bg-opacity-90 backdrop-blur-lg text-white p-4 rounded-xl shadow-2xl border border-green-400 border-opacity-30 z-50 transform translate-x-full transition-transform duration-300';
    successDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
                <p class="font-medium">Success!</p>
                <p class="text-sm opacity-90">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.style.transform = 'translateX(0)', 100);
    setTimeout(() => successDiv.remove(), 3000);
}

// API calls
async function attemptLogin(apiUrl, loginData) {
    const response = await axios.post(`${apiUrl}/auth/login`, loginData, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
    });
    return response;
}

function handleLoginSuccess(response) {
    console.log('Login successful:', response.data);
    
    // Store data
    if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
    }
    if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId);
    }
    if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    localStorage.setItem('loginTime', new Date().toISOString());
    
    showSuccess('Login successful! Redirecting...');
    
    setTimeout(() => {
        window.location.href = redirectOptions.primary;
    }, 1500);
}

// Main login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }

    showLoading();
    const loginData = { username, password };

    try {
        let response;
        
        try {
            response = await attemptLogin(apiConfig.baseUrl, loginData);
        } catch (primaryError) {
            console.log('Primary API failed, trying fallback:', primaryError.message);
            response = await attemptLogin(apiConfig.fallbackUrl, loginData);
        }

        handleLoginSuccess(response);

    } catch (error) {
        hideLoading();
        console.error('Login error:', error);

        let errorMessage = 'Login failed. Please try again.';
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 401) {
                errorMessage = 'Invalid username or password';
            } else if (status === 429) {
                errorMessage = 'Too many login attempts. Please try again later.';
            } else if (data?.message) {
                errorMessage = data.message;
            }
        } else if (error.request) {
            errorMessage = 'Unable to connect to server. Please check your connection.';
        }

        showError(errorMessage);
    }
});

// Auto-login check
window.addEventListener('load', () => {
    initializeUI();
    
    const token = localStorage.getItem('accessToken');
    const loginTime = localStorage.getItem('loginTime');
    
    if (token && loginTime) {
        const timeDiff = new Date() - new Date(loginTime);
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            showSuccess('Welcome back! Redirecting...');
            setTimeout(() => {
                window.location.href = redirectOptions.primary;
            }, 1500);
        }
    }
});