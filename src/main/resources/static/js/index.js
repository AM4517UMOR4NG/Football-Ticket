// Enhanced FootballTix Frontend Integration - User Friendly Version (Fixed)
const API_BASE_URL = '/api';

// Wishlist functionality
async function addToWishlist(eventId) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Please log in to add events to your wishlist');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/wishlist/add', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventId: eventId,
                notifyOnPriceDrop: true,
                notifyBeforeEvent: true
            })
        });

        if (response.status === 401) {
            alert('Please log in to add events to your wishlist');
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add to wishlist');
        }

        // Update button state
        const button = document.querySelector(`[onclick*="addToWishlist(${eventId})"]`);
        if (button) {
            button.classList.add('added');
            button.innerHTML = '<i class="fas fa-heart"></i>';
            button.title = 'Remove from Wishlist';
            button.onclick = () => removeFromWishlist(eventId);
        }

        showSuccessMessage('Event added to wishlist!');

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        alert(error.message || 'Failed to add to wishlist');
    }
}

async function removeFromWishlist(eventId) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Please log in to manage your wishlist');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`/api/wishlist/remove/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            alert('Please log in to manage your wishlist');
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove from wishlist');
        }

        // Update button state
        const button = document.querySelector(`[onclick*="removeFromWishlist(${eventId})"]`);
        if (button) {
            button.classList.remove('added');
            button.innerHTML = '<i class="far fa-heart"></i>';
            button.title = 'Add to Wishlist';
            button.onclick = () => addToWishlist(eventId);
        }

        showSuccessMessage('Event removed from wishlist!');

    } catch (error) {
        console.error('Error removing from wishlist:', error);
        alert(error.message || 'Failed to remove from wishlist');
    }
}

function showSuccessMessage(message) {
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

// Check wishlist status for events on page load
async function checkWishlistStatus() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    
    for (const button of wishlistButtons) {
        const eventId = button.getAttribute('onclick')?.match(/addToWishlist\((\d+)\)/)?.[1];
        if (!eventId) continue;

        try {
            const response = await fetch(`/api/wishlist/check/${eventId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.isInWishlist) {
                    button.classList.add('added');
                    button.innerHTML = '<i class="fas fa-heart"></i>';
                    button.title = 'Remove from Wishlist';
                    button.onclick = () => removeFromWishlist(eventId);
                }
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    }
}

// DOM Elements
const leagueSelect = document.getElementById('league-select');
const teamSelect = document.getElementById('team-select');
const searchButton = document.querySelector('.hero-pattern button');
const featuredMatchesContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');

// Enhanced UI State Management (Removed localStorage usage)
let isLoading = false;
let currentUser = null;
let favorites = []; // Store in memory instead of localStorage
let searchHistory = []; // Store in memory instead of localStorage

// Initialize carousel and mobile menu
document.addEventListener('DOMContentLoaded', () => {
    initializeCarousel();
    initializeMobileMenu();
    applyThemePreference();
    checkWishlistStatus();
    setupThemeToggle();
    initializeApp();
    setupKeyboardShortcuts();
    setupServiceWorker();
});

function initializeCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    
    if (!carouselInner || !items.length) return;
    
    let currentIndex = 0;

    const updateCarousel = () => {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
            indicator.setAttribute('aria-selected', index === currentIndex);
        });
    };

    prevButton?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    });

    nextButton?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    });

    indicators.forEach((indicator, index) => {
        indicator?.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
}

function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuToggle?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('hidden');
    });
}

// Enhanced Dark Mode with Smooth Transitions
function enableDarkMode() {
    document.documentElement.classList.add('dark');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = '☀️';
        themeToggle.setAttribute('title', 'Switch to light mode');
    }
    showToast('Dark mode enabled', 'success');
}

function disableDarkMode() {
    document.documentElement.classList.remove('dark');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = '🌙';
        themeToggle.setAttribute('title', 'Switch to dark mode');
    }
    showToast('Light mode enabled', 'info');
}

function applyThemePreference() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

function toggleDarkMode() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (isDarkMode) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// Enhanced Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.getElementById('toast-container');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.id = 'toast-container';
    toast.className = 'fixed top-4 right-4 z-50 transform translate-x-full transition-transform duration-300 ease-in-out';
    
    const typeStyles = {
        success: 'bg-green-500 border-green-600',
        error: 'bg-red-500 border-red-600',
        warning: 'bg-yellow-500 border-yellow-600',
        info: 'bg-blue-500 border-blue-600'
    };
    
    const typeIcons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="${typeStyles[type]} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 flex items-center space-x-3 min-w-80 max-w-96">
            <span class="text-xl">${typeIcons[type]}</span>
            <span class="flex-1 font-medium">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200 ml-4">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
        toast.classList.add('translate-x-0');
    }, 100);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

// Enhanced Loading Spinner
function showLoadingSpinner(target = document.body, message = 'Loading...') {
    // Remove existing spinner
    hideLoadingSpinner();
    
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    spinner.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            <p class="text-gray-700 dark:text-gray-300 font-medium">${message}</p>
        </div>
    `;
    
    if (target === document.body) {
        document.body.appendChild(spinner);
    } else {
        target.style.position = 'relative';
        target.appendChild(spinner);
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.remove();
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
        themeToggle.style.transition = 'transform 0.3s ease-in-out';
        
        themeToggle.addEventListener('mousedown', () => {
            themeToggle.style.transform = 'scale(0.95)';
        });
        
        themeToggle.addEventListener('mouseup', () => {
            themeToggle.style.transform = 'scale(1)';
        });
    }
}

async function initializeApp() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        showLoadingSpinner(document.body, 'Initializing FootballTix...');
        await loadUserPreferences();
        await loadFeaturedMatchesWithRetry();
        await loadLeagues();
        setupEventListeners();
        await loadStats();
        setupAutoRefresh();
        showToast('Ronaldo is the GOAT', 'success', 200);
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Failed to load some content. Please refresh the page.', 'error');
    } finally {
        hideLoadingSpinner();
        isLoading = false;
    }
}

// Enhanced Featured Matches with Retry Logic
async function loadFeaturedMatchesWithRetry(maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/featured`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const events = await response.json();
            if (!Array.isArray(events)) throw new Error('Invalid data format from server');
            
            updateFeaturedMatches(events);
            return;
        } catch (error) {
            retries++;
            console.error(`Attempt ${retries} failed:`, error);
            
            if (retries >= maxRetries) {
                showToast('Using offline data due to connection issues', 'warning');
                loadStaticFeaturedMatches();
                return;
            }
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
    }
}

// Enhanced Match Cards with Interactive Features
function updateFeaturedMatches(events) {
    if (!featuredMatchesContainer) return;
    
    featuredMatchesContainer.innerHTML = events.map((event, index) => `
        <div class="match-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 group"
             data-event-id="${event.id}">
            <div class="relative h-48 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
                ${event.imageUrl ? `
                    <img src="${event.imageUrl}" alt="${event.title}"
                         class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                         onerror="this.style.display='none'; this.parentElement.classList.add('bg-gray-200');"
                         loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                ` : `
                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                        </svg>
                    </div>
                `}
                <div class="absolute top-4 left-4">
                    <div class="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                        ${getLeagueFromEvent(event)}
                    </div>
                </div>
                <div class="absolute top-4 right-4 flex space-x-2">
                    <div class="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        ${formatEventDate(event.eventDate)}
                    </div>
                    <button onclick="toggleFavorite(${event.id}, event)"
                            class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200"
                            title="${favorites.includes(event.id) ? 'Remove from favorites' : 'Add to favorites'}">
                        <svg class="w-4 h-4 ${favorites.includes(event.id) ? 'fill-red-500' : 'fill-none stroke-current'}" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200">
                    ${event.title}
                </h3>
                
                <div class="flex items-center justify-between mb-6">
                    <div class="flex flex-col items-center group/team">
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-full flex items-center justify-center mb-2 transition-all duration-200 group-hover/team:scale-110 overflow-hidden">
                            ${event.homeTeamLogo ? `
                                <img src="${event.homeTeamLogo}" alt="${getHomeTeam(event.title)} Logo"
                                     class="w-12 h-12 object-contain"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <svg class="w-8 h-8 text-blue-700 dark:text-blue-400 hidden" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                                </svg>
                            ` : `
                                <svg class="w-8 h-8 text-blue-700 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                                </svg>
                            `}
                        </div>
                        <div class="font-semibold text-center text-sm text-gray-800 dark:text-gray-200">${getHomeTeam(event.title)}</div>
                    </div>
                    
                    <div class="flex flex-col items-center">
                        <div class="text-lg font-bold text-gray-400 dark:text-gray-500 mb-1">VS</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${formatMatchTime(event.eventDate)}</div>
                    </div>
                    
                    <div class="flex flex-col items-center group/team">
                        <div class="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 rounded-full flex items-center justify-center mb-2 transition-all duration-200 group-hover/team:scale-110 overflow-hidden">
                            ${event.awayTeamLogo ? `
                                <img src="${event.awayTeamLogo}" alt="${getAwayTeam(event.title)} Logo"
                                     class="w-12 h-12 object-contain"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <svg class="w-8 h-8 text-red-600 dark:text-red-400 hidden" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                                </svg>
                            ` : `
                                <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                                </svg>
                            `}
                        </div>
                        <div class="font-semibold text-center text-sm text-gray-800 dark:text-gray-200">${getAwayTeam(event.title)}</div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        ${event.venue || 'TBD'}
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                            <span class="text-green-600 dark:text-green-400 font-bold text-lg">From £${event.price || 'TBD'}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">${getTicketAvailability(event)}</span>
                        </div>
                        
                        <div class="flex space-x-2">
                            <button onclick="shareEvent(${event.id}, '${event.title}')"
                                    class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-2 rounded-md transition-all duration-150 ease-in-out hover:scale-110"
                                    title="Share this match">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                                </svg>
                            </button>
                            <button class="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out hover:scale-105 shadow-lg hover:shadow-xl transform active:scale-95"
                                    onclick="handleBuyTickets(${event.id}, '${event.title}')">
                                Buy Tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    observeMatchCards();
}

// Enhanced Search functionality
async function handleSearch() {
    const league = leagueSelect?.value || '';
    const team = teamSelect?.value || '';
    const dateInput = document.querySelector('input[type="date"]');
    const date = dateInput?.value || '';
    
    if (!league && !team && !date) {
        showToast('Please select at least one search criteria', 'warning');
        return;
    }
    
    const searchQuery = { league, team, date, timestamp: Date.now() };
    addToSearchHistory(searchQuery);
    
    showLoadingSpinner(document.body, 'Searching matches...');
    
    try {
        let url = `${API_BASE_URL}/events/search?`;
        if (league) url += `league=${encodeURIComponent(league)}&`;
        if (team) url += `team=${encodeURIComponent(team)}&`;
        if (date) url += `date=${encodeURIComponent(date)}&`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Search failed: HTTP ${response.status} - ${response.statusText}`);
        
        const events = await response.json();
        if (!Array.isArray(events)) throw new Error('Invalid data format from server');
        
        if (events.length === 0) {
            showToast('No matches found for your search criteria', 'info');
            return;
        }
        
        showToast(`Found ${events.length} match(es)`, 'success');
        // Use sessionStorage instead of localStorage for temporary data
        sessionStorage.setItem('searchResults', JSON.stringify(events));
        window.location.href = `events.html?search=true`;
    } catch (error) {
        console.error('Error searching events:', error);
        showToast(`Search failed: ${error.message}. Please try again.`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Enhanced Buy Tickets functionality
function handleBuyTickets(eventId, eventTitle) {
    // Check if user is authenticated using sessionStorage
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    
    if (!token) {
        showToast('Please sign in to purchase tickets', 'warning');
        sessionStorage.setItem('pendingAction', JSON.stringify({
            type: 'buyTickets',
            eventId,
            eventTitle
        }));
        window.location.href = 'login.html';
        return;
    }
    
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Opening...';
    button.disabled = true;
    
    setTimeout(() => {
        window.location.href = `events.html?eventId=${eventId}&eventTitle=${encodeURIComponent(eventTitle)}`;
    }, 500);
}

// Favorite functionality
function toggleFavorite(eventId, event) {
    event.stopPropagation();
    
    const index = favorites.indexOf(eventId);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites', 'info');
    } else {
        favorites.push(eventId);
        showToast('Added to favorites ❤️', 'success');
    }
    
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('[onclick^="toggleFavorite"]');
    favoriteButtons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        const match = onclick.match(/toggleFavorite\((\d+)/);
        if (match) {
            const eventId = parseInt(match[1]);
            const svg = button.querySelector('svg');
            if (favorites.includes(eventId)) {
                svg.classList.add('fill-red-500');
                svg.classList.remove('fill-none', 'stroke-current');
                button.title = 'Remove from favorites';
            } else {
                svg.classList.remove('fill-red-500');
                svg.classList.add('fill-none', 'stroke-current');
                button.title = 'Add to favorites';
            }
        }
    });
}

// Share functionality
async function shareEvent(eventId, eventTitle) {
    const shareData = {
        title: `${eventTitle} - FootballTix`,
        text: `Check out this exciting match: ${eventTitle}`,
        url: `${window.location.origin}/events.html?id=${eventId}`
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            showToast('Shared successfully!', 'success');
        } else {
            await navigator.clipboard.writeText(shareData.url);
            showToast('Link copied to clipboard!', 'success');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        showToast('Unable to share. Link copied to clipboard instead.', 'warning');
        try {
            await navigator.clipboard.writeText(shareData.url);
        } catch (clipboardError) {
            showToast('Sharing failed', 'error');
        }
    }
}

function addToSearchHistory(searchQuery) {
    searchHistory.unshift(searchQuery);
    searchHistory = searchHistory.slice(0, 10); // Keep only last 10 searches
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + K for search focus
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchInput = leagueSelect || teamSelect || document.querySelector('input[type="text"], select');
            if (searchInput) {
                searchInput.focus();
                showToast('Search focused! Use Tab to navigate between fields', 'info');
            }
        }
        
        // Ctrl/Cmd + D for dark mode toggle
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            toggleDarkMode();
        }
    });
}

function setupAutoRefresh() {
    // Auto-refresh featured matches every 5 minutes
    setInterval(async () => {
        try {
            await loadFeaturedMatchesWithRetry(1);
        } catch (error) {
            console.error('Auto-refresh failed:', error);
        }
    }, 5 * 60 * 1000);
}

function observeMatchCards() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.match-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });
}

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker registered successfully'))
            .catch((error) => console.error('Service Worker registration failed:', error));
    }
}

async function loadUserPreferences() {
    // Load user from sessionStorage or localStorage as fallback
    currentUser = JSON.parse(sessionStorage.getItem('footballtix_user') || localStorage.getItem('footballtix_user') || 'null');
    if (currentUser) {
        document.body.classList.add('user-authenticated');
    }
    updateNavigation();
}

// Utility Functions
function getTicketAvailability(event) {
    const random = Math.random();
    if (random > 0.8) return 'Few left';
    if (random > 0.6) return 'Available';
    if (random > 0.3) return 'Good availability';
    return 'High demand';
}

function formatMatchTime(dateString) {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return `${diffDays} days`;
}

function getLeagueFromEvent(event) {
    const title = (event.title || '').toLowerCase();
    const venue = (event.venue || '').toLowerCase();
    
    const leagues = {
        'premier league': ['manchester', 'chelsea', 'arsenal', 'liverpool', 'tottenham', 'london'],
        'la liga': ['madrid', 'barcelona', 'atletico', 'sevilla'],
        'bundesliga': ['bayern', 'dortmund', 'leipzig', 'munich'],
        'serie a': ['milan', 'juventus', 'napoli', 'roma'],
        'ligue 1': ['psg', 'marseille', 'lyon', 'paris'],
        'champions league': ['champions league', 'ucl']
    };
    
    for (const [league, keywords] of Object.entries(leagues)) {
        if (keywords.some(keyword => title.includes(keyword) || venue.includes(keyword))) {
            return league.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    }
    return 'Football Match';
}

function getHomeTeam(title) {
    if (!title) return 'Home Team';
    const parts = title.split(' vs ');
    return parts[0]?.trim() || 'Home Team';
}

function getAwayTeam(title) {
    if (!title) return 'Away Team';
    const parts = title.split(' vs ');
    return parts[1]?.trim() || 'Away Team';
}

function formatEventDate(dateString) {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${dayName} ${day} ${month} • ${hours}:${minutes}`;
}

function handleNewsletterSubscription(event) {
    event.preventDefault();
    const emailInput = document.querySelector('input[type="email"]');
    const email = emailInput?.value?.trim() || '';
    const button = event.target;
    
    if (!email || !email.includes('@') || !email.includes('.')) {
        showToast('Please enter a valid email address', 'error');
        emailInput?.focus();
        return;
    }
    
    const originalText = button.textContent;
    button.textContent = 'Subscribing...';
    button.disabled = true;
    
    setTimeout(() => {
        showToast('Thank you for subscribing! 📧', 'success');
        if (emailInput) emailInput.value = '';
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
}

function setupErrorBoundary() {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showToast('Chill bro, it\'s just a test.', 'error');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showToast('Network error occurred. Please check your connection.', 'error');
    });
}

async function loadLeagues() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/leagues`);
        if (!response.ok) throw new Error('Failed to fetch leagues');
        
        const leagues = await response.json();
        updateLeagueSelect(leagues);
        
        if (leagueSelect) {
            leagueSelect.classList.add('animate-pulse');
            setTimeout(() => leagueSelect.classList.remove('animate-pulse'), 500);
        }
    } catch (error) {
        console.error('Error loading leagues:', error);
        loadFallbackLeagues();
    }
}

function loadFallbackLeagues() {
    const fallbackLeagues = {
        'premier-league': { name: 'Premier League' },
        'la-liga': { name: 'La Liga' },
        'bundesliga': { name: 'Bundesliga' },
        'serie-a': { name: 'Serie A' },
        'ligue-1': { name: 'Ligue 1' },
        'champions-league': { name: 'Champions League' }
    };
    updateLeagueSelect(fallbackLeagues);
    showToast('Loaded offline league data', 'info');
}

function updateLeagueSelect(leagues) {
    if (!leagueSelect) return;
    
    leagueSelect.innerHTML = '<option value="">🏆 Select League</option>';
    Object.entries(leagues).forEach(([key, league]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = league.name;
        leagueSelect.appendChild(option);
    });
    
    leagueSelect.classList.add('transition-all', 'duration-200', 'hover:border-blue-500', 
                              'focus:border-blue-500', 'focus:ring-2', 'focus:ring-blue-200');
}

function setupEventListeners() {
    if (leagueSelect) {
        leagueSelect.addEventListener('change', debounce(handleLeagueChange, 300));
        leagueSelect.addEventListener('focus', () => leagueSelect.classList.add('ring-2', 'ring-blue-200'));
        leagueSelect.addEventListener('blur', () => leagueSelect.classList.remove('ring-2', 'ring-blue-200'));
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
        
        // Add Enter key support for search
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && 
                (event.target === leagueSelect || 
                 event.target === teamSelect || 
                 event.target.type === 'date')) {
                event.preventDefault();
                handleSearch();
            }
        });
    }
    
    // Mobile menu functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('animate-fade-in');
            } else {
                mobileMenu.classList.add('animate-fade-out');
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('animate-fade-out');
                }, 200);
            }
        });
    }
    
    // Newsletter subscription
    const subscribeButton = document.querySelector('.bg-blue-700 button, [onclick*="newsletter"]');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', handleNewsletterSubscription);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (mobileMenu && 
            !mobileMenu.contains(event.target) && 
            !mobileMenuButton?.contains(event.target)) {
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
}

async function handleLeagueChange() {
    const selectedLeague = leagueSelect.value;
    
    if (!selectedLeague) {
        if (teamSelect) {
            teamSelect.innerHTML = '<option value="">⚽ Select Team</option>';
            teamSelect.disabled = true;
        }
        return;
    }
    
    showLoadingSpinner(teamSelect?.parentElement || document.body, 'Loading teams...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/events/league/${selectedLeague}`);
        if (!response.ok) throw new Error('Failed to fetch league events');
        
        const events = await response.json();
        updateTeamSelect(events);
        showToast(`Loaded teams for ${selectedLeague.replace('-', ' ')}`, 'success');
    } catch (error) {
        console.error('Error loading league events:', error);
        showToast('Failed to load teams. Please try again.', 'error');
        loadFallbackTeams(selectedLeague);
    } finally {
        hideLoadingSpinner();
    }
}

function loadFallbackTeams(league) {
    const fallbackTeams = {
        'premier-league': ['Manchester United', 'Liverpool', 'Chelsea', 'Arsenal', 'Manchester City', 'Tottenham'],
        'la-liga': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia'],
        'bundesliga': ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen'],
        'serie-a': ['Juventus', 'AC Milan', 'Inter Milan', 'Napoli', 'AS Roma'],
        'ligue-1': ['PSG', 'Marseille', 'Lyon', 'Monaco', 'Lille']
    };
    
    const teams = fallbackTeams[league] || [];
    updateTeamSelectWithArray(teams);
}

function updateTeamSelect(events) {
    if (!teamSelect) return;
    
    teamSelect.innerHTML = '<option value="">⚽ Select Team</option>';
    teamSelect.disabled = false;
    
    const teams = new Set();
    events.forEach(event => {
        const homeTeam = getHomeTeam(event.title);
        const awayTeam = getAwayTeam(event.title);
        if (homeTeam !== 'Home Team') teams.add(homeTeam);
        if (awayTeam !== 'Away Team') teams.add(awayTeam);
    });
    
    Array.from(teams).sort().forEach(team => {
        const option = document.createElement('option');
        option.value = team.toLowerCase().replace(/\s+/g, '-');
        option.textContent = team;
        teamSelect.appendChild(option);
    });
    
    teamSelect.classList.add('transition-all', 'duration-200');
}

function updateTeamSelectWithArray(teams) {
    if (!teamSelect) return;
    
    teamSelect.innerHTML = '<option value="">⚽ Select Team</option>';
    teamSelect.disabled = false;
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.toLowerCase().replace(/\s+/g, '-');
        option.textContent = team;
        teamSelect.appendChild(option);
    });
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const stats = await response.json();
        updateStatsDisplay(stats);
        animateStats();
    } catch (error) {
        console.error('Error loading stats:', error);
        loadFallbackStats();
    }
}

function loadFallbackStats() {
    const fallbackStats = {
        totalMatches: 150,
        totalTicketsSold: 25000,
        upcomingMatches: 45,
        activeUsers: 5000
    };
    updateStatsDisplay(fallbackStats);
    animateStats();
}

function updateStatsDisplay(stats) {
    const statsElements = document.querySelectorAll('[data-stat]');
    statsElements.forEach(element => {
        const statType = element.getAttribute('data-stat');
        if (stats[statType] !== undefined) {
            element.textContent = formatStatNumber(stats[statType]);
        }
    });
}

function formatStatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function animateStats() {
    const statsElements = document.querySelectorAll('[data-stat]');
    statsElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

function loadStaticFeaturedMatches() {
    const staticEvents = [
        {
            id: 1,
            title: "Manchester United vs Liverpool",
            venue: "Old Trafford, Manchester",
            eventDate: "2025-08-20T16:30:00Z",
            price: 95,
            league: "Premier League",
            imageUrl: null,
            homeTeamLogo: "/images/logos/manchester-united.png",
            awayTeamLogo: "/images/logos/liverpool.png"
        },
        {
            id: 2,
            title: "Chelsea vs Arsenal",
            venue: "Stamford Bridge, London",
            eventDate: "2025-08-22T15:00:00Z",
            price: 85,
            league: "Premier League",
            imageUrl: null,
            homeTeamLogo: "/images/logos/chelsea.png",
            awayTeamLogo: "/images/logos/arsenal.png"
        },
        {
            id: 3,
            title: "Manchester City vs Tottenham",
            venue: "Etihad Stadium, Manchester",
            eventDate: "2025-08-25T14:00:00Z",
            price: 75,
            league: "Premier League",
            imageUrl: null,
            homeTeamLogo: "/images/logos/manchester-city.png",
            awayTeamLogo: "/images/logos/tottenham.png"
        }
    ];
    
    updateFeaturedMatches(staticEvents);
    showToast('Displaying sample matches', 'info');
}

// Debounce utility function
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

// Enhanced CSS styles
function injectStyles() {
    const enhancedStyles = document.createElement('style');
    enhancedStyles.textContent = `
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-fade-out {
            animation: fadeOut 0.2s ease-in forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        
        .user-authenticated .match-card {
            border-left: 3px solid #3b82f6;
        }
        
        .match-card:hover .group-hover\\:opacity-100 {
            opacity: 1;
        }
        
        select:focus, input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            border-color: #3b82f6;
        }
        
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0f0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        button {
            position: relative;
            overflow: hidden;
        }
        
        button:active {
            transform: scale(0.98);
        }
        
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
        
        img {
            max-width: 100%;
            height: auto;
        }
        
        .object-contain {
            object-fit: contain !important;
        }
    `;
    document.head.appendChild(enhancedStyles);
}

// Navigation & Authentication Functions
function updateNavigation() {
    // Check both sessionStorage and localStorage for tokens
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
    const username = sessionStorage.getItem('username') || localStorage.getItem('username');

    const signInBtn = document.getElementById('login-link');

    if (token && username) {
        // Remove existing sign in button
        if (signInBtn && signInBtn.parentElement) {
            signInBtn.parentElement.remove();
        }

        // Create user menu
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

        const signInContainer = document.querySelector('.flex.items-center');
        if (signInContainer) {
            signInContainer.innerHTML = '';
            signInContainer.appendChild(userMenu);
        }

        // Setup dropdown functionality
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');

        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                userDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.add('hidden');
                }
            });
        }
    }
}

function handleLogout() {
    // Clear all authentication data
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userRole');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Initialize error boundary and styles
setupErrorBoundary();
injectStyles();

// Make functions globally available
window.toggleFavorite = toggleFavorite;
window.shareEvent = shareEvent;
window.handleBuyTickets = handleBuyTickets;
window.handleLogout = handleLogout;