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
const loadingOverlay = document.getElementById('loadingOverlay');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const alertDiv = document.getElementById('alert');

// Enhanced UI interactions
function initializeUI() {
    // Auto-focus on email input
    if (usernameInput) {
        usernameInput.focus();
    }

    // Enhanced keyboard navigation
    if (usernameInput && passwordInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                passwordInput.focus();
            }
        });

        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                showInfo('Processing login...');
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
}

// Enhanced loading states
function showLoading() {
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'SIGNING IN...';
    }
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'SIGN IN';
    }
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Show alert in the form
function showAlert(message, type = 'error') {
    if (!alertDiv) return;
    
    alertDiv.textContent = message;
    alertDiv.className = `alert ${type}`;
    alertDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

// Enhanced error handling
function showError(message) {
    showAlert(message, 'error');
    
    // Also show notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f44336;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <svg style="width: 20px; height: 20px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div style="flex: 1;">
                <p style="font-weight: 600; margin-bottom: 4px;">Login Failed</p>
                <p style="font-size: 14px; opacity: 0.9;">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
                <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    if (!document.querySelector('style[data-login-animations]')) {
        style.setAttribute('data-login-animations', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(errorDiv);

    // Auto remove
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Info notification (blue)
function showInfo(message) {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2563eb;
        color: white;
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.25s ease-out;
    `;
    infoDiv.textContent = message;
    document.body.appendChild(infoDiv);
    setTimeout(() => infoDiv.remove(), 1500);
}

// Success notification
function showSuccess(message) {
    showAlert(message, 'success');
    
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    successDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <svg style="width: 20px; height: 20px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div style="flex: 1;">
                <p style="font-weight: 600; margin-bottom: 4px;">Success!</p>
                <p style="font-size: 14px; opacity: 0.9;">${message}</p>
            </div>
        </div>
    `;

    document.body.appendChild(successDiv);
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
    if (response.data.role) {
        localStorage.setItem('userRole', response.data.role);
    }
    if (response.data.username) {
        localStorage.setItem('username', response.data.username);
    }

    localStorage.setItem('loginTime', new Date().toISOString());

    showSuccess('Login successful! Redirecting...');

    setTimeout(() => {
        window.location.href = redirectOptions.primary;
    }, 1500);
}

// Main login handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput ? usernameInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!username || !password) {
            showError('Please enter both email and password');
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
                    errorMessage = 'Invalid email or password';
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
}

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