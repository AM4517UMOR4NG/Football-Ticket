// Advanced FootballTix Leagues Page with Real-time Data
class FootballLeaguesManager {
    constructor() {
        this.API_BASE_URL = '/api';
        this.WS_URL = `ws://${window.location.host}/ws`;
        
        // State management
        this.state = {
            leagues: [],
            filteredLeagues: [],
            currentFilter: 'all',
            currentView: 'grid',
            searchQuery: '',
            isLoading: false,
            error: null,
            stats: {
                totalLeagues: 0,
                activeLeagues: 0,
                totalTeams: 0,
                totalEvents: 0
            }
        };
        
        // Cache and performance
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.searchDebounceTime = 300;
        this.searchTimeout = null;
        this.statsUpdateInterval = null;
        
        // WebSocket connection
        this.ws = null;
        this.wsReconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        
        // Performance optimization
        this.intersectionObserver = null;
        this.lazyLoadedImages = new Set();
        
        // DOM elements cache
        this.elements = {};
        
        this.init();
    }
    
    async init() {
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.initializeWebSocket();
            await this.loadLeagues();
            this.startRealTimeUpdates();
        } catch (error) {
            console.error('Error initializing leagues manager:', error);
            this.setState({ error: 'Failed to initialize page. Please refresh and try again.' });
        }
    }
    
    cacheElements() {
        const elementIds = [
            'leagues-grid', 'loading-state', 'error-state', 'empty-state',
            'search-input', 'all-filter', 'active-filter', 'england-filter',
            'spain-filter', 'germany-filter', 'italy-filter', 'france-filter',
            'grid-view', 'list-view', 'total-leagues', 'active-leagues',
            'total-teams', 'total-events'
        ];
        
        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }
    
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.onStateChange(prevState, this.state);
    }
    
    onStateChange(prevState, currentState) {
        // Update UI based on state changes
        if (prevState.isLoading !== currentState.isLoading) {
            this.toggleLoading(currentState.isLoading);
        }
        
        if (prevState.error !== currentState.error) {
            this.showError(currentState.error);
        }
        
        if (prevState.filteredLeagues !== currentState.filteredLeagues) {
            this.renderLeagues(currentState.filteredLeagues);
        }
        
        if (prevState.stats !== currentState.stats) {
            this.updateStatsDisplay(currentState.stats);
        }
    }
    
    setupEventListeners() {
        // Filter buttons
        const filterMapping = {
            'all-filter': 'all',
            'active-filter': 'active',
            'england-filter': 'england',
            'spain-filter': 'spain',
            'germany-filter': 'germany',
            'italy-filter': 'italy',
            'france-filter': 'france'
        };
        
        Object.entries(filterMapping).forEach(([elementId, filter]) => {
            const element = this.elements[elementId];
            if (element) {
                element.addEventListener('click', () => this.setFilter(filter));
            }
        });
        
        // View toggle
        if (this.elements['grid-view']) {
            this.elements['grid-view'].addEventListener('click', () => this.setViewMode('grid'));
        }
        
        if (this.elements['list-view']) {
            this.elements['list-view'].addEventListener('click', () => this.setViewMode('list'));
        }
        
        // Search with advanced debouncing
        if (this.elements['search-input']) {
            this.elements['search-input'].addEventListener('input', this.debounce(() => {
                this.performSearch();
            }, this.searchDebounceTime));
            
            this.elements['search-input'].addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(this.searchTimeout);
                    this.performSearch();
                }
            });
        }
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.elements['search-input']) {
                    this.elements['search-input'].focus();
                }
            }
        });
        
        // Modal backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeModal();
            }
        });
        
        // Online/offline detection
        window.addEventListener('online', () => {
            console.log('Connection restored');
            this.initializeWebSocket();
            this.refreshData();
        });
        
        window.addEventListener('offline', () => {
            console.log('Connection lost');
            this.closeWebSocket();
        });
        
        // Page visibility for performance optimization
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseRealTimeUpdates();
            } else {
                this.resumeRealTimeUpdates();
            }
        });
    }
    
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.lazyLoadImage(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );
    }
    
    lazyLoadImage(imgElement) {
        if (this.lazyLoadedImages.has(imgElement)) return;
        
        const src = imgElement.dataset.src;
        if (src) {
            imgElement.src = src;
            imgElement.removeAttribute('data-src');
            this.lazyLoadedImages.add(imgElement);
            this.intersectionObserver.unobserve(imgElement);
        }
    }
    
    async loadLeagues(useCache = true) {
        try {
            this.setState({ isLoading: true, error: null });
            
            const cacheKey = 'leagues';
            const cached = this.getFromCache(cacheKey);
            
            if (useCache && cached) {
                this.processLeaguesData(cached);
                return;
            }
            
            const response = await this.apiRequest('/leagues', {
                method: 'GET',
                headers: this.getDefaultHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const leagues = await response.json();
            this.validateLeaguesData(leagues);
            
            this.setCache(cacheKey, leagues);
            this.processLeaguesData(leagues);
            
        } catch (error) {
            console.error('Error loading leagues:', error);
            this.setState({ 
                error: `Failed to load leagues: ${error.message}`,
                isLoading: false 
            });
        }
    }
    
    processLeaguesData(leagues) {
        this.setState({
            leagues,
            filteredLeagues: this.filterLeagues(leagues, this.state.currentFilter),
            isLoading: false
        });
        
        this.calculateStats(leagues);
    }
    
    validateLeaguesData(leagues) {
        if (!Array.isArray(leagues)) {
            throw new Error('Invalid response format: expected array of leagues');
        }
        
        leagues.forEach((league, index) => {
            if (!league.id) {
                throw new Error(`League at index ${index} missing required 'id' field`);
            }
        });
    }
    
    async calculateStats(leagues) {
        const totalLeagues = leagues.length;
        const activeLeagues = leagues.filter(l => l.status === 'ACTIVE').length;
        const totalTeams = leagues.reduce((sum, l) => sum + (parseInt(l.totalTeams) || 0), 0);
        
        // Get real-time event count
        let totalEvents = 0;
        try {
            const eventResponse = await this.apiRequest('/events/count');
            if (eventResponse.ok) {
                const eventData = await eventResponse.json();
                totalEvents = eventData.totalEvents || 0;
            }
        } catch (error) {
            console.warn('Failed to fetch real-time event count:', error);
            // Fallback to estimation
            totalEvents = totalLeagues * 15;
        }
        
        this.setState({
            stats: {
                totalLeagues,
                activeLeagues,
                totalTeams,
                totalEvents
            }
        });
    }
    
    initializeWebSocket() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }
        
        try {
            this.ws = new WebSocket(this.WS_URL);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.wsReconnectAttempts = 0;
                
                // Subscribe to real-time updates
                this.ws.send(JSON.stringify({
                    type: 'subscribe',
                    topics: ['leagues', 'events', 'stats']
                }));
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.attemptReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'league_update':
                this.handleLeagueUpdate(data.payload);
                break;
            case 'event_count_update':
                this.handleEventCountUpdate(data.payload);
                break;
            case 'stats_update':
                this.handleStatsUpdate(data.payload);
                break;
            case 'league_created':
            case 'league_deleted':
                this.refreshData();
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }
    
    handleLeagueUpdate(payload) {
        const updatedLeague = payload.league;
        const leagues = this.state.leagues.map(league => 
            league.id === updatedLeague.id ? { ...league, ...updatedLeague } : league
        );
        
        this.setState({
            leagues,
            filteredLeagues: this.filterLeagues(leagues, this.state.currentFilter)
        });
        
        this.calculateStats(leagues);
    }
    
    handleEventCountUpdate(payload) {
        this.setState({
            stats: {
                ...this.state.stats,
                totalEvents: payload.totalEvents
            }
        });
    }
    
    handleStatsUpdate(payload) {
        this.setState({
            stats: {
                ...this.state.stats,
                ...payload
            }
        });
    }
    
    attemptReconnect() {
        if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
            this.wsReconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.wsReconnectAttempts - 1);
            
            console.log(`Attempting WebSocket reconnection ${this.wsReconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
            
            setTimeout(() => {
                this.initializeWebSocket();
            }, delay);
        }
    }
    
    closeWebSocket() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    
    startRealTimeUpdates() {
        // Update stats every 30 seconds as fallback
        this.statsUpdateInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.refreshStats();
            }
        }, 30000);
    }
    
    pauseRealTimeUpdates() {
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
        }
    }
    
    resumeRealTimeUpdates() {
        this.startRealTimeUpdates();
        this.refreshStats();
    }
    
    async refreshStats() {
        try {
            const response = await this.apiRequest('/stats');
            if (response.ok) {
                const stats = await response.json();
                this.setState({ stats });
            }
        } catch (error) {
            console.warn('Failed to refresh stats:', error);
        }
    }
    
    async refreshData() {
        await this.loadLeagues(false); // Force refresh without cache
    }
    
    setFilter(filter) {
        this.setState({
            currentFilter: filter,
            filteredLeagues: this.filterLeagues(this.state.leagues, filter)
        });
        
        this.updateFilterUI(filter);
    }
    
    filterLeagues(leagues, filter) {
        const searchQuery = this.state.searchQuery.toLowerCase();
        
        let filtered = leagues.filter(league => {
            // Search filter
            if (searchQuery) {
                const matchesSearch = 
                    league.name?.toLowerCase().includes(searchQuery) ||
                    league.country?.toLowerCase().includes(searchQuery) ||
                    league.description?.toLowerCase().includes(searchQuery);
                if (!matchesSearch) return false;
            }
            
            // Category filter
            switch (filter) {
                case 'active':
                    return league.status === 'ACTIVE';
                case 'england':
                    return league.country?.toLowerCase() === 'england';
                case 'spain':
                    return league.country?.toLowerCase() === 'spain';
                case 'germany':
                    return league.country?.toLowerCase() === 'germany';
                case 'italy':
                    return league.country?.toLowerCase() === 'italy';
                case 'france':
                    return league.country?.toLowerCase() === 'france';
                default:
                    return true;
            }
        });
        
        // Sort by relevance and activity
        return filtered.sort((a, b) => {
            // Active leagues first
            if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
            if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
            
            // Then by total teams (more teams = more popular)
            const aTeams = parseInt(a.totalTeams) || 0;
            const bTeams = parseInt(b.totalTeams) || 0;
            if (aTeams !== bTeams) return bTeams - aTeams;
            
            // Finally by name
            return a.name?.localeCompare(b.name) || 0;
        });
    }
    
    updateFilterUI(activeFilter) {
        const filterConfig = {
            'all': 'all-filter',
            'active': 'active-filter',
            'england': 'england-filter',
            'spain': 'spain-filter',
            'germany': 'germany-filter',
            'italy': 'italy-filter',
            'france': 'france-filter'
        };
        
        Object.entries(filterConfig).forEach(([filter, elementId]) => {
            const element = this.elements[elementId];
            if (element) {
                if (filter === activeFilter) {
                    element.className = 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg';
                } else {
                    element.className = 'px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all duration-200';
                }
            }
        });
    }
    
    setViewMode(mode) {
        this.setState({ currentView: mode });
        
        const grid = this.elements['leagues-grid'];
        if (!grid) return;
        
        if (mode === 'grid') {
            grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500';
            this.updateViewButton('grid-view', true);
            this.updateViewButton('list-view', false);
        } else {
            grid.className = 'space-y-6 transition-all duration-500';
            this.updateViewButton('grid-view', false);
            this.updateViewButton('list-view', true);
        }
    }
    
    updateViewButton(buttonId, isActive) {
        const button = this.elements[buttonId];
        if (button) {
            button.className = isActive
                ? 'px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200'
                : 'px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-medium transition-all duration-200';
        }
    }
    
    async performSearch() {
        const query = this.elements['search-input']?.value?.trim() || '';
        
        this.setState({
            searchQuery: query,
            filteredLeagues: this.filterLeagues(this.state.leagues, this.state.currentFilter)
        });
        
        // If search query is provided, also search server-side for more results
        if (query) {
            try {
                const response = await this.apiRequest(`/leagues/search?query=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const searchResults = await response.json();
                    // Merge with existing results, removing duplicates
                    const merged = this.mergeLeagues(this.state.leagues, searchResults);
                    this.setState({
                        leagues: merged,
                        filteredLeagues: this.filterLeagues(merged, this.state.currentFilter)
                    });
                }
            } catch (error) {
                console.warn('Server-side search failed:', error);
            }
        }
    }
    
    mergeLeagues(existing, newLeagues) {
        const existingIds = new Set(existing.map(l => l.id));
        const merged = [...existing];
        
        newLeagues.forEach(league => {
            if (!existingIds.has(league.id)) {
                merged.push(league);
            }
        });
        
        return merged;
    }
    
    renderLeagues(leagues) {
        const grid = this.elements['leagues-grid'];
        if (!grid) return;
        
        if (leagues.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        leagues.forEach(league => {
            const cardElement = this.createLeagueCardElement(league);
            fragment.appendChild(cardElement);
        });
        
        grid.innerHTML = '';
        grid.appendChild(fragment);
    }
    
    createLeagueCardElement(league) {
        const card = document.createElement('div');
        card.className = 'league-card bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl';
        card.dataset.leagueId = league.id;
        
        card.innerHTML = this.createLeagueCardHTML(league);
        
        // Setup lazy loading for images
        const images = card.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.intersectionObserver.observe(img);
        });
        
        return card;
    }
    
    createLeagueCardHTML(league) {
        const safeName = this.escapeHtml(league.name || 'Unknown League');
        const safeCountry = this.escapeHtml(league.country || 'Unknown');
        const safeDescription = this.escapeHtml(league.description || 'No description available');
        const totalTeams = parseInt(league.totalTeams) || 1;
        const foundedYear = parseInt(league.foundedYear) || 'N/A';
        const seasonStart = this.escapeHtml(league.seasonStart || 'TBD');
        const seasonEnd = this.escapeHtml(league.seasonEnd || 'TBD');
        const status = league.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
        
        const logoUrl = league.logoUrl || this.generateLogoSvg(safeName);
        const bannerUrl = league.bannerUrl || this.generateBannerSvg(safeName);
        
        return `
            <div class="relative">
                <div class="league-banner h-48 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden" 
                     style="background-image: url('${bannerUrl}'); background-size: cover; background-position: center;">
                    <div class="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div class="absolute bottom-4 left-4 right-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                <img data-src="${logoUrl}" 
                                     alt="${safeName} logo" 
                                     class="w-8 h-8 object-contain"
                                     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' fill='%23d1d5db'/%3E%3C/svg%3E"
                                     onerror="this.src='${logoUrl}'">
                            </div>
                            <div class="min-w-0 flex-1">
                                <h3 class="text-xl font-bold text-white truncate drop-shadow-lg">${safeName}</h3>
                                <p class="text-blue-100 text-sm truncate drop-shadow">${safeCountry}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-6">
                <div class="mb-4">
                    <p class="text-gray-600 text-sm line-clamp-3">${safeDescription}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center p-3 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${totalTeams.toLocaleString()}</div>
                        <div class="text-xs text-gray-500">Teams</div>
                    </div>
                    <div class="text-center p-3 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">${foundedYear}</div>
                        <div class="text-xs text-gray-500">Founded</div>
                    </div>
                </div>
                
                <div class="space-y-2 mb-6">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Season:</span>
                        <span class="font-medium">${seasonStart} - ${seasonEnd}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">Status:</span>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${status === 'ACTIVE' ? 'bg-green-100 text-green-800 animate-pulse' : 'bg-gray-100 text-gray-800'}">
                            ${status}
                        </span>
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="leaguesManager.viewLeagueDetails(${league.id})" 
                            class="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Details
                        </span>
                    </button>
                    <button onclick="leaguesManager.viewLeagueEvents(${league.id})" 
                            class="px-4 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Events
                        </span>
                    </button>
                </div>
            </div>
        `;
    }
    
    async viewLeagueDetails(leagueId) {
        if (!leagueId) {
            this.setState({ error: 'Invalid league ID' });
            return;
        }
        
        try {
            const buttons = document.querySelectorAll(`[data-league-id="${leagueId}"] button`);
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.classList.add('loading');
            });
            
            const [leagueResponse, eventCountResponse, recentEventsResponse] = await Promise.allSettled([
                this.apiRequest(`/leagues/${leagueId}`),
                this.apiRequest(`/leagues/${leagueId}/events/count`),
                this.apiRequest(`/leagues/${leagueId}/events/recent?limit=5`)
            ]);
            
            if (leagueResponse.status === 'rejected' || !leagueResponse.value.ok) {
                throw new Error('Failed to fetch league details');
            }
            
            const league = await leagueResponse.value.json();
            
            let eventCount = 0;
            if (eventCountResponse.status === 'fulfilled' && eventCountResponse.value.ok) {
                const eventCountData = await eventCountResponse.value.json();
                eventCount = eventCountData.eventCount || 0;
            }
            
            let recentEvents = [];
            if (recentEventsResponse.status === 'fulfilled' && recentEventsResponse.value.ok) {
                recentEvents = await recentEventsResponse.value.json();
            }
            
            this.createLeagueModal(league, eventCount, recentEvents);
            
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('loading');
            });
            
        } catch (error) {
            console.error('Error fetching league details:', error);
            this.setState({ error: `Failed to load league details: ${error.message}` });
            
            const buttons = document.querySelectorAll(`[data-league-id="${leagueId}"] button`);
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('loading');
            });
        }
    }
    
    viewLeagueEvents(leagueId) {
        if (!leagueId) {
            this.setState({ error: 'Invalid league ID' });
            return;
        }
        window.location.href = `events.html?league=${leagueId}`;
    }
    
    createLeagueModal(league, eventCount, recentEvents = []) {
        const safeName = this.escapeHtml(league.name || 'Unknown League');
        const safeCountry = this.escapeHtml(league.country || 'Unknown');
        const safeDescription = this.escapeHtml(league.description || 'No description available');
        const logoUrl = league.logoUrl || this.generateLogoSvg(safeName);
        const bannerUrl = league.bannerUrl || this.generateBannerSvg(safeName);
        
        const recentEventsHTML = recentEvents.length > 0 
            ? recentEvents.map(event => `
                <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                        <div class="font-medium text-sm">${this.escapeHtml(event.title || 'Untitled Event')}</div>
                        <div class="text-xs text-gray-500">${this.formatDate(event.date)}</div>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'LIVE' ? 'bg-red-100 text-red-800 animate-pulse' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${event.status || 'SCHEDULED'}
                    </span>
                </div>
            `).join('')
            : '<div class="text-gray-500 text-sm text-center py-4">No recent events</div>';
        
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop" style="animation: fadeIn 0.3s ease-out;">
                <div class="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style="animation: slideUp 0.3s ease-out;">
                    <div class="relative">
                        <div class="league-banner h-64 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden" 
                             style="background-image: url('${bannerUrl}'); background-size: cover; background-position: center;">
                            <div class="absolute inset-0 bg-black bg-opacity-40"></div>
                            <div class="absolute bottom-6 left-6 right-6">
                                <div class="flex items-center space-x-4">
                                    <div class="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <img src="${logoUrl}" 
                                             alt="${safeName} logo" 
                                             class="w-12 h-12 object-contain"
                                             onerror="this.src='${this.generateLogoSvg(safeName)}'">
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <h2 class="text-3xl font-bold text-white truncate drop-shadow-lg">${safeName}</h2>
                                        <p class="text-blue-100 text-lg truncate drop-shadow">${safeCountry}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onclick="leaguesManager.closeModal()" 
                                class="absolute top-4 right-4 text-white hover:text-gray-200 p-2 rounded-full hover:bg-black hover:bg-opacity-20 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <!-- League Information -->
                            <div class="lg:col-span-2">
                                <h3 class="text-xl font-semibold mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    League Information
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-blue-600">${league.foundedYear || 'N/A'}</div>
                                        <div class="text-sm text-gray-600">Founded</div>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-green-600">${(league.totalTeams || 0).toLocaleString()}</div>
                                        <div class="text-sm text-gray-600">Total Teams</div>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-purple-600" id="modal-event-count">${eventCount.toLocaleString()}</div>
                                        <div class="text-sm text-gray-600">Total Events</div>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="flex items-center">
                                            <span class="px-3 py-1 rounded-full text-sm font-medium ${
                                                league.status === 'ACTIVE' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }">
                                                ${league.status || 'INACTIVE'}
                                            </span>
                                        </div>
                                        <div class="text-sm text-gray-600 mt-1">Status</div>
                                    </div>
                                </div>
                                
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span class="text-gray-600 font-medium">Season Duration:</span>
                                        <span class="font-medium">${league.seasonStart || 'TBD'} - ${league.seasonEnd || 'TBD'}</span>
                                    </div>
                                    <div class="pt-2">
                                        <span class="text-gray-600 font-medium">Description:</span>
                                        <p class="text-gray-700 leading-relaxed mt-2">${safeDescription}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Recent Events -->
                            <div>
                                <h3 class="text-xl font-semibold mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    Recent Events
                                </h3>
                                <div class="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                                    ${recentEventsHTML}
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3 pt-4 border-t border-gray-200">
                            <button onclick="leaguesManager.viewLeagueEvents(${league.id})" 
                                    class="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                <span class="flex items-center justify-center">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    View All Events
                                </span>
                            </button>
                            <button onclick="leaguesManager.closeModal()" 
                                    class="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup focus management and keyboard navigation
        const modal = document.querySelector('.modal-backdrop');
        this.setupModalFocusTrap(modal);
        
        // Setup real-time event count updates for this modal
        this.setupModalRealTimeUpdates(league.id);
    }
    
    setupModalFocusTrap(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (firstFocusable) firstFocusable.focus();
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    setupModalRealTimeUpdates(leagueId) {
        // Listen for WebSocket updates specific to this league
        const originalHandler = this.handleWebSocketMessage.bind(this);
        this.handleWebSocketMessage = (data) => {
            originalHandler(data);
            
            // Update modal event count if it matches the current league
            if (data.type === 'event_count_update' && data.payload.leagueId === leagueId) {
                const eventCountElement = document.getElementById('modal-event-count');
                if (eventCountElement) {
                    eventCountElement.textContent = data.payload.eventCount.toLocaleString();
                    // Add a subtle animation to indicate update
                    eventCountElement.classList.add('animate-pulse');
                    setTimeout(() => {
                        eventCountElement.classList.remove('animate-pulse');
                    }, 1000);
                }
            }
        };
    }
    
    closeModal() {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        // Restore original WebSocket handler
        this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);
    }
    
    updateStatsDisplay(stats) {
        const elements = {
            'total-leagues': stats.totalLeagues,
            'active-leagues': stats.activeLeagues,
            'total-teams': stats.totalTeams,
            'total-events': stats.totalEvents
        };
        
        Object.entries(elements).forEach(([elementId, value]) => {
            const element = this.elements[elementId];
            if (element && element.textContent !== value.toLocaleString()) {
                // Animate the change
                element.style.transform = 'scale(1.1)';
                element.style.color = '#3B82F6';
                element.textContent = value.toLocaleString();
                
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.color = '';
                }, 300);
            }
        });
    }
    
    toggleLoading(isLoading) {
        const loadingState = this.elements['loading-state'];
        const grid = this.elements['leagues-grid'];
        
        if (isLoading) {
            loadingState?.classList.remove('hidden');
            grid?.classList.add('hidden');
        } else {
            loadingState?.classList.add('hidden');
            grid?.classList.remove('hidden');
        }
    }
    
    showError(message) {
        if (!message) return;
        
        const errorState = this.elements['error-state'];
        if (errorState) {
            const errorElement = errorState.querySelector('.text-red-600');
            if (errorElement) errorElement.textContent = message;
            errorState.classList.remove('hidden');
        }
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            if (errorState) {
                errorState.classList.add('hidden');
            }
        }, 5000);
    }
    
    showEmptyState() {
        const emptyState = this.elements['empty-state'];
        const grid = this.elements['leagues-grid'];
        
        emptyState?.classList.remove('hidden');
        grid?.classList.add('hidden');
    }
    
    hideEmptyState() {
        const emptyState = this.elements['empty-state'];
        const grid = this.elements['leagues-grid'];
        
        emptyState?.classList.add('hidden');
        grid?.classList.remove('hidden');
    }
    
    // Utility methods
    async apiRequest(endpoint, options = {}) {
        const url = `${this.API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: this.getDefaultHeaders(),
            credentials: 'same-origin',
            ...options
        };
        
        const response = await fetch(url, defaultOptions);
        
        // Handle rate limiting
        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After') || '5';
            await this.delay(parseInt(retryAfter) * 1000);
            return this.apiRequest(endpoint, options);
        }
        
        return response;
    }
    
    getDefaultHeaders() {
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${this.getAuthToken()}`
        };
    }
    
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }
    
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString || 'TBD';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    generateLogoSvg(name) {
        const initial = name.charAt(0).toUpperCase();
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
        const color = colors[name.length % colors.length];
        
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${color};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:${color}90;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='40' cy='40' r='35' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='28' font-family='Arial, sans-serif' font-weight='bold'%3E${initial}%3C/text%3E%3C/svg%3E`;
    }
    
    generateBannerSvg(name) {
        const colors = ['#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];
        const color1 = colors[name.length % colors.length];
        const color2 = colors[(name.length + 1) % colors.length];
        
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 300'%3E%3Cdefs%3E%3ClinearGradient id='bgGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${color1};stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:${color2};stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='300' fill='url(%23bgGrad)'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='36' font-family='Arial, sans-serif' font-weight='bold' opacity='0.8'%3E${encodeURIComponent(name)}%3C/text%3E%3C/svg%3E`;
    }
    
    // Cleanup method
    destroy() {
        this.closeWebSocket();
        this.pauseRealTimeUpdates();
        
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.cache.clear();
        clearTimeout(this.searchTimeout);
    }
}

// Enhanced CSS with animations and transitions
const advancedStyles = document.createElement('style');
advancedStyles.textContent = `
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .league-card {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
    }
    
    .league-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .loading {
        position: relative;
        pointer-events: none;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: inherit;
    }
    
    .loading::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid #3B82F6;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 1;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
        from { 
            opacity: 0; 
            transform: scale(0.95);
        }
        to { 
            opacity: 1; 
            transform: scale(1);
        }
    }
    
    @keyframes fadeOut {
        from { 
            opacity: 1; 
            transform: scale(1);
        }
        to { 
            opacity: 0; 
            transform: scale(0.95);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .modal-backdrop {
        backdrop-filter: blur(4px);
    }
    
    .league-banner {
        background-blend-mode: overlay;
    }
    
    /* Smooth scrolling */
    html {
        scroll-behavior: smooth;
    }
    
    /* Custom scrollbar for modal */
    .modal-backdrop ::-webkit-scrollbar {
        width: 8px;
    }
    
    .modal-backdrop ::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
    }
    
    .modal-backdrop ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    
    .modal-backdrop ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
    
    /* Pulse animation for real-time updates */
    .animate-pulse {
        animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .8; transform: scale(1.05); }
    }
`;

document.head.appendChild(advancedStyles);

// Initialize the application
let leaguesManager;

document.addEventListener('DOMContentLoaded', function() {
    leaguesManager = new FootballLeaguesManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (leaguesManager) {
        leaguesManager.destroy();
    }
});

// Export for global access (if needed)
window.FootballLeaguesManager = FootballLeaguesManager;