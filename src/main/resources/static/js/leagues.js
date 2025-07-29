// FootballTix Leagues Page Integration
const API_BASE_URL = '/api';

// DOM Elements
const leaguesGrid = document.getElementById('leagues-grid');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');

// Filter buttons
const allFilter = document.getElementById('all-filter');
const activeFilter = document.getElementById('active-filter');
const englandFilter = document.getElementById('england-filter');
const spainFilter = document.getElementById('spain-filter');
const germanyFilter = document.getElementById('germany-filter');
const italyFilter = document.getElementById('italy-filter');
const franceFilter = document.getElementById('france-filter');

// View buttons
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');

// Stats elements
const totalLeagues = document.getElementById('total-leagues');
const activeLeagues = document.getElementById('active-leagues');
const totalTeams = document.getElementById('total-teams');
const totalEvents = document.getElementById('total-events');

// Global variables
let allLeagues = [];
let currentFilter = 'all';
let currentView = 'grid';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeLeaguesPage();
});

async function initializeLeaguesPage() {
    try {
        // Load leagues
        await loadLeagues();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing leagues page:', error);
        showError('Failed to load leagues. Please try again.');
    }
}

async function loadLeagues() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/leagues`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch leagues');
        }
        
        const leagues = await response.json();
        allLeagues = leagues;
        
        updateStats(leagues);
        displayLeagues(leagues);
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading leagues:', error);
        showError('Failed to load leagues. Please try again.');
        hideLoading();
    }
}

function displayLeagues(leagues) {
    if (!leaguesGrid) return;
    
    if (leagues.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    leaguesGrid.innerHTML = leagues.map(league => `
        <div class="league-card bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:scale-105">
            <div class="relative">
                <div class="league-banner h-48 bg-gradient-to-r from-blue-600 to-blue-800" 
                     style="background-image: url('${league.bannerUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 200\'%3E%3Crect width=\'400\' height=\'200\' fill=\'%231e40af\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'white\' font-size=\'24\' font-family=\'Arial\'%3E${league.name}%3C/text%3E%3C/svg%3E'}')">
                    <div class="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div class="absolute bottom-4 left-4 right-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                <img src="${league.logoUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 48 48\'%3E%3Ccircle cx=\'24\' cy=\'24\' r=\'20\' fill=\'%231e40af\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'white\' font-size=\'12\' font-family=\'Arial\'%3E${league.name.charAt(0)}%3C/text%3E%3C/svg%3E'}" 
                                     alt="${league.name}" class="w-8 h-8 object-contain">
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-white">${league.name}</h3>
                                <p class="text-blue-100 text-sm">${league.country}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-6">
                <div class="mb-4">
                    <p class="text-gray-600 text-sm line-clamp-3">${league.description}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${league.totalTeams}</div>
                        <div class="text-xs text-gray-500">Teams</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${league.foundedYear}</div>
                        <div class="text-xs text-gray-500">Founded</div>
                    </div>
                </div>
                
                <div class="space-y-2 mb-6">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Season:</span>
                        <span class="font-medium">${league.seasonStart} - ${league.seasonEnd}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Status:</span>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${league.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${league.status}
                        </span>
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="viewLeagueDetails(${league.id})" 
                            class="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                        View Details
                    </button>
                    <button onclick="viewLeagueEvents(${league.id})" 
                            class="px-4 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
                        Events
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Filter functionality
    if (allFilter) {
        allFilter.addEventListener('click', () => setFilter('all'));
    }
    
    if (activeFilter) {
        activeFilter.addEventListener('click', () => setFilter('active'));
    }
    
    if (englandFilter) {
        englandFilter.addEventListener('click', () => setFilter('england'));
    }
    
    if (spainFilter) {
        spainFilter.addEventListener('click', () => setFilter('spain'));
    }
    
    if (germanyFilter) {
        germanyFilter.addEventListener('click', () => setFilter('germany'));
    }
    
    if (italyFilter) {
        italyFilter.addEventListener('click', () => setFilter('italy'));
    }
    
    if (franceFilter) {
        franceFilter.addEventListener('click', () => setFilter('france'));
    }
    
    // View toggle
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => setViewMode('list'));
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchLeagues();
            }
        });
    }
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update filter button styles
    const filterButtons = [allFilter, activeFilter, englandFilter, spainFilter, germanyFilter, italyFilter, franceFilter];
    const filterNames = ['all', 'active', 'england', 'spain', 'germany', 'italy', 'france'];
    
    filterButtons.forEach((btn, index) => {
        if (btn) {
            if (filterNames[index] === filter) {
                btn.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium';
            } else {
                btn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium';
            }
        }
    });
    
    // Filter leagues
    let filteredLeagues = allLeagues;
    
    if (filter === 'active') {
        filteredLeagues = allLeagues.filter(league => league.status === 'ACTIVE');
    } else if (filter === 'england') {
        filteredLeagues = allLeagues.filter(league => league.country === 'England');
    } else if (filter === 'spain') {
        filteredLeagues = allLeagues.filter(league => league.country === 'Spain');
    } else if (filter === 'germany') {
        filteredLeagues = allLeagues.filter(league => league.country === 'Germany');
    } else if (filter === 'italy') {
        filteredLeagues = allLeagues.filter(league => league.country === 'Italy');
    } else if (filter === 'france') {
        filteredLeagues = allLeagues.filter(league => league.country === 'France');
    }
    
    displayLeagues(filteredLeagues);
}

function setViewMode(mode) {
    currentView = mode;
    
    if (mode === 'grid') {
        leaguesGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
        gridViewBtn.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium';
        listViewBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium';
    } else {
        leaguesGrid.className = 'space-y-6';
        gridViewBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium';
        listViewBtn.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium';
    }
}

async function searchLeagues() {
    const query = searchInput.value.trim();
    
    if (!query) {
        displayLeagues(allLeagues);
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/leagues/search?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('Failed to search leagues');
        }
        
        const leagues = await response.json();
        displayLeagues(leagues);
        
        hideLoading();
        
    } catch (error) {
        console.error('Error searching leagues:', error);
        showError('Failed to search leagues. Please try again.');
        hideLoading();
    }
}

function viewLeagueDetails(leagueId) {
    // Show league details modal
    showLeagueDetailsModal(leagueId);
}

function viewLeagueEvents(leagueId) {
    // Redirect to events page with league filter
    window.location.href = `events.html?league=${leagueId}`;
}

async function showLeagueDetailsModal(leagueId) {
    try {
        const response = await fetch(`${API_BASE_URL}/leagues/${leagueId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch league details');
        }
        
        const league = await response.json();
        
        // Get event count for this league
        const eventCountResponse = await fetch(`${API_BASE_URL}/leagues/${leagueId}/events/count`);
        const eventCountData = await eventCountResponse.json();
        
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="relative">
                        <div class="league-banner h-64 bg-gradient-to-r from-blue-600 to-blue-800" 
                             style="background-image: url('${league.bannerUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 300\'%3E%3Crect width=\'800\' height=\'300\' fill=\'%231e40af\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'white\' font-size=\'48\' font-family=\'Arial\'%3E${league.name}%3C/text%3E%3C/svg%3E'}')">
                            <div class="absolute inset-0 bg-black bg-opacity-40"></div>
                            <div class="absolute bottom-6 left-6 right-6">
                                <div class="flex items-center space-x-4">
                                    <div class="w-20 h-20 bg-white rounded-xl flex items-center justify-center">
                                        <img src="${league.logoUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 80 80\'%3E%3Ccircle cx=\'40\' cy=\'40\' r=\'35\' fill=\'%231e40af\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'white\' font-size=\'24\' font-family=\'Arial\'%3E${league.name.charAt(0)}%3C/text%3E%3C/svg%3E'}" 
                                             alt="${league.name}" class="w-12 h-12 object-contain">
                                    </div>
                                    <div>
                                        <h2 class="text-3xl font-bold text-white">${league.name}</h2>
                                        <p class="text-blue-100 text-lg">${league.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onclick="closeModal()" class="absolute top-4 right-4 text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 class="text-lg font-semibold mb-3">League Information</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Founded:</span>
                                        <span class="font-medium">${league.foundedYear}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Total Teams:</span>
                                        <span class="font-medium">${league.totalTeams}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Season:</span>
                                        <span class="font-medium">${league.seasonStart} - ${league.seasonEnd}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Status:</span>
                                        <span class="px-2 py-1 rounded-full text-xs font-medium ${league.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            ${league.status}
                                        </span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Total Events:</span>
                                        <span class="font-medium">${eventCountData.eventCount}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold mb-3">Description</h3>
                                <p class="text-gray-600 leading-relaxed">${league.description}</p>
                            </div>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="viewLeagueEvents(${league.id})" 
                                    class="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
                                View Events
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
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('Error fetching league details:', error);
        showError('Failed to load league details. Please try again.');
    }
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

function updateStats(leagues) {
    const total = leagues.length;
    const active = leagues.filter(l => l.status === 'ACTIVE').length;
    const totalTeamsCount = leagues.reduce((sum, l) => sum + (l.totalTeams || 0), 0);
    
    // For demo purposes, we'll estimate total events based on leagues
    const totalEventsCount = total * 15; // Average 15 events per league
    
    if (totalLeagues) totalLeagues.textContent = total;
    if (activeLeagues) activeLeagues.textContent = active;
    if (totalTeams) totalTeams.textContent = totalTeamsCount;
    if (totalEvents) totalEvents.textContent = totalEventsCount;
}

// Utility functions
function showLoading() {
    if (loadingState) loadingState.classList.remove('hidden');
    if (leaguesGrid) leaguesGrid.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}

function hideLoading() {
    if (loadingState) loadingState.classList.add('hidden');
    if (leaguesGrid) leaguesGrid.classList.remove('hidden');
}

function showError(message) {
    if (errorState) {
        errorState.querySelector('.text-red-600').textContent = message;
        errorState.classList.remove('hidden');
    }
    if (loadingState) loadingState.classList.add('hidden');
    if (leaguesGrid) leaguesGrid.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
}

function showEmptyState() {
    if (emptyState) emptyState.classList.remove('hidden');
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (leaguesGrid) leaguesGrid.classList.add('hidden');
}

function hideEmptyState() {
    if (emptyState) emptyState.classList.add('hidden');
    if (leaguesGrid) leaguesGrid.classList.remove('hidden');
}

// Add CSS for line-clamp utility
const style = document.createElement('style');
style.textContent = `
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
document.head.appendChild(style); 