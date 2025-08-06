/**
 * Enhanced Authentication & Theme Management System
 * Modern ES6+ implementation with improved functionality
 */

class AuthManager {
    constructor() {
        this.storageKeys = {
            accessToken: 'accessToken',
            userRole: 'userRole',
            userData: 'userData',
            sessionExpiry: 'sessionExpiry'
        };
        this.eventListeners = new Map();
        this.init();
    }

    // Enhanced authentication methods
    isAdmin() {
        try {
            const role = this.getStorageItem(this.storageKeys.userRole);
            return role === 'ADMIN' || role === 'admin';
        } catch (error) {
            console.warn('Error checking admin status:', error);
            return false;
        }
    }

    isLoggedIn() {
        try {
            const token = this.getStorageItem(this.storageKeys.accessToken);
            const expiry = this.getStorageItem(this.storageKeys.sessionExpiry);
            
            if (!token) return false;
            
            // Check if session has expired
            if (expiry && new Date().getTime() > parseInt(expiry)) {
                this.handleLogout(false); // Silent logout
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('Error checking login status:', error);
            return false;
        }
    }

    getUserData() {
        try {
            const userData = this.getStorageItem(this.storageKeys.userData);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.warn('Error getting user data:', error);
            return null;
        }
    }

    setUserData(userData, expiryHours = 24) {
        try {
            const expiryTime = new Date().getTime() + (expiryHours * 60 * 60 * 1000);
            this.setStorageItem(this.storageKeys.userData, JSON.stringify(userData));
            this.setStorageItem(this.storageKeys.sessionExpiry, expiryTime.toString());
            this.triggerEvent('userDataChanged', userData);
        } catch (error) {
            console.error('Error setting user data:', error);
        }
    }

    handleLogout(redirect = true, showNotification = true) {
        try {
            // Clear all auth-related storage
            Object.values(this.storageKeys).forEach(key => {
                this.removeStorageItem(key);
            });
            
            this.triggerEvent('logout');
            
            if (showNotification) {
                this.showNotification('Logged out successfully', 'info');
            }
            
            if (redirect) {
                // Add a small delay for better UX
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    // Storage methods with error handling
    getStorageItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn(`Error accessing localStorage for key: ${key}`, error);
            return null;
        }
    }

    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error setting localStorage for key: ${key}`, error);
        }
    }

    removeStorageItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Error removing localStorage for key: ${key}`, error);
        }
    }

    // Event system for auth state changes
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    triggerEvent(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transition: all 0.3s ease;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    init() {
        // Check for expired sessions on init
        if (this.getStorageItem(this.storageKeys.accessToken)) {
            this.isLoggedIn(); // This will handle cleanup if expired
        }
    }
}

class ThemeManager {
    constructor() {
        this.storageKey = 'theme';
        this.themes = ['light', 'dark', 'auto'];
        this.currentTheme = 'auto';
        this.eventListeners = new Map();
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.init();
    }

    setTheme(mode, savePreference = true) {
        if (!this.themes.includes(mode)) {
            console.warn(`Invalid theme mode: ${mode}`);
            return;
        }

        const htmlElement = document.documentElement;
        const body = document.body;
        
        // Remove all theme classes
        htmlElement.classList.remove('dark', 'light');
        body.classList.remove('theme-dark', 'theme-light');
        
        let effectiveTheme = mode;
        
        if (mode === 'auto') {
            effectiveTheme = this.mediaQuery.matches ? 'dark' : 'light';
        }
        
        // Apply theme
        htmlElement.classList.add(effectiveTheme);
        body.classList.add(`theme-${effectiveTheme}`);
        
        // Update CSS custom properties for smooth transitions
        this.updateThemeProperties(effectiveTheme);
        
        this.currentTheme = mode;
        
        if (savePreference) {
            try {
                localStorage.setItem(this.storageKey, mode);
            } catch (error) {
                console.warn('Error saving theme preference:', error);
            }
        }
        
        this.triggerEvent('themeChanged', { mode, effectiveTheme });
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(effectiveTheme);
    }

    updateThemeProperties(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.setProperty('--text-primary', '#f8fafc');
            root.style.setProperty('--text-secondary', '#cbd5e1');
            root.style.setProperty('--border-color', '#334155');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f8fafc');
            root.style.setProperty('--text-primary', '#0f172a');
            root.style.setProperty('--text-secondary', '#475569');
            root.style.setProperty('--border-color', '#e2e8f0');
        }
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#ffffff';
    }

    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return this.mediaQuery.matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }

    // Event system
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    triggerEvent(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in theme event listener for ${event}:`, error);
                }
            });
        }
    }

    init() {
        // Load saved theme or detect system preference
        const savedTheme = localStorage.getItem(this.storageKey);
        const initialTheme = savedTheme || 'auto';
        
        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.setTheme('auto', false);
            }
        });
        
        // Set initial theme
        this.setTheme(initialTheme, false);
        
        // Add transition class after a short delay to prevent flash
        setTimeout(() => {
            document.body.classList.add('theme-transition');
        }, 100);
    }
}

class UIManager {
    constructor(authManager, themeManager) {
        this.auth = authManager;
        this.theme = themeManager;
        this.elements = new Map();
        this.init();
    }

    cacheElements() {
        const selectors = {
            adminLink: '#admin-link',
            logoutLink: '#logout-link',
            loginLink: '#login-link',
            themeToggle: '#theme-toggle',
            userDisplay: '#user-display',
            navbar: '.navbar'
        };

        Object.entries(selectors).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element) {
                this.elements.set(key, element);
            }
        });
    }

    updateNavbar() {
        const isLoggedIn = this.auth.isLoggedIn();
        const isAdmin = this.auth.isAdmin();
        const userData = this.auth.getUserData();

        // Update visibility of auth-related links
        this.toggleElementVisibility('adminLink', isAdmin);
        this.toggleElementVisibility('logoutLink', isLoggedIn);
        this.toggleElementVisibility('loginLink', !isLoggedIn);

        // Update user display
        const userDisplay = this.elements.get('userDisplay');
        if (userDisplay && userData) {
            userDisplay.textContent = `Welcome, ${userData.name || userData.username || 'User'}`;
            userDisplay.style.display = isLoggedIn ? '' : 'none';
        }

        // Add animation class for smooth transitions
        const navbar = this.elements.get('navbar');
        if (navbar) {
            navbar.classList.add('navbar-updated');
            setTimeout(() => navbar.classList.remove('navbar-updated'), 300);
        }
    }

    toggleElementVisibility(elementKey, show) {
        const element = this.elements.get(elementKey);
        if (element) {
            element.style.display = show ? '' : 'none';
            element.style.opacity = show ? '1' : '0';
        }
    }

    setupThemeToggle() {
        const themeToggle = this.elements.get('themeToggle');
        if (themeToggle) {
            // Create enhanced theme toggle button
            themeToggle.innerHTML = this.getThemeToggleIcon();
            themeToggle.setAttribute('aria-label', 'Toggle theme');
            themeToggle.className += ' theme-toggle-btn';
            
            themeToggle.addEventListener('click', () => {
                this.theme.toggleTheme();
                this.updateThemeToggleIcon();
            });

            // Update icon when theme changes
            this.theme.addEventListener('themeChanged', () => {
                this.updateThemeToggleIcon();
            });
        }
    }

    getThemeToggleIcon() {
        const currentTheme = this.theme.getCurrentTheme();
        const icons = {
            light: '🌙',
            dark: '☀️',
            auto: '🌓'
        };
        return `<span class="theme-icon">${icons[currentTheme] || icons.auto}</span>`;
    }

    updateThemeToggleIcon() {
        const themeToggle = this.elements.get('themeToggle');
        if (themeToggle) {
            const iconSpan = themeToggle.querySelector('.theme-icon');
            if (iconSpan) {
                iconSpan.textContent = this.getThemeToggleIcon().match(/[🌙☀️🌓]/)[0];
            }
        }
    }

    setupLogoutHandler() {
        const logoutLink = this.elements.get('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Show confirmation dialog
                if (confirm('Are you sure you want to logout?')) {
                    this.auth.handleLogout();
                }
            });
        }
    }

    init() {
        this.cacheElements();
        this.updateNavbar();
        this.setupThemeToggle();
        this.setupLogoutHandler();

        // Listen for auth state changes
        this.auth.addEventListener('logout', () => {
            this.updateNavbar();
        });

        this.auth.addEventListener('userDataChanged', () => {
            this.updateNavbar();
        });
    }
}

// Application initialization
class App {
    constructor() {
        this.authManager = new AuthManager();
        this.themeManager = new ThemeManager();
        this.uiManager = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            this.uiManager = new UIManager(this.authManager, this.themeManager);
            
            // Add global error handling
            window.addEventListener('error', (e) => {
                console.error('Global error:', e.error);
            });

            // Add unhandled promise rejection handling
            window.addEventListener('unhandledrejection', (e) => {
                console.error('Unhandled promise rejection:', e.reason);
            });

            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    // Public API methods
    getAuth() {
        return this.authManager;
    }

    getTheme() {
        return this.themeManager;
    }

    getUI() {
        return this.uiManager;
    }
}

// Initialize the application
const app = new App();

// Export for global access (optional)
window.AppManager = app;

// Add some CSS for smooth transitions (inject if not present)
if (!document.querySelector('#theme-transitions')) {
    const style = document.createElement('style');
    style.id = 'theme-transitions';
    style.textContent = `
        .theme-transition * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
        }
        
        .navbar-updated {
            animation: navbarPulse 0.3s ease;
        }
        
        @keyframes navbarPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        .theme-toggle-btn {
            transition: transform 0.2s ease;
            cursor: pointer;
        }
        
        .theme-toggle-btn:hover {
            transform: scale(1.1);
        }
        
        .theme-toggle-btn:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);
}