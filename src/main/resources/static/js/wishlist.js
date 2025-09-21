// Wishlist JavaScript functionality
class WishlistManager {
    constructor() {
        this.wishlistItems = [];
        this.init();
    }

    init() {
        this.updateNavigation();
        this.loadWishlist();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    /* --------------------- Navigation & Auth --------------------- */
    updateNavigation() {
        const token = localStorage.getItem('accessToken');
        const userRole = localStorage.getItem('userRole');
        const username = localStorage.getItem('username');

        const signInBtn = document.getElementById('login-link');

        if (token && username) {
            if (signInBtn) {
                signInBtn.parentElement.remove();
            }

            const userMenu = document.createElement('div');
            userMenu.className = 'flex items-center space-x-4';
            userMenu.innerHTML = `
            <div class="relative">
                <button id="user-menu-btn" class="flex items-center space-x-2 text-black dark:text-white hover:text-blue-700 dark:hover:text-blue-400">
                    <span class="text-sm font-medium">${username}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="user-dropdown" class="hidden absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    ${userRole === 'ADMIN' ? '<a href="admin-dashboard.html" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Admin Dashboard</a>' : ''}
                    <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</a>
                    <a href="#" onclick="handleLogout()" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</a>
                </div>
            </div>
        `;
            const signInContainer = document.getElementById('nav-right-container');
            if (signInContainer) {
                signInContainer.innerHTML = '';
                signInContainer.appendChild(userMenu);
            }

            const userMenuBtn = document.getElementById('user-menu-btn');
            const userDropdown = document.getElementById('user-dropdown');

            if (userMenuBtn && userDropdown) {
                userMenuBtn.addEventListener('click', () => {
                    userDropdown.classList.toggle('hidden');
                });

                document.addEventListener('click', (e) => {
                    if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                        userDropdown.classList.add('hidden');
                    }
                });
            }
        }
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refresh-wishlist')?.addEventListener('click', () => {
            this.loadWishlist();
        });

        // Retry button
        document.getElementById('retry-loading')?.addEventListener('click', () => {
            this.loadWishlist();
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
                mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
                mobileMenu.classList.toggle('hidden');
                
                // Toggle icons
                const openIcon = mobileMenuToggle.querySelector('.block');
                const closeIcon = mobileMenuToggle.querySelector('.hidden');
                if (openIcon && closeIcon) {
                    openIcon.classList.toggle('block');
                    openIcon.classList.toggle('hidden');
                    closeIcon.classList.toggle('block');
                    closeIcon.classList.toggle('hidden');
                }
            });
        }
    }

    async checkAuthentication() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            this.showError('Please log in to view your wishlist');
            return false;
        }
        return true;
    }

    async loadWishlist() {
        const isAuthenticated = await this.checkAuthentication();
        if (!isAuthenticated) return;

        this.showLoading();

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/wishlist/my-wishlist', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                this.showError('Please log in to view your wishlist');
                localStorage.removeItem('accessToken');
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load wishlist');
            }

            const wishlistData = await response.json();
            this.wishlistItems = wishlistData;
            this.renderWishlist();
            this.updateWishlistCount();

        } catch (error) {
            console.error('Error loading wishlist:', error);
            this.showError('Failed to load your wishlist. Please try again.');
        }
    }

    renderWishlist() {
        const container = document.getElementById('wishlist-container');
        const emptyState = document.getElementById('empty-state');
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');

        // Hide all states
        [container, emptyState, loadingState, errorState].forEach(el => el.classList.add('hidden'));

        if (this.wishlistItems.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        container.innerHTML = '';
        container.classList.remove('hidden');

        this.wishlistItems.forEach(item => {
            const wishlistItem = this.createWishlistItem(item);
            container.appendChild(wishlistItem);
        });
    }

    createWishlistItem(item) {
        const div = document.createElement('div');
        div.className = 'wishlist-item bg-white rounded-lg shadow-md overflow-hidden';
        div.innerHTML = `
            <div class="md:flex">
                <div class="md:w-1/3">
                    <div class="h-48 md:h-full">
                        <img src="${item.eventImageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}" 
                             alt="${item.eventTitle}" 
                             class="wishlist-item-image w-full h-full object-cover">
                    </div>
                </div>
                <div class="md:w-2/3 p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 mb-2">${item.eventTitle}</h3>
                            <div class="event-date mb-2">
                                <i class="far fa-calendar mr-2"></i>
                                ${this.formatDate(item.eventDate)}
                            </div>
                            <div class="venue-info">
                                <i class="fas fa-map-marker-alt mr-2"></i>
                                ${item.eventVenue}
                            </div>
                        </div>
                        <div class="wishlist-actions">
                            <button onclick="wishlistManager.removeFromWishlist(${item.eventId})" 
                                    class="remove-btn">
                                <i class="fas fa-trash mr-2"></i>Remove
                            </button>
                        </div>
                    </div>
                    
                    <div class="notification-settings">
                        <h4><i class="fas fa-bell mr-2"></i>Notification Settings</h4>
                        <div class="notification-item">
                            <span class="notification-label">Notify on price drop</span>
                            <label class="notification-toggle">
                                <input type="checkbox" ${item.notifyOnPriceDrop ? 'checked' : ''} 
                                       onchange="wishlistManager.updateNotificationSettings(${item.eventId}, 'notifyOnPriceDrop', this.checked)">
                                <span class="notification-slider"></span>
                            </label>
                        </div>
                        <div class="notification-item">
                            <span class="notification-label">Notify before event</span>
                            <label class="notification-toggle">
                                <input type="checkbox" ${item.notifyBeforeEvent ? 'checked' : ''} 
                                       onchange="wishlistManager.updateNotificationSettings(${item.eventId}, 'notifyBeforeEvent', this.checked)">
                                <span class="notification-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center mt-4">
                        <div class="text-sm text-gray-500">
                            Added on ${this.formatDate(item.addedDate)}
                        </div>
                        <a href="book-tickets.html?eventId=${item.eventId}" class="book-btn">
                            <i class="fas fa-ticket-alt mr-2"></i>Book Tickets
                        </a>
                    </div>
                </div>
            </div>
        `;
        return div;
    }

    async removeFromWishlist(eventId) {
        if (!confirm('Are you sure you want to remove this event from your wishlist?')) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/wishlist/remove/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                this.showError('Please log in to manage your wishlist');
                localStorage.removeItem('accessToken');
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to remove from wishlist');
            }

            // Remove from local array and re-render
            this.wishlistItems = this.wishlistItems.filter(item => item.eventId !== eventId);
            this.renderWishlist();
            this.updateWishlistCount();
            
            this.showSuccess('Event removed from wishlist');

        } catch (error) {
            console.error('Error removing from wishlist:', error);
            this.showError('Failed to remove event from wishlist');
        }
    }

    async updateNotificationSettings(eventId, setting, value) {
        try {
            const token = localStorage.getItem('accessToken');
            // Cari item wishlist yang sedang diubah
            const item = this.wishlistItems.find(item => item.eventId === eventId);
            // Siapkan payload lengkap
            const requestData = {
                eventId: eventId,
                notifyOnPriceDrop: setting === 'notifyOnPriceDrop' ? value : (item?.notifyOnPriceDrop ?? false),
                notifyBeforeEvent: setting === 'notifyBeforeEvent' ? value : (item?.notifyBeforeEvent ?? false)
            };

            const response = await fetch(`/api/wishlist/update/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (response.status === 401) {
                this.showError('Please log in to update settings');
                localStorage.removeItem('accessToken');
                window.location.href = 'login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to update notification settings');
            }

            // Update local data
            if (item) {
                item.notifyOnPriceDrop = requestData.notifyOnPriceDrop;
                item.notifyBeforeEvent = requestData.notifyBeforeEvent;
            }

            this.showSuccess('Notification settings updated');

        } catch (error) {
            console.error('Error updating notification settings:', error);
            this.showError('Failed to update notification settings');
        }
    }

    updateWishlistCount() {
        const countElement = document.getElementById('wishlist-count');
        if (countElement) {
            const count = this.wishlistItems.length;
            countElement.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showLoading() {
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('wishlist-container').classList.add('hidden');
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('error-state').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('error-state').classList.remove('hidden');
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('wishlist-container').classList.add('hidden');
        document.getElementById('empty-state').classList.add('hidden');
        
        // Update error message if there's a specific element for it
        const errorMessage = document.querySelector('#error-state p');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    showSuccess(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Global wishlist manager instance
let wishlistManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    wishlistManager = new WishlistManager();
});

// Global functions for inline event handlers
window.wishlistManager = wishlistManager;

// Logout function - consistent with events.js
function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}
