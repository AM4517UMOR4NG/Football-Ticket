// FootballTix - Events Page JavaScript

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    updateNavigation();
    initializeEventsPage();
    checkWishlistStatus();
});

/* --------------------- Navigation & Auth --------------------- */
function updateNavigation() {
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
        <button id="user-menu-btn" class="flex items-center space-x-2 text-black hover:text-blue-700">
            <span class="text-sm font-medium">${username}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>
        <div id="user-dropdown" class="hidden absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            ${userRole === 'ADMIN' ? '<a href="admin-dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Dashboard</a>' : ''}
                        <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
            <a href="#" onclick="handleLogout()" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</a>
        </div>
    </div>
`;

        const signInContainer = document.querySelector('.flex.items-center');
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

function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

// FootballTix Events Page Integration
const API_BASE_URL = '/api';
// DOM Elements
const matchesGrid = document.getElementById('matches-grid');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');
const leagueFilter = document.getElementById('league-filter');
const searchInput = document.getElementById('search-input');
const dateFilter = document.getElementById('date-filter');
const searchBtn = document.getElementById('search-btn');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');
// Stats elements
const totalEvents = document.getElementById('total-events');
const upcomingEvents = document.getElementById('upcoming-events');
const totalSeats = document.getElementById('total-seats');
const avgPrice = document.getElementById('avg-price');
async function initializeEventsPage() {
    try {
        console.log('Initializing events page...');

        // Wait a bit for DOM elements to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Load leagues first
        await loadLeagues();

        // Check for search parameters
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');

        if (searchParam) {
            // Display search results
            const searchResults = JSON.parse(decodeURIComponent(searchParam));
            displayEvents(searchResults);
        } else {
            // Load all events
            await loadAllEvents();
        }

        // Load stats
        await loadStats();

        // Setup event listeners
        setupEventListeners();

        console.log('Events page initialized successfully');

    } catch (error) {
        console.error('Error initializing events page:', error);
        showError('Failed to load events. Please try again.');
    }
}
async function loadLeagues() {
    try {
        console.log('Loading leagues...');

        // Try the new endpoint first
        let response = await fetch(`${API_BASE_URL}/leagues/all`);
        if (!response.ok) {
            // Fallback to events/leagues endpoint
            response = await fetch(`${API_BASE_URL}/events/leagues`);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const leagues = await response.json();
        console.log('Leagues loaded:', leagues);
        populateLeagueFilter(leagues);
    } catch (error) {
        console.error('Error loading leagues:', error);
        // Fallback to static leagues if API fails
        console.log('Using fallback static leagues');
        populateLeagueFilter(getStaticLeagues());
    }
}
function populateLeagueFilter(leagues) {
    // Try to find the league filter element
    let leagueFilterElement = document.getElementById('league-filter');

    if (!leagueFilterElement) {
        console.warn('League filter element not found, creating fallback...');
        // Try to find any select element that might be the league filter
        const selectElements = document.querySelectorAll('select');
        for (let select of selectElements) {
            if (select.options.length > 0 && select.options[0].textContent.includes('League')) {
                leagueFilterElement = select;
                console.log('Found league filter by content:', select);
                break;
            }
        }
    }

    if (!leagueFilterElement) {
        console.error('League filter element not found and no fallback available');
        return;
    }

    console.log('Populating league filter with:', leagues);

    // Clear existing options except "All Leagues"
    leagueFilterElement.innerHTML = '<option value="">All Leagues</option>';

    // Add league options
    if (leagues && typeof leagues === 'object') {
        Object.entries(leagues).forEach(([key, league]) => {
            const option = document.createElement('option');
            option.value = key;

            // Handle different league object formats
            if (typeof league === 'object' && league.name) {
                option.textContent = league.name;
            } else if (typeof league === 'string') {
                option.textContent = league;
            } else {
                option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            }

            leagueFilterElement.appendChild(option);
            console.log('Added league option:', key, option.textContent);
        });
    } else {
        console.error('Invalid leagues data:', leagues);
    }

    console.log('League filter populated with', leagueFilterElement.children.length, 'options');
}
function getStaticLeagues() {
    return {
        "premier": { name: "Premier League", country: "England", color: "blue" },
        "laliga": { name: "La Liga", country: "Spain", color: "red" },
        "bundesliga": { name: "Bundesliga", country: "Germany", color: "green" },
        "seriea": { name: "Serie A", country: "Italy", color: "blue" },
        "ligue1": { name: "Ligue 1", country: "France", color: "purple" },
        "champions": { name: "Champions League", country: "Europe", color: "gold" }
    };
}
async function loadAllEvents() {
    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');

        const events = await response.json();
        displayEvents(events);

        hideLoading();
    } catch (error) {
        console.error('Error loading events:', error);
        showError('Failed to load events. Please try again.');
        hideLoading();
    }
}
function displayEvents(events) {
    if (!matchesGrid) return;

    if (events.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    matchesGrid.innerHTML = events.map(event => `
        <div class="match-card bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:scale-105">
            <div class="relative">
                <!-- Event Image -->
                <div class="h-48 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
                    ${event.imageUrl ? `
                        <img src="${event.imageUrl}" alt="${event.title}"
                             class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    ` : `
                        <div class="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                            <svg class="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                            </svg>
                        </div>
                    `}
                   
                    <!-- League Badge -->
                    <div class="absolute top-4 left-4">
                        <div class="league-badge px-3 py-1 rounded-full text-xs font-medium text-white bg-white/20 backdrop-blur-sm">
                            ${getLeagueShortName(event)}
                        </div>
                    </div>
                   
                    <!-- Date Badge -->
                    <div class="absolute top-4 right-4">
                        <div class="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                            ${formatEventDate(event.eventDate)}
                        </div>
                    </div>
                   
                    <!-- Team Icons -->
                    <div class="absolute bottom-4 left-4 flex space-x-2">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                            </svg>
                        </div>
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
           
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">${event.title}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3">${event.description}</p>
               
                <!-- Match Details -->
                <div class="space-y-3 mb-6">
                    <div class="flex items-center text-gray-500 text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        ${event.venue}
                    </div>
                    <div class="flex items-center text-gray-500 text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${formatEventTime(event.eventDate)}
                    </div>
                    <div class="flex items-center text-gray-500 text-sm">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        ${event.totalSeats.toLocaleString()} seats available
                    </div>
                </div>
               
                <!-- Price and Actions -->
                <div class="flex items-center justify-between mb-4">
                    <div class="text-3xl font-bold text-green-600">£${event.price}</div>
                    <div class="text-sm text-gray-500">per ticket</div>
                </div>
               
                <div class="flex space-x-3">
                    <button onclick="handleBookEvent(${event.id}, '${event.title}')"
                            class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                        Book Now
                    </button>
                    <button onclick="addToWishlist(${event.id})" 
                            class="wishlist-btn px-4 py-3 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-all duration-200"
                            title="Add to Wishlist">
                        <i class="far fa-heart"></i>
                    </button>
                    <button onclick="handleViewDetails(${event.id})"
                            class="px-4 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                        Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
function setupEventListeners() {
    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Filter functionality
    if (leagueFilter) {
        leagueFilter.addEventListener('change', handleFilter);
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', handleFilter);
    }

    // View toggle
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    }

    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => setViewMode('list'));
    }

    // Enter key on search input
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Setup autocomplete
    setupAutocomplete();
}
async function handleSearch() {
    const query = searchInput ? searchInput.value.trim() : '';
    const league = leagueFilter ? leagueFilter.value.trim() : '';
    const date = dateFilter ? dateFilter.value.trim() : '';

    try {
        showLoading();

        let url = `${API_BASE_URL}/events/search?`;
        if (query) url += `query=${encodeURIComponent(query)}&`;
        if (league) url += `league=${encodeURIComponent(league)}&`;
        if (date) url += `date=${encodeURIComponent(date)}&`;

        // Remove trailing '&' if present
        if (url.endsWith('&')) {
            url = url.slice(0, -1);
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to search events: ${response.status}`);

        const events = await response.json();
        displayEvents(events);

        hideLoading();
    } catch (error) {
        console.error('Error searching events:', error);
        showError('Search failed. Please try again later.');
        hideLoading();
    }
}
async function handleFilter() {
    await handleSearch();
}
function setViewMode(mode) {
    if (mode === 'grid') {
        matchesGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
        gridViewBtn.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium';
        listViewBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium';
    } else {
        matchesGrid.className = 'space-y-6';
        gridViewBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium';
        listViewBtn.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium';
    }
}
function handleBookEvent(eventId, eventTitle) {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Please log in to book tickets.');
        window.location.href = 'login.html';
        return;
    }

    // Redirect to booking page
    window.location.href = `book-tickets.html?eventId=${eventId}&eventTitle=${encodeURIComponent(eventTitle)}`;
}
function handleViewDetails(eventId) {
    // Show event details in a modal
    showEventDetailsModal(eventId);
}
async function showEventDetailsModal(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event details');

        const event = await response.json();

        // Create modal HTML
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
                        <div class="flex justify-between items-start">
                            <div>
                                <h2 class="text-2xl font-bold mb-2">${event.title}</h2>
                                <p class="text-blue-100">${getLeagueFromEvent(event)}</p>
                            </div>
                            <button onclick="closeModal()" class="text-white hover:text-gray-200">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-700 mb-6">${event.description}</p>
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <div class="text-sm text-gray-500">Venue</div>
                                <div class="font-medium">${event.venue}</div>
                            </div>
                            <div>
                                <div class="text-sm text-gray-500">Date & Time</div>
                                <div class="font-medium">${formatEventDate(event.eventDate)}</div>
                            </div>
                            <div>
                                <div class="text-sm text-gray-500">Available Seats</div>
                                <div class="font-medium">${event.totalSeats.toLocaleString()}</div>
                            </div>
                            <div>
                                <div class="text-sm text-gray-500">Price</div>
                                <div class="font-medium text-green-600">£${event.price}</div>
                            </div>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="handleBookEvent(${event.id}, '${event.title}')"
                                    class="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium">
                                Book Tickets
                            </button>
                            <button onclick="closeModal()"
                                    class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

    } catch (error) {
        console.error('Error showing event details:', error);
        alert('Failed to load event details');
    }
}
function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');

        const stats = await response.json();
        updateStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
function updateStats(stats) {
    if (totalEvents) totalEvents.textContent = stats.totalEvents || 0;
    if (upcomingEvents) upcomingEvents.textContent = stats.upcomingEvents || 0;
    if (totalSeats) totalSeats.textContent = stats.totalSeats ? stats.totalSeats.toLocaleString() : 0;
    if (avgPrice) avgPrice.textContent = stats.averagePrice ? `£${Math.round(stats.averagePrice)}` : '£0';
}
// Advanced league detection with team mappings and cross-league logic
const teamToLeagueMap = {
    // Premier League teams
    'manchester city': 'Premier League',
    'manchester united': 'Premier League',
    'chelsea': 'Premier League',
    'arsenal': 'Premier League',
    'liverpool': 'Premier League',
    'tottenham': 'Premier League',
    'everton': 'Premier League',
    'west ham': 'Premier League',
    'aston villa': 'Premier League',
    'newcastle': 'Premier League',
    // La Liga teams
    'real madrid': 'La Liga',
    'barcelona': 'La Liga',
    'atletico madrid': 'La Liga',
    'sevilla': 'La Liga',
    'valencia': 'La Liga',
    'real sociedad': 'La Liga',
    'villarreal': 'La Liga',
    // Bundesliga teams
    'bayern munich': 'Bundesliga',
    'borussia dortmund': 'Bundesliga',
    'rb leipzig': 'Bundesliga',
    'bayer leverkusen': 'Bundesliga',
    'wolfsburg': 'Bundesliga',
    // Serie A teams
    'juventus': 'Serie A',
    'inter milan': 'Serie A',
    'ac milan': 'Serie A',
    'napoli': 'Serie A',
    'roma': 'Serie A',
    'lazio': 'Serie A',
    // Ligue 1 teams
    'psg': 'Ligue 1',
    'paris saint-germain': 'Ligue 1',
    'marseille': 'Ligue 1',
    'lyon': 'Ligue 1',
    'monaco': 'Ligue 1',
    'lille': 'Ligue 1'
};
function getLeagueFromEvent(event) {
    const title = event.title.toLowerCase().trim();
    const venue = event.venue.toLowerCase();
    // First, check for explicit Champions League mentions (fixed typo)
    if (title.includes('champions league')) {
        return 'Champions League';
    }
    // Extract teams from title (assuming format like "Team A vs Team B")
    const vsMatch = title.match(/(.+?)\s+vs\s+(.+)/i);
    if (vsMatch) {
        const teamA = vsMatch[1].trim().toLowerCase();
        const teamB = vsMatch[2].trim().toLowerCase();
        const leagueA = teamToLeagueMap[teamA] || detectLeagueFromKeywords(teamA, venue);
        const leagueB = teamToLeagueMap[teamB] || detectLeagueFromKeywords(teamB, venue);
        // If teams are from different leagues, assume European competition (Champions League)
        if (leagueA && leagueB && leagueA !== leagueB) {
            return 'Champions League';
        }
        // If same league, return that league
        if (leagueA) return leagueA;
        if (leagueB) return leagueB;
    }
    // Fallback to original keyword detection
    return detectLeagueFromKeywords(title, venue);
}
function detectLeagueFromKeywords(title, venue) {
    if (title.includes('manchester') || title.includes('chelsea') || title.includes('arsenal') ||
        title.includes('liverpool') || title.includes('tottenham') || venue.includes('london') ||
        venue.includes('manchester')) {
        return 'Premier League';
    } else if (title.includes('madrid') || title.includes('barcelona') || title.includes('atletico')) {
        return 'La Liga';
    } else if (title.includes('bayern') || title.includes('dortmund') || title.includes('leipzig')) {
        return 'Bundesliga';
    } else if (title.includes('milan') || title.includes('juventus') || title.includes('napoli')) {
        return 'Serie A';
    } else if (title.includes('psg') || title.includes('marseille') || title.includes('lyon')) {
        return 'Ligue 1';
    }
    return 'Football Match';
}
// Team list for autocomplete from teamToLeagueMap
const teams = Object.keys(teamToLeagueMap).map(team => team.charAt(0).toUpperCase() + team.slice(1));
// Setup autocomplete
function setupAutocomplete() {
    const searchInput = document.getElementById('search-input');
    const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
    if (!searchInput || !autocompleteDropdown) return;
    searchInput.addEventListener('input', function () {
        const value = this.value.toLowerCase().trim();
        autocompleteDropdown.innerHTML = '';
        if (!value) {
            autocompleteDropdown.classList.add('hidden');
            return;
        }
        const suggestions = teams.filter(team => team.toLowerCase().includes(value));
        if (suggestions.length === 0) {
            autocompleteDropdown.classList.add('hidden');
            return;
        }
        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'px-4 py-2 text-gray-800 hover:bg-blue-100 cursor-pointer';
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                searchInput.value = suggestion;
                autocompleteDropdown.classList.add('hidden');
                handleSearch();
            });
            autocompleteDropdown.appendChild(div);
        });
        autocompleteDropdown.classList.remove('hidden');
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
            autocompleteDropdown.classList.add('hidden');
        }
    });
}
function getLeagueShortName(event) {
    const league = getLeagueFromEvent(event);
    const shortNames = {
        'Premier League': 'PL',
        'La Liga': 'LL',
        'Bundesliga': 'BL',
        'Serie A': 'SA',
        'Ligue 1': 'L1',
        'Champions League': 'CL'
    };
    return shortNames[league] || 'FB';
}
function formatEventDate(dateString) {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
}
// Team logo mapping - same as in index.js
function getTeamLogo(teamName) {
    if (!teamName) return null;
    
    const teamLogos = {
        // Premier League
        'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png',
        'Man Utd': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png',
        'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png',
        'Chelsea': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png',
        'Arsenal': 'https://upload.wikimedia.org/wikipedia/id/thumb/5/53/Arsenal_FC.svg/1020px-Arsenal_FC.svg.png',
        'Manchester City': 'https://upload.wikimedia.org/wikipedia/id/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
        'Man City': 'https://upload.wikimedia.org/wikipedia/id/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
        'Tottenham': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png',
        'Tottenham Hotspur': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png',
        // La Liga
        'Real Madrid': 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
        'Barcelona': 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
        'Atletico Madrid': 'https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png',
        'Sevilla': 'https://logos-world.net/wp-content/uploads/2020/06/Sevilla-Logo.png',
        // Bundesliga
        'Bayern Munich': 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png',
        'Borussia Dortmund': 'https://logos-world.net/wp-content/uploads/2020/06/Borussia-Dortmund-Logo.png',
        'RB Leipzig': 'https://logos-world.net/wp-content/uploads/2020/06/RB-Leipzig-Logo.png',
        'Bayer Leverkusen': 'https://logos-world.net/wp-content/uploads/2020/06/Bayer-Leverkusen-Logo.png',
        // Serie A
        'AC Milan': 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png',
        'Inter Milan': 'https://logos-world.net/wp-content/uploads/2020/06/Inter-Milan-Logo.png',
        'Juventus': 'https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png',
        'Napoli': 'https://logos-world.net/wp-content/uploads/2020/06/Napoli-Logo.png',
        // Ligue 1
        'Paris Saint-Germain': 'https://logos-world.net/wp-content/uploads/2020/06/Paris-Saint-Germain-Logo.png',
        'PSG': 'https://logos-world.net/wp-content/uploads/2020/06/Paris-Saint-Germain-Logo.png',
        'Marseille': 'https://logos-world.net/wp-content/uploads/2020/06/Olympique-Marseille-Logo.png',
        'Lyon': 'https://logos-world.net/wp-content/uploads/2020/06/Olympique-Lyon-Logo.png',
        'Monaco': 'https://logos-world.net/wp-content/uploads/2020/06/Monaco-Logo.png'
    };
    
    // Try exact match first
    if (teamLogos[teamName]) {
        return teamLogos[teamName];
    }
    
    // Try case-insensitive match
    const normalizedName = teamName.toLowerCase();
    for (const [key, value] of Object.entries(teamLogos)) {
        if (key.toLowerCase() === normalizedName) {
            return value;
        }
    }
    
    // Try partial match
    for (const [key, value] of Object.entries(teamLogos)) {
        if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
            return value;
        }
    }
    
    return null;
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

function formatEventTime(dateString) {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}
function showLoading() {
    if (loadingState) loadingState.classList.remove('hidden');
    if (matchesGrid) matchesGrid.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}
function hideLoading() {
    if (loadingState) loadingState.classList.add('hidden');
    if (matchesGrid) matchesGrid.classList.remove('hidden');
}
function showError(message) {
    if (errorState) {
        errorState.querySelector('.text-red-600').textContent = message;
        errorState.classList.remove('hidden');
    }
    if (loadingState) loadingState.classList.add('hidden');
    if (matchesGrid) matchesGrid.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}
function showEmptyState() {
    if (emptyState) emptyState.classList.remove('hidden');
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (matchesGrid) matchesGrid.classList.add('hidden');
}
function hideEmptyState() {
    if (emptyState) emptyState.classList.add('hidden');
    if (matchesGrid) matchesGrid.classList.remove('hidden');
}
// Add CSS for line-clamp utility
const style = document.createElement('style');
style.textContent = `
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .wishlist-btn {
        transition: all 0.3s ease;
    }
    
    .wishlist-btn:hover {
        transform: scale(1.05);
    }
    
    .wishlist-btn.added {
        background-color: #ef4444;
        color: white;
        border-color: #ef4444;
    }
    
    .wishlist-btn.added:hover {
        background-color: #dc2626;
        border-color: #dc2626;
    }
`;
document.head.appendChild(style);

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